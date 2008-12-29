//noinspection JSUnresolvedVariable
crosscheck.depends(crosscheck.java.js.dom)

crosscheck.html1 = (function() {
	//noinspection JSUnresolvedVariable
	var dom = crosscheck.dom,
		def = crosscheck.metadef,
		tagsoup = Packages.org.ccil.cowan.tagsoup,
		sax = Packages.org.xml.sax

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
				body: this.createElement('body'),
				images: new HTMLCollection(),
				applets: new HTMLCollection(),
				links: new HTMLCollection(),
				forms: new HTMLCollection(),
				anchors: new HTMLCollection(),
				cookie: ""
			})
		})
		this.attrReadOnly('referrer', 'URL', 'images', 'applets', 'links', 'forms', 'anchors')
		this.attrReadWrite('title', 'body', 'cookie')
		this.methods({
			open: function() {},
			close: function() {},
			write: function() {},
			writeln: function() {},
			getElementById: function() {},
			getElementsByName: function() {},
			createElement: function(tagName) {
				return new HTMLElement(this, tagName)
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

		this.attrReadWrite('innerHTML', {
			get: function() {
				//noinspection JSUnresolvedVariable
				return new String(collectHTML(this, new java.lang.StringBuffer(), false))
			},
			set: function(html) {
				var fragment = parse(this.ownerDocument, html)
				var children = this.childNodes;
				for (var i = 0; i < children.length; i++) {
					this.removeChild(children[i])
				}
				this.appendChild(fragment)
			}
		})
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


	var ATOMIC_TAGS = {
		P: true,
		BR: true,
		LI: true
	}



	function collectHTML(element, buffer, outer) {
		var atomic = element.childNodes.length == 0 && ATOMIC_TAGS[element.tagName];
		if (outer) {
			buffer.append("<" + element.tagName.toLowerCase())
			for (var i = 0; i < element.attributes.length; i++) {
				var attr = element.attributes[i]
				var value = attr.value ? new String(attr.value) : ""
				if (value.replace(/\s+/g, '') != '') {
					buffer.append(" " + attr.name + '="' + attr.value + '"')
				}
			}
			buffer.append(atomic ? "/>" : ">")
		}
		for (var i = 0; i < element.childNodes.length; i++) {
			var child = element.childNodes[i]
			if (child.nodeType == dom.ELEMENT_NODE) {
				collectHTML(child, buffer, true)
			} else if (child.nodeType == dom.TEXT_NODE) {
				buffer.append(child.data)
			} else if (child.nodeType == dom.COMMENT_NODE) {
				buffer.append("<!--" + child.data + "-->")
			}
		}
		if (outer && !atomic) {
			buffer.append("</" + element.tagName.toLowerCase() + ">")
		}
		return buffer
	}

	function parse(document, html) {
		var parser = new tagsoup.Parser()
		var stack = []
		function push(element, append) {
			if (append) {
				top().element.appendChild(element)
			}
			//noinspection JSUnresolvedVariable
			stack.push({element: element, buffer: new java.lang.StringBuffer()})
			return element
		}

		function pop() {
			return stack.pop()
		}

		function top() {
			return stack[stack.length - 1]
		}

		function flush() {
			var current = top()
			var buffer = current.buffer;
			if (buffer.length() > 0) {
				current.element.appendChild(document.createTextNode(new String(buffer)))
				buffer.setLength(0)
			}
		}

		push(document.createDocumentFragment())

		//noinspection JSUnusedLocalSymbols
		parser.setContentHandler(new sax.ContentHandler({
			startElement: function(uri, localName, qName, attrs) {
				if (localName != 'html') {
					flush()
					if (localName != 'body') {
						var element = push(document.createElement(new String(localName)), true)
						for (var i = 0; attrs && i < attrs.length; i++) {
							var name = attrs.getLocalName(i);
							var value = attrs.getValue(i);
							element.setAttribute(name, value)
						}
					}
				}
			},
			endElement: function(uri, localName, qName) {
				if (localName != 'html') {
					flush()
					if (localName != 'body') {
						pop()
					}
				}
			},
			characters: function(chars, start, length) {
				top().buffer.append(chars, start, length)
			},
			ignoreableWhitespace: function(chars, start, length) {
				top().buffer.append(chars, start, length)
			}

		}))
		var wrapped = "<html><body>" + html + "</body></html>";
		//noinspection JSUnresolvedVariable
		parser.parse(new sax.InputSource(new java.io.StringReader(wrapped)))
		return top().element
	}


	return {
		HTMLCollection: HTMLCollection,
		HTMLDocument: HTMLDocument,
		HTMLHtmlElement: HTMLHtmlElement,
		HTMLHeadElement: HTMLHeadElement,
		HTMLTitleElement: HTMLTitleElement,
		HTMLLinkElement: HTMLLinkElement,
		HTMLMetaElement: HTMLMetaElement,
		HTMLFormElement: HTMLFormElement,
		HTMLSelectElement: HTMLSelectElement
	}
})()