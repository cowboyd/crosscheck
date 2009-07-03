package crosscheck;

import org.mozilla.javascript.*;

import java.net.URL;
import java.io.Reader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import crosscheck.embed.Constructor;

public class Window {

	public static final Function CONSTRUCTOR = (Function) new ContextFactory().call(new ContextAction() {
		public Object run(Context cx) {
			URL resource = Window.class.getResource("window.js");
			try {
				return cx.evaluateReader(cx.initStandardObjects(), new InputStreamReader(resource.openStream()), resource.toExternalForm(), 1, null);
			} catch (IOException e) {
				throw new ExceptionInInitializerError(e);
			}
		}
	});
	private Scriptable scope;

	public Window() {
		this.scope = (Scriptable) new ContextFactory().call(new ContextAction() {
			public Object run(Context cx) {
				ScriptableObject scope = cx.initStandardObjects();
				return CONSTRUCTOR.call(cx, scope, scope, new Object[0]);
			}
		});
	}

	public Scriptable getScope() {
		return scope;
	}
}
