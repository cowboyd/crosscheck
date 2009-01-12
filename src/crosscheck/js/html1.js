//noinspection JSUnresolvedVariable
crosscheck.depends(crosscheck.java.js.dom)

crosscheck.html1 = (function() {
	//noinspection JSUnresolvedVariable
	var dom = crosscheck.dom,
			def = crosscheck.metadef


	//creates a property getter backed by an Element attribute
	function attrGetter(attrName) {
		return function() {
			return this.getAttribute(attrName)
		}
	}

	//creates a property setter backed by an Element attribute
	function attrSetter(attrName) {
		return function(value) {
			this.setAttribute(attrName, value)
		}
	}

	function attrAccesor(attrName) {
		return {
			get: attrGetter(attrName),
			set: attrSetter(attrName)
		}
	}

	//binds a list of read-only properties to an Element attribute
	function bindAttrReadOnly(cls) {
		for (var i = 1; i < arguments.length; i++) {
			var attrName = arguments[i]
			cls.attrReadOnly(attrName, attrGetter(attrName))
		}
	}

	//binds a list of read-write properties to an Element attribute
	function bindAttrReadWrite(cls) {
		for (var i = 1; i < arguments.length; i++) {
			var attrName = arguments[i]
			cls.attrReadWrite(attrName, {
				get: attrGetter(attrName),
				set: attrSetter(attrName)
			})
		}
	}

	var HTMLCollection = def(function($) {
		this.initializer(function() {
			$(this).elements = []
		})
		this.attrReadOnly('length', function() {
			return $(this).elements.length
		})
		this.methods({
			item: function(index) {
				return $(this).elements[index]
			},
			namedItem: function(name) {
				var elements = $(this).elements
				for (var i = 0; i < elements.length; i++) {
					var element = elements[i]

				}
			}
		})
		//e.g. document.forms[0]
		this.indexedLookup(function(index) {
			return this.item(index)
		})

		//e.g. document.forms.searchForm -> document.forms.namedItem('searchForm')
		this.namedLookup(function(name) {
			return this.namedItem(name)
		})
	})


	var HTMLDocument = def(dom.Document, function($) {
		this.initializer(function($super) {
			$super()
			$(this, {
				title: "",
				referrer: "",
				URL: "",
				documentElement: this.createElement('html'),
				body: this.createElement('body'),
				images: new HTMLCollection(),
				applets: new HTMLCollection(),
				links: new HTMLCollection(),
				forms: new HTMLCollection(),
				anchors: new HTMLCollection(),
				cookie: ""
			})
			$(this).documentElement.appendChild($(this).body)
		})
		this.attrReadOnly('documentElement', 'referrer', 'URL', 'images', 'applets', 'links', 'forms', 'anchors')
		this.attrReadWrite('title', 'body', 'cookie')
		this.methods({
			open: function() {
			},
			close: function() {
			},
			write: function() {
			},
			writeln: function() {
			},
			getElementById: function(id) {
				if (!id || id == '') {
					return null
				} else {
					return $(this).searchElementForId($(this).documentElement, id)
				}
			},
			getElementsByName: function() {
			},
			createElement: function(tagName) {
				return new HTMLElement(this, tagName)
			}
		})

		this.privateMethods({
			searchElementForId: function(element, id) {
				if (element.id == id) {
					return element
				}
				for (var i = 0; i < element.childNodes.length; i++) {
					var child = element.childNodes[i]
					if (child.nodeType == dom.ELEMENT_NODE) {
						var hit = $(this).searchElementForId(child, id)
						if (hit) {
							return hit
						}
					}
				}
				return null;
			}
		})
	})

	var HTMLElement = def(dom.Element, function($) {
		this.initializer(function($super, ownerDocument, name) {
			$super(ownerDocument, name)
			this.id = ""
			this.title = ""
			this.lang = ""
			this.dir = ""
			this.className = ""
		})
		bindAttrReadWrite(this, 'id', 'title', 'lang', 'dir')

		this.attrReadWrite('className', attrAccesor("class"))

		this.attrReadOnly('tagName', function() {
			return $(this).tagName.toUpperCase()
		})
		this.attrAlias('tagName', 'nodeName')
	})

	var HTMLHtmlElement = def(HTMLElement, function() {
		this.initializer(function($super, ownerDocument) {
			$super(ownerDocument, 'html')
			this.setAttribute("version", "")
		})
		bindAttrReadOnly(this, 'version')
	})

	var HTMLHeadElement = def(HTMLElement, function() {
		this.initializer(function($super, ownerDocument) {
			$super(ownerDocument, 'head')
			this.setAttribute("profile", "")
		})
		bindAttrReadOnly(this, "profile")
	})

	var HTMLLinkElement = def(HTMLElement, function() {
		this.initializer(function($super, ownerDocument) {
			$super(ownerDocument, 'link')
			this.disabled = false
			this.charset = ""
			this.href = ""
			this.hreflang = ""
			this.media = ""
			this.rel = ""
			this.target = ""
			this.type = ""
		})
		bindAttrReadWrite(this, 'disabled', 'charset', 'href', 'hreflang', 'media', 'rel', 'target', 'type')
	})

	var HTMLTitleElement = def(HTMLElement, function() {
		this.initializer(function($super, ownerDocument) {
			$super(ownerDocument, 'title')
		})
		this.attrReadWrite('text', {
			get: function() {
				var text = new java.lang.StringBuffer()
				for (var i = 0; i < this.childNodes.length; i++) {
					var child = this.chilNodes[i]
					if (child.nodeType == dom.TEXT_NODE || child.nodeType == dom.CDATA_SECTION_NODE) {
						text.append(child.data)
					}
				}
				return new String(text)
			},
			set: function(text) {
				this.innerHTML = text
			}
		})
	})

	var HTMLMetaElement = def(HTMLElement, function() {
		this.initializer(function($super, ownerDocument) {
			$super(ownerDocument, 'meta')
		})
		bindAttrReadWrite(this, 'name', 'content', 'scheme')
		this.attrReadWrite('httpEquiv', attrAccesor('http-equiv'))
	})

	var HTMLFormElement = def(HTMLElement, function() {
		this.initializer(function($super, ownerDocument) {
			$super(ownerDocument, 'form')
		})

		this.methods({
			submit: function() {

			},
			reset: function() {

			}
		})
	})

	function myForm() {
		for (var ancestor = this.parentNode; ancestor; ancestor = this.parentNode) {
			if (ancestor.tagName == 'FORM') {
				return ancestor
			}
		}
		return null;
	}

	var HTMLSelectElement = def(HTMLElement, function() {
		this.initializer(function($super, ownerDocument) {
			$super(ownerDocument, 'select')
			this.type = "select-one"
		})
		this.attrReadOnly('form', myForm)
	})


	return {
		HTMLCollection: HTMLCollection,
		HTMLDocument: HTMLDocument,
		HTMLElement: HTMLElement,
		HTMLHtmlElement: HTMLHtmlElement,
		HTMLHeadElement: HTMLHeadElement,
		HTMLTitleElement: HTMLTitleElement,
		HTMLLinkElement: HTMLLinkElement,
		HTMLMetaElement: HTMLMetaElement,
		HTMLFormElement: HTMLFormElement,
		HTMLSelectElement: HTMLSelectElement
	}
})()