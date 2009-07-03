
before(function() {

	window = new Packages.crosscheck.Window.CONSTRUCTOR('about:blank')
})

it("has a reference to itself", function() {
	assertEquals(window, window.self)
})

it("has a location", function() {
	assertEquals(false, typeof window.location == 'undefined')
})

it("location has an href")