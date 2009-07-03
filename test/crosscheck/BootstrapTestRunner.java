package crosscheck;

import org.junit.runner.Runner;
import org.junit.runner.Description;
import org.junit.runner.notification.RunNotifier;
import org.junit.runner.notification.Failure;
import org.mozilla.javascript.*;

import java.util.ArrayList;
import java.util.List;
import java.net.URL;
import java.io.InputStreamReader;
import java.io.IOException;
import java.lang.reflect.Method;
import java.lang.annotation.Target;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;


/**
 * This is a really simple test runner to test the very
 * low-level functionality. It is as lightweight and unfeatureful
 * as we can get away with, and should not be taken as a
 * pattern for a way of collecting and running tests
 */
public class BootstrapTestRunner extends Runner {

	public Description description;
	public ArrayList<Case> cases = new ArrayList<Case>();
	private Class testClass;

	public BootstrapTestRunner(Class testClass) {
		this.testClass = testClass;
	}

	public Description getDescription() {
		if (this.description == null) {
			new ContextFactory().call(new ContextAction() {
				public Object run(Context cx) {
					Scriptable scope = cx.initStandardObjects();
					TestCollector collector = new TestCollector(BootstrapTestRunner.this);
					scope.put("it", scope, collector);
					scope.put("test", scope, collector);
					scope.put("ignore", scope, collector.ignore);
					scope.put("before", scope, collector.before);
					URL source = testClass.getResource(testClass.getSimpleName() + ".js");
					try {
						cx.evaluateReader(scope, new InputStreamReader(source.openStream()), source.toExternalForm(), 1, null);
					} catch (IOException e) {
						throw new RuntimeException(e);
					}
					return null;
				}
			});
		}
		this.description = Description.createTestDescription(testClass, testClass.getSimpleName());
		return this.description;
	}

	public void run(RunNotifier notifier) {
		for (final Case tc : cases) {
			notifier.fireTestStarted(tc.description);
			if (tc.ignore) {
				notifier.fireTestIgnored(tc.description);
			} else {
				try {
					new ContextFactory().call(new ContextAction() {
						public Object run(Context cx) {
							ScriptableObject scope = cx.initStandardObjects();
							cx.evaluateString(scope, "assertEquals = org.junit.Assert.assertEquals", "tie in junit assertions", 1, null);
							for (Method m : testClass.getDeclaredMethods()) {
								if (m.isAnnotationPresent(SetupScope.class)) {
									try {
										m.invoke(m.getDeclaringClass(), scope);
									} catch (Exception e) {
										throw new RuntimeException(e);
									}
								}
							}

							for (Function before : tc.befores) {
								before.setParentScope(scope);
								before.call(cx, scope, scope, new Object[0]);
							}

							tc.impl.setParentScope(scope);
							tc.impl.call(cx, scope, scope, new Object[0]);
							return null;
						}
					});
					notifier.fireTestFinished(tc.description);
				} catch (Exception e) {
					notifier.fireTestFailure(new Failure(tc.description, e));
				} catch (AssertionError e) {
					notifier.fireTestFailure(new Failure(tc.description, e));
				}
			}
		}

	}

	public void add(Case tc) {
//		this.description.addChild(tc.description);
		this.cases.add(tc);
	}

	public static class Case {
		public Description description;
		public Function impl;
		public boolean ignore;
		private List<Function> befores;

		public Case(String name, Class testClass, Function impl, boolean ignore, List<Function> befores) {
			this.befores = befores;
			this.description = Description.createTestDescription(testClass, name);
			this.impl = impl;
			this.ignore = ignore;
		}
	}

	public class TestCollector extends BaseFunction {
		private BootstrapTestRunner runner;
		private boolean ignoring;
		private BaseFunction ignore;
		private Function before;
		private ArrayList<Function> befores;

		public TestCollector(BootstrapTestRunner runner) {
			this.runner = runner;
			this.ignoring = false;
			this.befores = new ArrayList<Function>();
			this.ignore = new BaseFunction() {
				@Override
				public Object call(Context cx, Scriptable scope, Scriptable thisObj, Object[] args) {
					if (args.length == 0) {
						TestCollector.this.ignoring = true;
					} else {
						TestCollector.this.ignoring = (Boolean) args[0];
					}
					return ScriptableObject.NOT_FOUND;
				}
			};

			this.before = new BaseFunction() {
				@Override
				public Object call(Context cx, Scriptable scope, Scriptable thisObj, Object[] args) {
					if (args.length > 0) {
						if (args[0] instanceof Function) {
							Function before = (Function) args[0];
							befores.add(before);
						} else {
							throw new IllegalArgumentException("before() needs a function, not " + args[0].getClass());
						}
					}
					return ScriptableObject.NOT_FOUND;
				}
			};
		}

		@Override
		public Object call(Context cx, Scriptable scope, Scriptable thisObj, Object[] args) {
			String name = (String) args[0];
			Function impl = (Function) args[1];
			this.runner.add(new Case(name, this.runner.testClass, impl, ignoring, befores));
			return ScriptableObject.NOT_FOUND;
		}
	}

	@Target(ElementType.METHOD)
	@Retention(RetentionPolicy.RUNTIME)
	public static @interface SetupScope {
	}
}
