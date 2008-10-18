package crosscheck.core;

import crosscheck.Suite;

/**
 * Stores all of the test definitions. This file has its own javascript bridge for defining the tests.
 * Once tests are defined, each testcase will be run 
 */
public class Definition {
	private Bridge bridge;

	public Definition(ScriptCache scripts) {
		this.bridge = new Bridge(scripts);
	}

	public void addFile(String fileName) {
		bridge.load(fileName);
	}

	public Suite[] getSuites() {
		return bridge.getArray("suites", Suite.class);
	}
}
