package crosscheck;

public interface Test {

	String getName();

	void run(TestListener listener, Host host);
}
