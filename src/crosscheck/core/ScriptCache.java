package crosscheck.core;

import org.mozilla.javascript.*;

import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;

public class ScriptCache {

	private HashMap<String, Script> cache = new HashMap<String, Script>();

	private Script compile(final String fileName) {
		Script script = cache.get(fileName);
		if (script == null) {
			script = (Script) new ContextFactory().call(new ContextAction() {
				public Object run(Context cx) {
					try {
						return cx.compileReader(new FileReader(fileName), fileName, 1, null);
					} catch (IOException e) {
						throw new RuntimeException(e);
					}
				}
			});
			cache.put(fileName, script);
		}
		return script;
	}

	public void load(final String fileName, final Scriptable scope) {
		new ContextFactory().call(new ContextAction() {
			public Object run(Context cx) {
				compile(fileName).exec(cx, scope);
				return null;
			}
		});

	}

}
