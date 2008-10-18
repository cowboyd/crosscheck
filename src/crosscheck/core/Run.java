package crosscheck.core;

import crosscheck.TestListener;
import crosscheck.Host;
import crosscheck.Suite;

public class Run {

	public Run(Definition definition, TestListener listener, Host[] hosts) {
		for (Host host: hosts) {
			for (Suite suite : definition.getSuites()) {
				suite.run(listener, host);
			}
		}
	}

}
