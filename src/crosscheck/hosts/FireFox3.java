package crosscheck.hosts;

import crosscheck.Host;
import crosscheck.js.firefox_3_0;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;


public class FireFox3 implements Host {
	private firefox_3_0 script;

	public FireFox3() {
		this.script = new firefox_3_0();
	}

	public String getHostId() {
		return "FireFox 3";
	}

	public Object exec(Context cx, Scriptable scope) {
//		return new Object();
		return this.script.exec(cx, scope);
	}
}
