package crosscheck;

import crosscheck.core.Definition;
import crosscheck.core.Run;
import crosscheck.core.ScriptCache;

public class Engine {
	private Definition definitions;
	private String[] path;

	public Engine() {
		this.definitions = new Definition(new ScriptCache());
	}


	/**
	 * Not really implemented yet.
	 * @return nothing useful
	 */
	public String[] getPath() {
		return path;
	}

	/**
	 * Not really implemented yet.
	 * @param path does nothing
	 */
	public void setPath(String...path) {
		this.path = path;
	}

	/**
	 * Not really implemented
	 */
	public void addPath() {

	}

	/**
	 * Adds a file which contains test definitions
	 * @param fileName name of the file to load
	 */
	public void addFile(String fileName) {
		this.definitions.addFile(fileName);
	}

	public void run(final TestListener listener, final Host...hosts) {
		new Run(this.definitions, listener, hosts);
	}
}
