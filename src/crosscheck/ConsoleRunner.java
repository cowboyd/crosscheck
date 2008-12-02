package crosscheck;

import crosscheck.hosts.FireFox3;

public class ConsoleRunner {
	public static void main(String[] args) {
		Engine engine = new Engine();
		for (String arg : args) {
			engine.addFile(arg);
		}

		engine.run(new TestListener() {

			public void suiteStarted(Suite suite, Host host) {
				System.out.println(suite.getName());
			}

			public void suiteFinished(Suite suite, Host host, TestResult[] passes, TestResult[] failures, TestResult[] errors) {
				System.out.println("");
				for (TestResult error : errors) {
					System.out.println(error.getTest().getName() + ":");
					System.out.println(error.getMessage());
					System.out.println(error.getStack());
				}
				for (TestResult failure : failures) {
					System.out.println(failure.getTest().getName() + ":");
					System.out.println(failure.getMessage());
					System.out.println(failure.getStack());
				}
			}

			public void testStarted(Test test, Host host) {

			}

			public void ok(TestResult result) {
				System.out.print(".");
			}

			public void failure(TestResult result) {
				System.out.print("F");
			}

			public void error(TestResult result) {
				System.out.print("E");
			}
		}, new FireFox3());
	}
}
