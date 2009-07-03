package crosscheck.embed;

import org.mozilla.javascript.*;

public class Method extends BaseFunction {
	private Function impl;
	private Scriptable nextProto;
	private Function nextFunction;
	private String name;

	public Method(Function impl, Function nextFunction) {
		this.impl = impl;
		this.nextFunction = nextFunction;
	}

	public Method(String name, Function impl, Scriptable nextPrototype) {
		super(impl.getParentScope(), impl.getPrototype());
		this.name = name;
		this.impl = impl;
		this.nextProto = nextPrototype;
	}


	@Override
	public Object call(Context cx, Scriptable scope, Scriptable thisObj, Object[] args) {
		Object[] params = args;
		String source = cx.decompileFunction(impl, 0).trim();
		if (source.startsWith("function ($super)") || source.startsWith("function ($super,")) {
			params = new Object[args.length + 1];
			System.arraycopy(args, 0, params, 1, params.length - 1);
			final Function next;
			if (nextFunction != null) {
				next = nextFunction;
			} else {
				Object o = this.nextProto.get(name, thisObj);
				if (o == null || o == ScriptableObject.NOT_FOUND || !(o instanceof Function)) {
					throw new IllegalStateException(o + " is not a valid value for super method of " + this.name);
				}
				next = (Function)o;
			}
			params[0] = new ChainedCall(thisObj, next);
		}
		return this.impl.call(cx, scope, thisObj, params);
	}

	private static class ChainedCall extends BaseFunction {
		private Function next;
		private Scriptable thisObj;

		ChainedCall(Scriptable thisObj, Function next) {
			this.thisObj = thisObj;
			this.next = next;
		}

		@Override
		public Object call(Context cx, Scriptable scope, Scriptable thisObj, Object[] args) {
			return this.next.call(cx, scope, this.thisObj, args);
		}
	}
}
