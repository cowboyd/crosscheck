it("can receive constructor params and has a private interface", function() {
	var $access
	var Constructor = $ctor(function($) {
		$access = $
		this.initializer(function(one, two) {
			$(this, {
				one: one,
				two: two
			})
		})
	})
	var host = new Constructor(1, 2)
	assertEquals('undefined', typeof host.one)
	assertEquals('undefined', typeof host.two)
	assertEquals(1, $access(host).one, 0)
	assertEquals(2, $access(host).two, 0)

	host.one = 'one'
	assertEquals('one', host.one)
	assertEquals(1, $access(host).one, 0)
})

it("can define a readonly attribute which cannot be changed", function() {
	var Constructor = $ctor(function($) {
		this.initializer(function(one, two) {
			$(this, {
				one: one,
				two: two
			})
		})
		this.attrReadOnly('one', 'two')
	})
	var host = new Constructor('one', 'two')
	assertEquals("one", host.one)
	assertEquals("two", host.two)
	host.one = 1
	host.two = 2
	assertEquals("one", host.one)
	assertEquals("two", host.two)

	delete host.one
	delete host.two
	assertEquals("one", host.one)
	assertEquals("two", host.two)
})

it("can have a readwrite attributes that can be changed but not deleted", function() {

	var Constructor = $ctor(function() {
		this.attrReadWrite('one', 'two')
	})
	var i = new Constructor()
	i.one = 'one'
	assertEquals('one', i.one)
	i.one = 1
	assertEquals(1, i.one, 0)
	delete i.one
	assertEquals(1, i.one, 0)
})

it("can define a readonly attribute via a getter", function() {
	var Circle = $ctor(function($) {
		this.initializer(function(radius) {
			$(this).radius = radius
		})
		this.attrReadOnly('radius')
		this.attrReadOnly('diameter', function() {
			return $(this).radius * 2
		})
	})

	var c = new Circle(5)
	assertEquals(5, c.radius, 0)
	assertEquals(10, c.diameter, 0)
})

it("can define an accessor via a setter and getter", function() {
	var Circle = $ctor(function($) {
		this.initializer(function(radius) {
			$(this).radius = radius
		})
		this.attrReadOnly('radius')
		this.attrReadWrite('diameter', {
			get: function() {
				return $(this).radius * 2
			},
			set: function(value) {
				$(this).radius = value / 2
			}
		})
	})

	var c = new Circle(5)
	assertEquals(10, c.diameter, 0)
	c.diameter = 5
	assertEquals(2.5, c.radius, 0)
	assertEquals(5, c.diameter, 0)
})

it("can define a public method which cannot be deleted", function() {
	var Calc = $ctor(function() {
		this.constant('multiply', function(lhs, rhs) {
			return lhs * rhs
		})
	})
	var c = new Calc()
	assertEquals(10, c.multiply(5, 2), 0)
	delete c.multiply
	assertEquals('function', typeof c.multiply)
})

it("test define a set of methods as constants", function() {
	var Calc = $ctor(function() {
		this.constants({
			MULT_SYMBOL: "*",
			multiply: function(lhs, rhs) {
				return lhs * rhs;
			},
			divide: function(lhs, rhs) {
				return lhs / rhs;
			}
		})
	})
	var c = new Calc()
	assertEquals("*", c.MULT_SYMBOL)
	assertEquals(10, c.multiply(5, 2), 0)
	assertEquals(5, c.divide(10, 2), 0)
})

it("can have a private method", function() {
	var Circle = $ctor(function($) {
		this.initializer(function() {
			$(this).init()
		})
		this.privateMethod('init', function() {
			$(this).radius = 5
		})
		this.attrReadOnly('radius')
	})
	var c = new Circle()
	assertEquals(5, c.radius, 0)
})

it("can define several private methods at once", function() {
	var access;
	var Circle = $ctor(function($) {
		access = $;
		this.initializer(function() {
			$(this).init()
			$(this).expand(3)
		})
		this.privateMethods({
			init: function() {
				$(this).radius = 5
			},
			expand: function(factor) {
				$(this).radius = $(this).radius * factor
			}
		})

	})
	var c = new Circle()
	assertEquals(15, access(c).radius, 0)
})

