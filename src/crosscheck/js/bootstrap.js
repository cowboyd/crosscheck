//noinspection JSUnresolvedVariable,JSUndeclaredVariable
crosscheck = {

	load: function(fileName) {
		//noinspection JSUnresolvedVariable
		this.internal.scripts.load(fileName, this.internal.scope)
	},

	suite: function(name, suite) {
		this.internal.suites.push(new crosscheck.java.Suite(new this.internal.Suite(name, suite)))
	},

	print: function(message) {
		if (typeof message == 'undefined') {
			message = null;
		}
		//noinspection JSUnresolvedFunction,JSUnresolvedVariable
		java.lang.System.out.println(message)
	},

	java: Packages.crosscheck,

	depends: function() {
		crosscheck.internal.bridge.execScriptClass.apply(crosscheck.internal.bridge, arguments)
	},

	internal: {

		suites: [],

		Suite: function(name, methods) {
			this._name = name
			this._cases = []
			for (var m in methods) {
				if (m.match(/^test_/)) {
					var method = methods[m]
					if (typeof method == 'function') {
						this._cases.push(new crosscheck.java.core.TestCaseController(m, methods, crosscheck.internal.scripts))
					}
				}
			}
		},

		run: function(listener, host, jtest, name, methods) {
			listener.testStarted(jtest, host)

			if (methods.setup) {
				methods.setup.call(methods)
			}

			methods[name].call(methods)
			if (methods.teardown) {
				methods.teardown.call(methods)
			}
			listener.ok(new crosscheck.java.TestResult({
				isOk: function() {
					return true
				},
				getTest: function() {
					return jtest
				},
				getMessage: function() {
					return ""
				},
				getStack: function() {
					return []
				},
				getHost: function() {
					return host
				}
			}))

		}
	},

	metadef: function(superclass, definition) {
		if (typeof definition == 'undefined') {
			return new CrosscheckMetaDef(null, superclass)
		} else {
			return new CrosscheckMetaDef(superclass, definition)
		}
	}
}

//noinspection JSUnresolvedVariable
crosscheck.metadef.access = crosscheck.java.core.CrosscheckMetaDef.ACCESS

crosscheck.internal.Suite.prototype = {

	getName: function() {
		return this._name
	},

	getTests: function() {
		return this._cases
	},

	run: function(listener, host) {
		var jtest = new crosscheck.java.Suite(this)

		listener.suiteStarted(jtest, host)

		var passes = []
		var failures = []
		var errors = []

		for (var i = 0; i < this._cases.length; i++) {
			this._cases[i].run(new crosscheck.java.TestListener({
				testStarted: function(test, host) {
					listener.testStarted(test, host)
				},
				ok: function(result) {
					passes.push(result)
					listener.ok(result)
				},
				failure: function(result) {
					failures.push(result)
					listener.failure(result)
				},
				error: function(result) {
					errors.push(result)
					listener.error(result)
				}
			}), host)

		}

		listener.suiteFinished(jtest, host, passes, failures, errors)
	}
}
