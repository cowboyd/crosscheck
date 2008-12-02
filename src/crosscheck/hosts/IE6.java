package crosscheck.hosts;

import crosscheck.Host;
import crosscheck.js.dom;
import crosscheck.js.IE_6;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;


public class IE6 implements Host {

	public static final IE6 HOST = new IE6();
	private IE_6 script;

	IE6() {
		this.script = new IE_6();
	}

	public String getHostId() {
		return "IE 6";
	}

	public Object exec(Context cx, Scriptable scope) {
		return this.script.exec(cx, scope);
	}
}