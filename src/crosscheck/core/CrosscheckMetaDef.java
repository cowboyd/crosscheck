package crosscheck.core;

import org.mozilla.javascript.*;

import java.util.HashMap;


public class CrosscheckMetaDef extends ScriptableObject implements Function {

	public static final Access ACCESS = new Access();
	private MetaClass superclass;
	private Function definition;
	private MetaClass metaclass;
	private boolean initialized;

	public CrosscheckMetaDef() {
	}

	public CrosscheckMetaDef(Object superclass, Function definition) {
		CrosscheckMetaDef def = null;
		if (superclass instanceof CrosscheckMetaDef) {
			def = (CrosscheckMetaDef) superclass;
			this.superclass = def.getMetaClass();
		} else if (superclass != null) {
			throw new IllegalArgumentException("host object extends non-host object(" + superclass + ")");
		}
		this.definition = definition;
		this.initialized = false;
		new ContextFactory().call(new ContextAction() {
			public Object run(Context cx) {
				if (!initialized) {
					initialized = true;
					Scriptable definitionScope = CrosscheckMetaDef.this.definition.getParentScope();
					metaclass = new MetaClass(definitionScope, CrosscheckMetaDef.this.superclass);
					CrosscheckMetaDef.this.definition.call(cx, definitionScope, ScriptRuntime.toObject(definitionScope, metaclass), new Object[]{ACCESS});
				}
				return null;  //To change body of implemented methods use File | Settings | File Templates.
			}
		});
	}

	public MetaClass getMetaClass() {
		return metaclass;
	}

	public String getClassName() {
		return "CrosscheckMetaDef";
	}

	public Object call(Context cx, Scriptable scope, Scriptable thisObj, Object[] args) {
		final MetaClass.Instance instance = (MetaClass.Instance) thisObj;
		return doConstruct(cx, scope, instance, instance.getMetaClass(), args);
	}

	public Object doConstruct(Context cx, Scriptable scope, final MetaClass.Instance instance, final MetaClass metaClass, Object[] args) {
		Function constructor = metaClass.getConstructor();
		if (constructor != null) {
			String source = cx.decompileFunction(constructor,  0).trim();
			Object[] params;
			if (source.startsWith("function ($super,") || source.startsWith("function ($super)")) {
				if (metaClass.getSuperclass() == null) {
					throw new RuntimeException("superclass call, but no superclass");
				}
				params = new Object[args.length + 1];
				params[0] = new BaseFunction(constructor.getParentScope(), constructor.getPrototype()) {
					@Override
					public Object call(Context cx, Scriptable scope, Scriptable thisObj, Object[] args) {
						return doConstruct(cx, scope, instance, metaClass.getSuperclass(), args);
					}
				};
				for (int i = 0; i < args.length; i++) {
					Object arg = args[i];
					params[i + 1] = arg;
				}
			} else {
				params = args;
			}
			constructor.call(cx, scope, instance, params);
		}
		return instance;
	}


	public Scriptable construct(Context cx, Scriptable scope, Object[] args) {
		return (Scriptable) call(cx, scope, this.metaclass.newInstance(scope), args);
	}


	public static class MetaClass {
		private Function constructor;
		private HashMap<Object, Attr> attrs = new HashMap<Object, Attr>();
		private Prototype prototype;
		private MetaClass privateInterface;
		private MetaClass superclass;

		public MetaClass() {
			this.prototype = new Prototype(this, new NativeObject());
		}

		public MetaClass getSuperclass() {
			return superclass;
		}

		public Prototype getPrototype() {
			return prototype;
		}

		public Instance newInstance(Scriptable scope) {
			Instance iface = this.privateInterface.newInstance(scope, null);
			Instance instance = newInstance(scope, iface);
			iface.setPublicInterface(instance);
			return instance;
		}

		private Instance newInstance(Scriptable scope, Scriptable privateInterface) {
			return new Instance(scope, this.prototype, privateInterface);
		}

		public MetaClass(Scriptable scope, MetaClass superclass) {
			this.superclass = superclass;
			this.privateInterface = new MetaClass();
			this.prototype = new Prototype(this, scope);
			if (this.superclass != null) {
				this.prototype.setPrototype(superclass.getPrototype());
				this.privateInterface.superclass = superclass.privateInterface;
				this.privateInterface.prototype.setPrototype(superclass.privateInterface.prototype);
			}
		}

		public void initializer(Function constructor) {
			this.constructor = constructor;
		}

		public void attrReadOnly(String... names) {
			for (String name : names) {
				attrs.put(name, new Attr(name, true));
			}
		}

