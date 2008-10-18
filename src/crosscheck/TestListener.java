package crosscheck;


public interface TestListener {

	void suiteStarted(Suite suite, Host host);
	void suiteFinished(Suite suite, Host host, TestResult[] passes, TestResult[] failures, TestResult[] errors);

	void testStarted(Test test, Host host);
	void ok(TestResult result);
	void failure(TestResult result);
	void error(TestResult result);
}
