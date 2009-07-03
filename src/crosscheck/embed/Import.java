package crosscheck.embed;

import org.mozilla.javascript.Callable;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;

import java.net.URL;
import java.io.InputStreamReader;
import java.io.IOException;

public class Import implements Callable {
	public Object call(Context cx, Scriptable scope, Scriptable thisObj, Object[] args) {
		if (args.length > 0) {
			URL resource = Import.class.getResource("/crosscheck/" + args[0].toString());
			try {
				return cx.evaluateReader(scope, new InputStreamReader(resource.openStream()), resource.toExternalForm(), 1, null);
			} catch (IOException e) {
				throw new RuntimeException(e);
			}
		} else {
			return cx.newObject(scope);
		}
	}
}