		public void attrReadOnly(String name, Function getter) {
			attrs.put(name, new Attr(name, true, getter));
		}

		public void attrReadWrite(String... names) {
			for (String name : names) {
				attrs.put(name, new Attr(name, false));
			}
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
			attrs.put(name, new Attr(name, false, getter, setter));
		}

		public void attrAlias(String name, String... aliases) {
			for (String alias : aliases) {
				if (this.hasAttr(name)) {
					this.attrs.put(alias, new Alias(alias, this.attrs.get(name)));
				} else {
					throw new IllegalArgumentException("cannot create alias for non-existent attribute: '" + name + "'");
				}
			}
		}

		public void constant(String name, Object value) {
			attrs.put(name, new StaticAttr(name, value));
		}

		public void constants(Scriptable methods) {
			for (Object id : methods.getIds()) {
				if (id instanceof String) {
					String name = (String) id;
					Object value = methods.get(name, methods);
					this.constant(name, value);
				}
			}
		}

		public void method(String name, Scriptable method) {
			constant(name, method);
		}

		public void methods(Scriptable methods) {
			constants(methods);
		}

		public void privateMethod(String name, final Function body) {
			this.privateInterface.constant(name, new BaseFunction(body.getParentScope(), body.getPrototype()) {
				@Override
				public Object call(Context cx, Scriptable scope, Scriptable thisObj, Object[] args) {
					return body.call(cx, scope, ((Instance) thisObj).getPublicInterface(), args);
				}
			});
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

		public Function getConstructor() {
			return constructor;
		}

		public Object getAttrValue(String name, final Instance object) {
			return this.attrs.get(name).get(object);
		}

		public void setAttrValue(String name, final Instance object, final Object value) {
			this.attrs.get(name).set(object, value);
		}

		public boolean hasAttr(String name) {
			return this.attrs.get(name) != null;
		}


		private class Attr {
			protected String name;
			private boolean readOnly = true;
			private Function getter;
			private Function setter;

			public Attr(String name, boolean readOnly) {
				this(name, readOnly, null, null);
			}

			public Attr(String name, boolean readOnly, Function getter) {
				this(name, readOnly, getter, null);
			}

			public Attr(String name, boolean readOnly, Function getter, Function setter) {
				this.name = name;
				this.readOnly = readOnly;
				this.getter = getter;
				this.setter = setter;
			}

			public Object get(final Instance object) {
				if (getter != null) {
					return new ContextFactory().call(new ContextAction() {
						public Object run(Context cx) {
							return getter.call(cx, getter.getParentScope(), object, new Object[0]);
						}
					});
				} else {
					Scriptable pi = object.getPrivateInterface();
					return pi.get(this.name, pi);
				}
			}

			public void set(final Instance object, final Object value) {
				if (!readOnly) {
					if (setter != null) {
						new ContextFactory().call(new ContextAction() {
							public Object run(Context cx) {
								return setter.call(cx, setter.getParentScope(), object, new Object[]{value});
							}
						});
					} else {
						Scriptable pi = object.getPrivateInterface();
						pi.put(name, pi, value);
					}
				}
			}
		}

		private class StaticAttr extends Attr {
			private Object value;

			private StaticAttr(String name, Object value) {
				super(name, true);
				this.value = value;
			}

			@Override
			public Object get(Instance object) {
				return value;
			}

			@Override
			public void set(Instance object, Object value) {
				//do nothing
			}
		}

		private class Alias extends Attr {
			private Attr target;

			public Alias(String alias, Attr target) {
				super(alias, target.readOnly);
				this.target = target;
			}


			@Override
			public Object get(Instance object) {
				return this.target.get(object);
			}

			@Override
			public void set(Instance object, Object value) {
				this.target.set(object, value);
			}
		}

		public static class Prototype implements Scriptable {

			private static final Function TO_STRING = new BaseFunction() {
				@Override
				public Object call(Context cx, Scriptable scope, Scriptable thisObj, Object[] args) {
					return "[object " + thisObj.getClass().getSimpleName() + "@" + thisObj.hashCode() + "]";
				}
			};

			private MetaClass classdef;
			private Scriptable prototype;

			public Prototype(MetaClass classdef, Scriptable scope) {
				this.classdef = classdef;
				this.setParentScope(scope);
			}

			public MetaClass getMetaClass() {
				return this.classdef;
			}

			public String getClassName() {
				return "Host Prototype";
			}

			public Object get(String name, Scriptable start) {
				if (this.classdef.hasAttr(name)) {
					return this.classdef.getAttrValue(name, (Instance) start);
				} else if ("toString".equals(name) || "valueOf".equals(name)) {
					return TO_STRING;
				}
				return ScriptableObject.NOT_FOUND;
			}

			public Object get(int index, Scriptable start) {
//				System.out.println("CrosscheckMetaDef$Prototype.get");
				return null;
			}

			public boolean has(String name, Scriptable start) {
//				System.out.println("CrosscheckMetaDef$Prototype.has");
				return this.classdef.hasAttr(name);
			}

			public boolean has(int index, Scriptable start) {
//				System.out.println("CrosscheckMetaDef$Prototype.has");
				return false;  //To change body of implemented methods use File | Settings | File Templates.
			}

			public void put(String name, Scriptable start, Object value) {
//				System.out.println("CrosscheckMetaDef$Prototype.put");
				if (this.classdef.hasAttr(name)) {
					this.classdef.setAttrValue(name, (Instance) start, value);
				}
			}

			public void put(int index, Scriptable start, Object value) {
//				System.out.println("CrosscheckMetaDef$Prototype.put");
				//To change body of implemented methods use File | Settings | File Templates.
			}

			public void delete(String name) {
//				System.out.println("CrosscheckMetaDef$Prototype.delete");
				//To change body of implemented methods use File | Settings | File Templates.
			}

			public void delete(int index) {
//				System.out.println("CrosscheckMetaDef$Prototype.delete");
				//To change body of implemented methods use File | Settings | File Templates.
			}

			public Scriptable getPrototype() {
				return this.prototype;
			}

			public void setPrototype(Scriptable prototype) {
				this.prototype = prototype;
			}

			public Scriptable getParentScope() {
//				System.out.println("CrosscheckMetaDef$Prototype.getParentScope");
				return null;  //To change body of implemented methods use File | Settings | File Templates.
			}

			public void setParentScope(Scriptable parent) {
//				System.out.println("CrosscheckMetaDef$Prototype.setParentScope");
			}

			public Object[] getIds() {
//				System.out.println("CrosscheckMetaDef$Prototype.getIds");
				return new Object[0];  //To change body of implemented methods use File | Settings | File Templates.
			}

			public Object getDefaultValue(Class hint) {
//				System.out.println("CrosscheckMetaDef$Prototype.getDefaultValue");
				return hint.getSimpleName();
			}

			public boolean hasInstance(Scriptable instance) {
//				System.out.println("CrosscheckMetaDef$Prototype.hasInstance");
				return false;  //To change body of implemented methods use File | Settings | File Templates.
			}
		}

		public static class Instance extends ScriptableObject {
			private Scriptable privateInterface;
			private Scriptable publicInterface;
			private Prototype prototype;

			public Instance(Scriptable scope, Prototype prototype, Scriptable privateInterface) {
				super(scope, prototype);
				this.privateInterface = privateInterface;
				this.prototype = prototype;
			}

			public MetaClass getMetaClass() {
				return this.prototype.getMetaClass();
			}

			public String getClassName() {
				return "Host Instance";
			}

			public Scriptable getPrivateInterface() {
				return privateInterface;
			}

			public void setPrivateInterface(Scriptable privateInterface) {
				this.privateInterface = privateInterface;
			}

			public Scriptable getPublicInterface() {
				return publicInterface;
			}

			public void setPublicInterface(Scriptable publicInterface) {
				this.publicInterface = publicInterface;
			}
		}
	}


	public static class Access extends ScriptableObject implements Function {
		public String getClassName() {
			return "MetaObjectPrivateAccess";
		}

		public Object call(Context cx, Scriptable scope, Scriptable thisObj, Object[] args) {
//			System.out.println("CrosscheckMetaDef$Access.call(" + args[0] + ")");
			if (args.length == 0) {
				return null;
			} else {
				Scriptable object = (Scriptable) args[0];
				if (object instanceof MetaClass.Instance) {
					MetaClass.Instance o = (MetaClass.Instance) object;
					Scriptable iface = o.getPrivateInterface();
					if (args.length > 1) {
						Scriptable values = (Scriptable) args[1];
						for (Object id : values.getIds()) {
							if (id instanceof String) {
								String key = (String) id;
								Object value = values.get(key, values);
								iface.put(key, iface, value);
							}
						}
					}
					return iface;
				} else {
					return UniqueTag.NOT_FOUND;
				}
			}
		}

		public Scriptable construct(Context cx, Scriptable scope, Object[] args) {
			throw new RuntimeException("illegal access");
		}
	}

}
