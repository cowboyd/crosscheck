package crosscheck.embed;

import org.mozilla.javascript.*;

import java.util.HashMap;

public class Prototype extends ScriptableObject {

	private static final Function NOOP = new BaseFunction(new BaseFunction(), new BaseFunction());

	Function initializer;
	HashMap<String, Property> properties;
	private Scriptable prv;
	private Builder builder;
	private Function lookupIndex;

	public Prototype(Context cx, Scriptable scope, Scriptable parent, Scriptable privateparent) {
		this.setParentScope(scope);
		if (parent == null) {
			parent = cx.newObject(scope);
			privateparent = cx.newObject(scope);
		}
		this.setPrototype(parent);
		this.initializer = new BaseFunction();
		this.properties = new HashMap<String, Property>();
		this.prv = cx.newObject(scope);
		this.prv.setPrototype(privateparent);
		this.builder = new Builder(this);
		this.lookupIndex = NOOP;
	}

	public void setInitializer(Function initializer) {
		this.initializer = new Method(initializer, new NextInializer(this));
	}

	public Object initialize(Context cx, Scriptable scope, Scriptable thisObj, Object[] args) {
		return this.initializer.call(cx, scope, thisObj, args);
	}

	public Builder getBuilder() {
		return builder;
	}

	@Override
	public String getClassName() {
		return "Native.prototype";
	}

	@Override
	public boolean has(String name, Scriptable start) {
		return this.properties.containsKey(name) || super.has(name, start);
	}

	@Override
	public Object get(String name, Scriptable start) {
		if (this.has(name, start)) {
			return this.properties.get(name).get(name, start);
		} else {
			return super.get(name, start);
		}
	}

	@Override
	public Object get(final int index, final Scriptable start) {
		return new ContextFactory().call(new ContextAction() {
			public Object run(Context cx) {
				return lookupIndex.call(cx, lookupIndex.getParentScope(), start, new Object[] {index});
			}
		});
	}

	@Override
	public void put(String name, Scriptable start, Object value) {
		this.properties.get(name).set(name, start, value);
	}

	public Scriptable getPrivate() {
		return prv;
	}

	public void addPrivate(String name, final Function body) {
		prv.put(name, prv, new BaseFunction() {
			public Object call(Context cx, Scriptable scope, Scriptable thisObj, Object[] args) {
				return body.call(cx, scope, ((Instance.Private)thisObj).getPublic(), args);
			}
		});
	}

	private class NextInializer extends BaseFunction {
		private Prototype prototype;

		public NextInializer(Prototype prototype) {
			this.prototype = prototype;
		}

		@Override
		public Object call(Context cx, Scriptable scope, Scriptable thisObj, Object[] args) {
			Scriptable parent = prototype.getPrototype();
			if (parent instanceof Prototype) {
				Prototype next = (Prototype)parent;
				next.initialize(cx, scope, thisObj, args);
			}
			return null;
		}
	}

	public static class Builder {

		Prototype prototype;

		public Builder(Prototype prototype) {
			this.prototype = prototype;
		}

		public void initializer(Function initializer) {
			this.prototype.setInitializer(initializer);
		}

		public void attrReadOnly(String... names) {
			for (String name : names) {
				add(name, Property.READ_ONLY);
			}
		}

		public void attrReadOnly(String name, Function getter) {
			add(name, new Property.Getter(getter));

		}

		public void attrReadWrite(String... names) {
			for (String name: names) {
				add(name, Property.READ_WRITE);
			}
		}


		private void add(String name, Property property) {
			this.prototype.properties.put(name, property);
		}

		public void attrReadWrite(String name, Scriptable accessor) {
			Object get = accessor.get("get", accessor);
			Object set = accessor.get("set", accessor);
			Function getter = null, setter = null;
			if (get != null && get instanceof Function) {
				getter = (Function) get;
			}
			if (set != null && set instanceof Function) {
				setter = (Function) set;
			}
			if (getter == null) {
				throw new IllegalArgumentException("no function property 'get' in accessor for attribute '" + name + "'");
			}
			if (setter == null) {
				throw new IllegalArgumentException("no function property 'set' in accessor for attribute '" + name + "'");
			}
			add(name, new Property.Accessor(getter, setter));
		}


		public void constant(String name, final Object c) {
			final Object value;
			if (c instanceof Function) {
				value = new Method(name, (Function)c, this.prototype.getPrototype());
			} else {
				value = c;
			}
			add(name, new Property.Constant(value));
		}

		public void constants(Scriptable constants) {
			for (Object id : constants.getIds()) {
				if (id instanceof String) {
					String name = (String) id;
					Object value = constants.get(name, constants);
					this.constant(name, value);
				}
			}

		}

		public void method(String name, Function body) {
			constant(name, body);
		}

		public void methods(Scriptable methods) {
			constants(methods);
		}

		public void privateMethod(String name, Function body) {
			this.prototype.addPrivate(name, body);
		}
		public void privateMethods(Scriptable methods) {
			for (Object id : methods.getIds()) {
				if (id instanceof String) {
					String name = (String) id;
					Object value = methods.get(name, methods);
					if (value instanceof Function) {
						Function body = (Function) value;
						this.privateMethod(name, body);
					}
				}
			}
		}

		public void alias(String name, final String... aliases) {
			Property property = this.prototype.properties.get(name);
			if (property == null) {
				throw new IllegalArgumentException("cannoct create alias to non existent property '" + name + "'");
			}
			for (String alias : aliases) {
				this.prototype.properties.put(alias, new Property.Alias(name, property));
			}
		}

		public void indexedLookup(Function getter) {
			this.prototype.lookupIndex = getter;
		}

		public void deleteAttr(String... names) {
			for (String name : names) {
				this.prototype.properties.remove(name);
			}
		}
	}
}
