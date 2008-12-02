package crosscheck.core;

import crosscheck.js.bootstrap;
import crosscheck.js.host;
import org.mozilla.javascript.*;

import java.lang.reflect.Array;
import java.lang.reflect.InvocationTargetException;

public class Bridge {
	private Scriptable scope;
	private Scriptable internal;
	private ScriptCache scripts;

	public Bridge(ScriptCache scripts) {
		this.scripts = scripts;
		this.exec(bootstrap.class);
		Scriptable crosscheck = (Scriptable) this.scope.get("crosscheck", this.scope);
		this.internal = (Scriptable) crosscheck.get("internal", crosscheck);
		put("scripts", scripts);
		put("scope", this.scope);
		put("bridge", this);
	}

	public void execScriptClass(Class<? extends Script>... classes) throws IllegalAccessException, InstantiationException {
		for (Class<? extends Script> cls : classes) {
			Script script = cls.newInstance();
			exec(script);
		}
	}

	public Scriptable getTopLevelScope() {
		return this.scope;
	}

	public void put(String key, Object value) {
		this.internal.put(key, this.internal, value);
	}

	@SuppressWarnings("unchecked")
	public <T> T[] getArray(String key, Class<? extends T> type) {
		NativeArray jsArray = (NativeArray) this.get(key);
		T[] array = (T[]) Array.newInstance(type, (int) jsArray.getLength());
		for (int i = 0; i < array.length; i++) {
			array[i] = (T) unwrap(jsArray.get(i, jsArray));
		}
		return array;
	}

	public Object get(String key) {
		return unwrap(this.internal.get(key, this.internal));
	}

	private Object unwrap(Object o) {
		if (o instanceof NativeJavaObject) {
			NativeJavaObject wrapper = (NativeJavaObject) o;
			return wrapper.unwrap();
		} else {
			return o;
		}
	}

	public void load(String fileName) {
		this.scripts.load(fileName, this.scope);
	}


	public Object exec(final Class<? extends Script> type) {
		try {
			return exec(type.newInstance());
		} catch (Exception e) {
			if (e instanceof RuntimeException) {
				throw (RuntimeException) e;
			} else {
				throw new RuntimeException(e);
			}
		}
	}

	public Object exec(final Script script) {
		return new ContextFactory().call(new ContextAction() {
			public Object run(Context cx) {
				if (scope == null) {
					scope = cx.initStandardObjects();
					try {
						ScriptableObject.defineClass(scope, CrosscheckMetaDef.class);
					} catch (Exception e) {
						if (e instanceof RuntimeException) {
							throw (RuntimeException) e;
						} else {
							throw new RuntimeException(e);
						}
					}
				}
				return script != null ? script.exec(cx, scope) : null;
			}
		});
	}

	public Scriptable getInternalScope() {
		return this.internal;
	}
}
