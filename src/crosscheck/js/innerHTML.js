(function() {
	//noinspection JSUnresolvedVariable
	var extend = crosscheck.metadef.extend,
			dom = crosscheck.dom,
			tagsoup = Packages.org.ccil.cowan.tagsoup,
			sax = Packages.org.xml.sax

	extend(crosscheck.html1.HTMLElement, function() {
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

})()