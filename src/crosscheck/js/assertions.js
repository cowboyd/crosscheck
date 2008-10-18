
crosscheck.AssertionFailure = function(message) {
	this.message = message
	this.assertionFailure = true
	this.toString = function() {
		return this.message
	}
}

crosscheck.AssertionFailure.check = function(condition, message) {
	if (!condition) {
		throw new crosscheck.AssertionFailure(message)
	}
}

function fail(message) {
  //TODO: make this some sort of javascript runtime exception that won't be caught by a
  //javascript catch clause
	crosscheck.AssertionFailure.check(false, message)
}

function assertError(closure, expectedMessage) {
  try {
    closure();
    crosscheck.AssertionFailure.check(false, 'should have thrown an error');
  } catch(e) {
    if (e.assertionFailure) {
      throw e;
    } else if (expectedMessage) {
      assertEquals(expectedMessage, e.message)
    }
  }
}

function assertTrue(bool, message) {
	crosscheck.AssertionFailure.check(bool, message + ": " + "<" + bool + "> was not true")
}

function assertFalse(bool, message) {
	crosscheck.AssertionFailure.check(!bool, message + ": " + "<" + bool + "> was not false")
}

function assertDefined(object) {
	crosscheck.AssertionFailure.check(typeof object != 'undefined', "value was expected to be defined, but was not")
}

function assertNotDefined(object) {
	crosscheck.AssertionFailure.check(typeof object == 'undefined', "<" + object + "> was expected not to be defined, but it WAS defined")
}

function assertEquals(expected, actual, message) {
	if (!message) {
		message = 'better fix it'
	}
	if (expected == null && actual == null) return
	var booloid = expected == actual;
	crosscheck.AssertionFailure.check(booloid, message + ": " + "objects not equal, expected <" + expected + ">, got <" + actual + ">")
}

function assertNotEquals(expected, actual, message) {
	if (!message) {
		message = 'better fix it'
	}
	crosscheck.AssertionFailure.check(expected != actual, message + ": " + "objects are equal, expected difference <" + expected + ">, got <" + actual + ">")
}

function assertSame(expected, actual, message) {
	if (!message) {
		message = 'better fix it'
	}
	crosscheck.AssertionFailure.check(expected != actual, message + ": expected to be the same object, but were different")
}

function assertNotSame(expected, actual, message) {
	if (!message) {
		message = 'better fix it'
	}
	crosscheck.AssertionFailure.check(expected == actual, message + ": expected not to be the same object")
}

function assertNull(object, message) {
	if (!message) message = "<" + object + "> expected to be null"
	crosscheck.AssertionFailure.check(object == null, message)
}

function assertNotNull(object, message) {
	if(!message) message = "better fix it"
	crosscheck.AssertionFailure.check(object != null || (typeof object) == 'undefined', message + ": null value found where not expected")
}