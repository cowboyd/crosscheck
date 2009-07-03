package crosscheck.embed;

import crosscheck.BootstrapTestRunner;
import org.junit.runner.RunWith;
import org.mozilla.javascript.Scriptable;


@RunWith(BootstrapTestRunner.class)
public class EmbeddedObjects  {

	@BootstrapTestRunner.SetupScope
	public static void addConstructorBuilder(Scriptable scope) {
		scope.put("$ctor", scope, new Constructor.Builder());
		scope.put("$extend", scope, new Constructor.Extender());
	}

}
