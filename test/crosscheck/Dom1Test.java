package crosscheck;

import org.junit.runner.RunWith;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.ContextAction;
import org.mozilla.javascript.ContextFactory;
import org.mozilla.javascript.Scriptable;

import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;

@RunWith(BootstrapTestRunner.class)
public class Dom1Test {

	private static final Scriptable DOM = (Scriptable) new ContextFactory().call(new ContextAction() {
		public Object run(Context cx) {
			Scriptable scope = cx.initStandardObjects();
			URL resource = Window.class.getResource("/crosscheck/dom1.js");
			try {
				return cx.evaluateReader(scope, new InputStreamReader(resource.openStream()), resource.toExternalForm(), 1, null);
			} catch (IOException e) {
				throw new ExceptionInInitializerError(e);
			}
		}
	});


	@BootstrapTestRunner.SetupScope
	public static void addDomInterface(final Scriptable scope) {
		new ContextFactory().call(new ContextAction() {
			public Object run(Context cx) {
				for (Object o : DOM.getIds()) {
						if (o instanceof String) {
							String id = (String) o;
							scope.put(id, scope, DOM.get(id, DOM));
						}
					}
				return null;
			}

		});
	}
}
