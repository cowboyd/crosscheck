package crosscheck.embed;

import org.mozilla.javascript.*;

public class Constructor extends BaseFunction {
	private Prototype prototype;

	public Constructor(Context cx, Scriptable scope) {
		this(cx, scope, new BaseFunction());
	}

	public Constructor(Context cx, Scriptable scope, Function definition) {
		this(cx, scope, definition, null);
	}

	public Constructor(Context cx, Scriptable scope, Function definition, Constructor parent) {
		Prototype parentproto = null;
		Scriptable parentprivateproto = null;
		if (parent != null) {
			parentproto = parent.prototype;
			parentprivateproto = parent.prototype.getPrivate();
		}
		this.setPrototype(ScriptableObject.getFunctionPrototype(scope));
		this.prototype = new Prototype(cx, scope, parentproto, parentprivateproto);
		this.put("prototype", this, this.prototype);
		definition.call(cx, scope, new NativeJavaObject(scope, this.prototype.getBuilder(), Prototype.Builder.class, true), new Object[] {PRIVATE_ACCESSOR});
	}

	@Override
	public Object call(Context cx, Scriptable scope, Scriptable thisObj, Object[] args) {
		return this.prototype.initialize(cx, scope, thisObj, args);
	}

	@Override
	public Scriptable construct(Context cx, Scriptable scope, Object[] args) {
		Instance instance = new Instance(scope, this.prototype);
		this.call(cx, scope, instance, args);
		return instance;
	}


	private static Function PRIVATE_ACCESSOR = new BaseFunction() {
		@Override
		public Object call(Context cx, Scriptable scope, Scriptable thisObj, Object[] args) {
			if (args.length > 0) {
				Object instance = args[0];
				if (!(instance instanceof Instance)) {
					throw new IllegalArgumentException("tried to call accessor function on non builtin object");
				}
				Scriptable prv = ((Instance) instance).getPrivate();
				if (args.length > 1) {
					Scriptable properties = (Scriptable) args[1];
					for (int i = 0; i < properties.getIds().length; i++) {
						Object id = properties.getIds()[i];
						if (id instanceof String) {
							prv.put((String)id, prv, properties.get((String)id, properties));
						}
					}
				}
				return prv;
			} else {
				return null;
			}
		}
	};

	public static class Builder extends BaseFunction {

		@Override
		public Object call(Context cx, Scriptable scope, Scriptable thisObj, Object[] args) {
			Constructor c;
			if (args.length == 1 && args[0] instanceof Function) {
				c = new Constructor(cx, scope, (Function)args[0]);
			} else if (args.length == 2 && args[0] instanceof Constructor && args[1] instanceof Function) {
				Constructor parent = (Constructor) args[0];
				Function body = (Function) args[1];
				c = new Constructor(cx, scope, body, parent);
			} else {
				c = new Constructor(cx, scope);
			}
			return c;
		}


	}

	public static class Extender extends BaseFunction {
		@Override
		public Object call(Context cx, Scriptable scope, Scriptable thisObj, Object[] args) {
			if (args.length >= 2) {
				Constructor constructor;
				Callable definition;
				if (args[0] instanceof Constructor) {
					constructor = (Constructor) args[0];
				} else {
					throw new IllegalArgumentException("cannot extend a non-native constructor");
				}
				if (args[1] instanceof Function) {
					definition = (Callable) args[1];
				} else {
					throw new IllegalArgumentException("must pass a function to extend a constructor");
				}
				Prototype.Builder builder = new Prototype.Builder(constructor.prototype);
				definition.call(cx, scope, new NativeJavaObject(scope, builder, builder.getClass()), new Object[] {PRIVATE_ACCESSOR});
			}
			return ScriptableObject.NOT_FOUND;
		}
	}
}
