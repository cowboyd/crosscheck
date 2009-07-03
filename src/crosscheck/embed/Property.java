package crosscheck.embed;

import org.mozilla.javascript.*;

public abstract class Property {

	public static final ReadOnly READ_ONLY = new ReadOnly();
	public static final ReadWrite READ_WRITE = new ReadWrite();

	public abstract Object get(String name, Scriptable start);

	public abstract void set(String name, Scriptable start, Object value);

	public static class Constant extends Property {
		private Object value;

		public Constant(Object value) {
			this.value = value;
		}

		@Override
		public Object get(String name, Scriptable start) {
			return this.value;
		}

		@Override
		public void set(String name, Scriptable start, Object value) {
			//it's constant, do nothing
		}
	}

	public static class Alias extends Property {
		private Property reference;
		private String refname;

		public Alias(String refname, Property reference) {
			this.refname = refname;
			this.reference = reference;
		}

		@Override
		public Object get(String name, Scriptable start) {
			return this.reference.get(this.refname, start);
		}

		@Override
		public void set(String name, Scriptable start, Object value) {
			this.reference.set(this.refname, start, value);
		}
	}

	public static class ReadOnly extends Property {
		@Override
		public Object get(String name, Scriptable start) {
			if (start instanceof Instance) {
				Instance instance = (Instance) start;
				Scriptable pi = instance.getPrivate();
				return ScriptableObject.getProperty(pi, name);
			} else {
				return ScriptableObject.NOT_FOUND;
			}
		}

		@Override
		public void set(String name, Scriptable start, Object value) {
			//this is readonly, no setting.
		}
	}

	public static class ReadWrite extends ReadOnly {
		@Override
		public void set(String name, Scriptable start, Object value) {
			if (start instanceof Instance) {
				Instance i = (Instance) start;
				Scriptable pi = i.getPrivate();
				pi.put(name, pi, value);
			}
		}
	}

	public static class Getter extends Property {
		private Function getter;

		public Getter(Function getter) {
			this.getter = getter;
		}

		@Override
		public Object get(String name, Scriptable start) {
			return call(getter, start);
		}

		@Override
		public void set(String name, Scriptable start, Object value) {
			//do nothing, this is a readonly property
		}

		protected Object call(Function f, Scriptable thisObj, Object... args) {
			return f.call(cxt(), f.getParentScope(), thisObj, args);
		}

		protected Context cxt() {
			return (Context) new ContextFactory().call(new ContextAction() {
				public Object run(Context cx) {
					return cx;
				}
			});
		}

	}

	public static class Accessor extends Getter {
		private Function setter;

		public Accessor(Function getter, Function setter) {
			super(getter);
			this.setter = setter;
		}

		@Override
		public void set(String name, Scriptable start, Object value) {
			this.setter.call(cxt(), this.setter.getParentScope(), start, new Object[] {value});
		}


	}
}
