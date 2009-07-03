package crosscheck.embed;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

public class Instance extends ScriptableObject {
	private Scriptable privateInterface;

	public Instance(Scriptable scope, Prototype prototype) {
		super(scope, prototype);
		this.privateInterface = new Private(this, scope, prototype);
	}

	public Scriptable getPrivate() {
		return privateInterface;
	}

	@Override
	public String getClassName() {
		return "Instance";
	}

	public static class Private extends ScriptableObject {
		private Instance instance;

		public Private(Instance instance, Scriptable scope, Prototype prototype) {
			super(scope, prototype.getPrivate());
			this.instance = instance;
		}

		public String getClassName() {
			return "PrivateInterface";
		}

		public Instance getPublic() {
			return instance;
		}

	}
}