it("can have open properties", function() {
	var OpenObject = $ctor()

	var o = new OpenObject();
	o.foo = 'bar'
	assertEquals('bar', o.foo)
	delete o.foo
	assertEquals('undefined', o.foo)
})


it("can share prototypes, and invoke the super constructor", function() {

	var Rectangle = $ctor(function($) {
		this.initializer(function(height, width) {
			$(this, {
				height: height,
				width: width
			})
		})
		this.attrReadOnly('height', 'width')
		this.attrReadOnly('area', function() {
			return $(this).height * $(this).width
		})
	})

	var Square = $ctor(Rectangle, function($) {
		this.initializer(function($super, side) {
			$super(side, side)
			$(this).side = side
		})
		this.attrReadOnly('side')
	})

	var s = new Square(5)
	assertEquals(5, s.height, 0)
	assertEquals(5, s.width, 0)
	assertEquals(25, s.area, 0)
	assertEquals(5, s.side, 0)
})

it("can have more than two levels of inheritance and invoking the super constructor", function() {
	var A = $ctor(function($) {
		this.initializer(function(one) {
			$(this).one = one
		})
		this.attrReadOnly('one')
	})
	var B = $ctor(A, function($) {
		this.initializer(function($super, one, two) {
			$super(one)
			$(this).two = two
		})
		this.attrReadOnly('two')
	})
	var C = $ctor(B, function($) {
		this.initializer(function($super, one, two, three) {
			$super(one, two)
			$(this).three = three
		})
		this.attrReadOnly('three')
	})
	var c = new C(1, 2, 3)
	assertEquals(1, c.one, 0)
	assertEquals(2, c.two, 0)
	assertEquals(3, c.three, 0)
})

it("can invoke private methods on the super constructor", function() {
	var access;
	var A = $ctor(function($) {
		access = $
		this.privateMethod('word', function() {
			return "grease"
		})
	})
	var B = $ctor(A, function() {
	})

	var b = new B()
	assertEquals('grease', access(b).word())
})

it(" can invoke overridden super methods", function() {
	var A = $ctor(function() {
		this.method('timesTwo', function(num) {
			return 2 * num
		})
	})

	var B = $ctor(A, function() {
		this.method('timesTwo', function($super, num) {
			return $super(num)
		})
	})

	var b = new B()
	assertEquals(10, b.timesTwo(5), 0)
})

it("can declare an alias for an attribute", function() {
	var A = $ctor(function() {
		this.constant("name", "Charles")
		this.alias("name", "nodeName")

		this.method("multiply", function(lhs, rhs) {
			return lhs * rhs
		})

		this.alias("multiply", "mult", "multi")
	})

	var a = new A()

	assertEquals(a.name, a.nodeName)
	assertEquals("Charles", a.nodeName)
	assertEquals(a.multiply, a.mult)
	assertEquals(a.multiply, a.multi)
	assertEquals(10, a.mult(5, 2), 0)
	assertEquals(10, a.multi(5, 2), 0)
})

it("can provide an indexed lookup to find properties", function() {
	var A = $ctor(function() {
		var strings = ["zero", "one", "two", "three", "four"]
		this.indexedLookup(function(index) {
			return strings[index]
		})
	})

	var a = new A()

	assertEquals("zero", a[0])
	assertEquals("one", a[1])
	assertEquals("four", a[4])
	assertEquals("undefined", typeof a[10])
})

it("can extend an existing class with a readonly attribute", function() {
	var A = $ctor(function() {
		this.constant('value', 10)
	})

	var a1 = new A()

	$extend(A, function() {
		this.constant('value', 20)
	})

	var a2 = new A()

	assertEquals(20, a1.value, 0)
	assertEquals(20, a2.value, 0)
})

it("can remove an attribute from an existing class", function() {
	var A = $ctor(function() {
		this.constant('foo', 'bar')
		this.constant('baz', 'bang')
	})

	var a = new A();
	assertEquals('bar', a.foo)
	assertEquals('bang', a.baz)
	$extend(A, function() {
		this.deleteAttr('foo', 'baz')

	})
	assertEquals('undefined', typeof a.foo)
	assertEquals('undefined', typeof a.baz)
})