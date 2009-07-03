
(function() {
	var $load = new Packages.crosscheck.embed.Load()
	var $constructor = new Packages.crosscheck.embed.Constructor.Builder()


	var Location = $load('location.js')
	var dom1 = $load('dom1.js')
//	var dom2 = $load('dom2.js', dom1)

//	var Location = $constructor(function($private) {
//		this.initializer(function(window, href) {
//			$private(this, {
//				window: window,
//				href: href
//			})
//		})
//	})

//		this.attrAccessor('href', {
//			get: function() {
//				return $(this).href
//			},
//			set: function(value) {
//				$(this).window.open("" + value)
//			}
//		})
//	})
//
	return $constructor(function($) {
		this.initializer(function(href) {
			var win = this
			$(this, {
				location: new Location(win, href),
				self: this
			})
		})

		this.attrReadOnly('self', 'location')//, 'frames', 'locationBar', 'menuBar', 'visible')
//
//		this.attrReadOnly('name', function() {
//			return this.document.title
//		})
//
//		this.attrAccessor('location', {
//			get: function() {
//				return $(this).location
//			},
//			set: function(loc) {
//				$(this).location.href = loc + ""
//			}
//		})
//
//		this.methods({
//			eval: function(js) {
//				return new rhino.ContextFactory().call(function(cx) {
//						cx.evaluateString(this, js, "<eval>", 1, null)
//					})
////				return new rhino.ContextFactory().call(new rhino.ContextAction({
////					call: function(cx) {
////						cx.evaluateString(this, js, "<eval>", 1, null)
////					}
////				}))
//			},
//			alert: function(msg) {
//
//			},
//			confirm: function(msg) {
//
//			}
//		})
	})
})()