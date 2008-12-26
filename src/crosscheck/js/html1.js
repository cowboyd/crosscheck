
crosscheck.depends(crosscheck.java.js.dom)

crosscheck.html1 = (function() {
	//noinspection JSUnresolvedVariable
	var dom = crosscheck.dom,
		def = crosscheck.metadef,
		tagsoup = Packages.org.ccil.cowan.tagsoup,
		sax = Packages.org.xml.sax

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
		this.indexedLookup(function(index) {
			return this.item(index)
		})
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
			this.setAttribute("id", '')
			this.setAttribute("title", '')
			this.setAttribute("lang", '')
			this.setAttribute("dir", '')
			this.setAttribute("class", '')
		})
		this.attrReadWrite('id', {
			get: function() {return this.getAttribute('id')},
			set: function(id) {this.setAttribute('id', id)}
		})
		this.attrReadWrite('title', {
			get: function() {return this.getAttribute('title')},
			set: function(title) {this.setAttribute('title', title)}
		})
		this.attrReadWrite('lang', {
			get: function() {return this.getAttribute('lang')},
			set: function(lang) {this.setAttribute('lang', lang)}
		})
		this.attrReadWrite('dir', {
			get: function() {return this.getAttribute('dir')},
			set: function(dir) {this.setAttribute('dir', dir)}
		})
		this.attrReadWrite('className', {
			get: function() {return this.getAttribute('class')},
			set: function(className) {this.setAttribute('class', className)}
		})

		this.attrReadWrite('innerHTML', {
			get: function() {

			},
			set: function(html) {
				var fragment = parse(this.ownerDocument, html)
				this.appendChild(fragment)
			}
		})
		this.attrReadOnly('tagName', function() {
			return $(this).tagName.toUpperCase()
		})
		this.attrAlias('tagName', 'nodeName')
	})

	function parse(document, html) {
		var parser = new tagsoup.Parser()
		var stack = []
		function push(element, append) {
			if (append) {
				top().element.appendChild(element)
			}
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

		parser.setContentHandler(new sax.ContentHandler({
			startElement: function(uri, localName, qName, attrs) {
//				crosscheck.print("startElement(uri: " + uri + ", localName: " + localName + ", qName: " + qName)
				if (localName != 'html' && localName != 'body') {
					flush()
					push(document.createElement(new String(localName)), true)
				}
			},
			endElement: function(uri, localName, qName) {
//				crosscheck.print("endElement(uri: " + uri + ", localName: " + localName + ", qName: " + qName)
				if (localName != 'html' && localName != 'body') {
					flush()
					pop()
				}
			},
			characters: function(chars, start, length) {
				top().buffer.append(chars, start, length)
			}

		}))
		parser.parse(new sax.InputSource(new java.io.StringReader(html)))
		return top().element
	}

	return {
		HTMLCollection: HTMLCollection,
		HTMLDocument: HTMLDocument
	}
})()