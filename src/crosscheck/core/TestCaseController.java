package crosscheck.core;

import crosscheck.*;
import crosscheck.js.assertions;
import org.mozilla.javascript.*;


public class TestCaseController implements Test {

	private String name;
	private Scriptable prototype;
	private ScriptCache scripts;

	public TestCaseController(String name, Scriptable prototype, ScriptCache scripts) {
		this.name = name;
		this.prototype = prototype;
		this.scripts = scripts;
	}

	public String getName() {
		return this.name;
	}

	public void run(final TestListener listener, final Host host) {
		new ContextFactory().call(new ContextAction() {
			public Object run(Context cx) {
				doRun(cx, listener, host);
				return null;
			}
		});
	}

	private void doRun(Context cx, TestListener listener, Host host) {
		Bridge bridge = new Bridge(scripts);
		Function impl = (Function) bridge.get("run");
		for (Object id : this.prototype.getIds()) {
			if (id instanceof String) {
				Object object = this.prototype.get((String) id, this.prototype);
				if (object instanceof Scriptable) {//could be undefined, which is not scriptable.
					Scriptable member = (Scriptable) object;
					if (member instanceof Function) {
						member.setParentScope(bridge.getTopLevelScope());
					}
				}
			}
		}
		try {
			bridge.exec(assertions.class);
			bridge.exec(host);
			impl.call(cx, bridge.getTopLevelScope(), bridge.getInternalScope(), new Object[] {listener, host, this, this.name, this.prototype});
		} catch (RhinoException e) {
			ExceptionResult result = new ExceptionResult(host, e);
			if (result.isFailure()) {
				listener.failure(result);
			} else {
				listener.error(result);
			}
		}
	}

	private class ExceptionResult implements TestResult {
		private Host host;
		private RhinoException exception;

		public ExceptionResult(Host host, RhinoException exception) {
			this.host = host;
			this.exception = exception;
		}

		public boolean isOk() {
			return false;
		}

		public boolean isError() {
			return !this.isFailure();
		}

		public boolean isFailure() {
			if (this.exception instanceof JavaScriptException) {
				JavaScriptException jsEx = (JavaScriptException) this.exception;
				boolean isScriptable = jsEx.getValue() instanceof Scriptable;
				Scriptable value = isScriptable ? (Scriptable) jsEx.getValue() : null;
				return isScriptable && value.has("assertionFailure", value);
			}
			return false;
		}

		public Test getTest() {
			return TestCaseController.this;
		}

		public String getMessage() {
			if (this.isFailure()) {
				Scriptable failure = (Scriptable) ((JavaScriptException) this.exception).getValue();
				return (String) failure.get("message", failure);
			} else {
				return this.exception.getMessage();
			}
		}

		public String getStack() {
			return this.exception.getScriptStackTrace();
		}

		public Host getHost() {
			return this.host;
		}


	}
}
