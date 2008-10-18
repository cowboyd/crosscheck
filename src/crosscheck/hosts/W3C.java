package crosscheck.hosts;

import crosscheck.Host;
import crosscheck.js.dom;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;


public class W3C implements Host {

	public static final W3C HOST = new W3C();
	private dom script;

	W3C() {
		this.script = new dom();
	}

	public String getHostId() {
		return "W3C";
	}

	public Object exec(Context cx, Scriptable scope) {
		return this.script.exec(cx, scope);
	}
}
