package crosscheck;

public interface TestResult {

	boolean isOk();

	boolean isError();

	boolean isFailure();

	Test getTest();

	String getMessage();

	String getStack();

	Host getHost();
}
