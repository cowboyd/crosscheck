crosscheck.dom = (function() {
	//noinspection JSUnresolvedVariable
	//var tagsoup = Packages.org.ccil.cowan.tagsoup

	var def = crosscheck.metadef

	var puts = function(msg) {
		msg = msg || ''
		java.lang.System.out.println(msg)
	}

	var ELEMENT_NODE = 1,
			ATTRIBUTE_NODE = 2,
			TEXT_NODE = 3,
			CDATA_SECTION_NODE = 4,
			ENTITY_REFERENCE_NODE = 5,
			ENTITY_NODE = 6,
			PROCESSING_INSTRUCTION_NODE = 7,
			COMMENT_NODE = 8,
			DOCUMENT_NODE = 9,
			DOCUMENT_TYPE_NODE = 10,
			DOCUMENT_FRAGMENT_NODE = 11,
			NOTATION_NODE = 12


	var Node = def(function($) {
		this.initializer(function(document, nodeType) {
			$(this, {
				ownerDocument: document,
				nodeType: nodeType,
				children: [],
				attributes: null
			})
		})

		this.attrReadOnly('attributes', function() {
			return null
		})
		this.attrReadOnly('childNodes', function() {
			return new NodeList($(this).children)
		})
		this.attrReadOnly('firstChild', function() {
			return this.hasChildNodes() ? this.childNodes.item(0) : null
		})
		this.attrReadOnly('lastChild', function() {
			return this.hasChildNodes() ? this.childNodes.item(this.childNodes.length - 1) : null
		})
		this.attrReadOnly('previousSibling', function() {
			return null;
		})

		this.attrReadOnly('ownerDocument', 'attributes', 'parentNode', 'localName', 'nodeType')

		this.attrReadWrite('prefix')

		//noinspection JSUnusedLocalSymbols
		this.methods({
			appendChild: function(child) {
				return this.insertBefore(child, null)
			},
			cloneNode: function(deep) {
				return null
			},
			hasAttributes: function() {
				return false;
			},
			hasChildNodes: function() {
				return $(this).children.length > 0
			},
			insertBefore: function(newChild, refChild) {
				var index = $(this).children.indexOf(refChild)
				if (index < 0) {
					return $(this).insertAt(newChild, this.childNodes.length - 1)
				} else {
					return $(this).insertAt(newChild, index)
				}
			},
			isSupported: function(feature, version) {
				throw 'Crosscheck Not Yet Implemented'
			},
			normalize: function() {
				throw "Not Yet Supported By Crosscheck"
			},
			removeChild: function(oldChild) {
				var index = $(this).children.indexOf(oldChild)
				if (index >= 0) {
					$(this).children.slice(index, 1)
					$(oldChild).parentNode = null
				}
			},
			replaceChild: function(newChild, oldChild) {
				var index = $(this).children.indexOf(oldChild)
				if (index >= 0) {
					this.insertBefore(newChild, oldChild)
					this.removeChild(oldChild)
				}
			}
		})

		//noinspection JSUnresolvedFunction
		this.privateMethods({
			insertAt: function(newChild, index) {
				if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
					var children = newChild.childNodes
					for (var i = 0; i < children.length; i++) {
						$(this).insertAt(children[i], index + i)
					}
				} else {
					if (newChild.parentNode) {
						newChild.parentNode.removeChild(newChild)
					}
					$(newChild).parentNode = this
					$(this).children.splice(index, 0, newChild)
				}
				return newChild
			},
			insertAfter: function(newChild, refChild) {
				$(this).insertAt(newChild, $(this).children.indexOf(refChild))
			}
		})

	})

	var NodeList = def(function($) {
		//noinspection JSUnresolvedFunction
		this.initializer(function(list) {
			$(this).list = new Array(list.length)
			for (var i = 0; i < list.length; i++) {
				$(this).list[i] = list[i]
			}
		})

		//noinspection JSUnresolvedFunction
		this.attrReadOnly('length', function() {
			return $(this).list.length
		})

		//noinspection JSUnresolvedFunction
		this.methods({
			item: function(index) {
				return $(this).list[index]
			},
			"[]": "item"
		})
	})

	var NamedNodeMap = def(function($) {
		//noinspection JSUnresolvedFunction
		this.initializer(function() {
			$(this).map = new java.util.HashMap()
		})

		//noinspection JSUnresolvedFunction
		this.attrReadOnly('length', function() {
			return $(this).map.size()
		})
		//noinspection JSUnresolvedFunction,JSUnusedLocalSymbols,JSUnusedLocalSymbols
		this.methods({
			getNamedItem: function(name) {
				return $(this).map.get(name)
			},
			getNamedItemNS: function(namespaceURI, localName) {
				throw 'not supported by crosscheck'
			},
			item: function(index) {
				return $(this).map.values().get(index)
			},
			removeNamedItem: function(name) {
				$(this).map.remove(name)
			},
			removeNamedItemNS: function(namespaceURI, localName) {
				throw 'not supproted by crosscheck'
			},
			setNamedItem: function(node) {
				$(this).map.put(node.nodeName, node)
			},
			setNamedItemNS: function(namespaceURI, localName) {
				throw 'not supported by crosscheck'
			}
		})

		this.privateMethods({
			removeNode: function(node) {
				for (var i = $(this).map.keySet().iterator(); i.hasNext();) {
					var key = i.next()
					if ($(this).map.get(key) == node) {
						$(this).map.remove(key)
					}
				}
			}
		})

	})

	var Attr = def(Node, function($) {
		this.initializer(function($super, document, name, value, specified) {
			$super(document, ATTRIBUTE_NODE)
			$(this, {
				name: name,
				value: value || '',
				specified: specified
			})
		})

		this.attrReadWrite('value')
		this.attrReadOnly('name', 'specified', 'ownerElement')
		this.attrAlias('name', 'nodeName')
	})

	var pargs = function(funcname, funcargs) {
		var args = new Array(funcargs.length)
		for	(var i = 0; i < funcargs.length; i++) {
			args[i] = funcargs[i]
		}
		java.lang.System.out.println(funcname + '(' + args.join(',') + ")")
	}

	var CharacterData = def(Node, function($) {
		this.initializer(function($super, document, nodeType, data) {
			$super(document, nodeType)
			this.data = data || ''
		})

		this.attrReadOnly('length', function() {
			return $(this).data.length
		})

		this.attrReadWrite('data', {
			get: function() {
				return $(this).data.join('')
			},
			set: function(data) {
				$(this).data = data.split('')
			}
		})
//		this.attrReadOnly('nodeValue', function() {
//			return this.data
//		})
		this.attrAlias('data', 'nodeValue')
		this.methods({
			appendData: function(data) {
				$(this).data = $(this).data.concat(data.split(''))
			},
			deleteData: function(offset, count) {
				$(this).data.splice(offset, count)
			},
			insertData: function(offset, data) {
				this.replaceData(offset, 0, data)
			},
			replaceData: function(offset, count, data) {
				$(this).data.splice(offset, count, data.split(''))
			},
			substringData: function(offset, count) {
				return $(this).data.slice(offset, offset + count).join('')
			}
		})
	})

	var Text = def(CharacterData, function($) {
		this.initializer(function($super, document, nodeType, data) {
			if (!nodeType) nodeType = TEXT_NODE
//			pargs('Text', arguments)
			$super(document, nodeType, data)
		})
		this.attrReadOnly('nodeName', "#text")
		this.method('splitText', function(offset) {
			var unsplit = $(this).data
			this.data = unsplit.slice(0, offset)
			var next = this.ownerDocument.createTextNode(unsplit.slice(offset))
			if (this.parentNode) {
				$(this.parentNode).insertAfter(next, this)
			}
			return next
		})
	})

	var CDATASection = def(Text, function() {
		this.initializer(function($super, document, data) {
			$super(document, CDATA_SECTION_NODE, data)
		})
		this.constant('nodeName', '#cdata-section')
	})

	var Comment = def(CharacterData, function() {
		this.initializer(function($super, document, data) {
			$super(document, COMMENT_NODE, data)
		})
		this.constant('nodeName', '#comment')
	})

	var Document = def(Node, function($) {
		this.initializer(function($super) {
//			pargs('Document', arguments)
			$super(null, DOCUMENT_NODE)
			$(this).idmap = new java.util.HashMap()
		})
		this.constant('nodeName', '#document')
		this.attrReadOnly('doctype', function() {
			throw 'Not Yet Implemented'
		})
		this.attrAlias('doctype', 'implementation', 'documentElement')

		this.methods({
			getElementById: function(id) {
				return $(this).idmap.get(id)
			},
			getElementsByTagName: function(tagName) {
				return this.documentElement.getElementsByTagName(tagName)
			},
			getElementsByTagNameNS: function(namespaceURI, tagName) {
				return this.documentElement.getElementsByTagNameNS(namespaceURI, tagName)
			},
			createAttribute: function(name) {
				return new Attr(this, name, null, false)
			},
			createAttributeNS: function(namespaceURI, qualifedName) {
				throw 'unsupported'
			},
			createCDATASection: function(data) {
				return new CDATASection(this, data)
			},
			createComment: function(data) {
				return new Comment(this, data)
			},
			createDocumentFragment: function() {
				return new DocumentFragment(this)
			},
			createElement: function(tagName) {
				return new Element(this, tagName)
			},

			createElementNS: function() {
				throw 'unsupported'
			},

			createEntityReference: function(name) {
				return new EntityReference(this, name)
			},

			createProcessingInstruction: function(target, data) {
				return new ProcessingInstruction(this, target, data)
			},

			createTextNode: function(data) {
				return new Text(this, null, data)
			},

			importNode: function(deep) {
				throw 'unsupported'
			}
		})
	})

	var DocumentFragment = def(Node, function($) {
		this.initializer(function($super, document) {
			$super(document, DOCUMENT_FRAGMENT_NODE)
		})
		this.attrReadOnly('nodeName', '#document-fragment')
	})

	var DocumentType = def(Node, function($) {
		this.initializer(function($super, document) {
			$super(document, DOCUMENT_TYPE_NODE)
			$(this, {
				entities: null,
				internalSubset: null,
				name: null,
				notations: null,
				publicId: null,
				systemId: null
			})
		})
		this.attrReadOnly('entities', 'internalSubset', 'name', 'notations', 'publicId', 'systemId')
	})

	var Element = def(Node, function($) {
		this.initializer(function($super, document, name) {
			if (!name || name.replace(/\s+/, '') == '') {
				throw 'INVALID ELEMENT NAME'
			}
			$super(document, ELEMENT_NODE)
			$(this, {
				tagName: name,
				attributes: new NamedNodeMap()
			})
		})

		this.attrReadOnly('tagName', 'attributes')
		this.attrAlias('tagName', 'nodeName')

		this.methods({
			getAttribute: function(name) {
				var attr = this.getAttributeNode(name);
				return attr ? attr.value : null
			},
			getAttributeNS: function(namespaceURI, localName) {
				var attr = this.getAttributeNodeNS(namespaceURI, localName)
				return attr ? attr.value : null
			},

			getAttributeNode: function(name) {
				return this._attributes.getNamedItem(name)
			},

			getAttributeNodeNS: function(namespaceURI, localName) {
				throw 'unsupported'
			},

			getElementsByTagName: function(name) {
				return new NodeList($(this).searchElementsByTagName(name, []))
			},

			getElementsByTagNameNS: function(namespaceURI, name) {
				throw 'unsupported'
			},

			hasAttribute: function(name) {
				return this.getAttributeNode(name) ? true : false
			},

			hasAttributeNS: function(namespaceURI, localName) {
				return this.getAttributeNodeNS(namespaceURI, localName) ? true : false
			},

			removeAttribute: function(name) {
				this.attributes.removeNamedItem(name)
			},
			removeAttributeNS: function(namespaceURI, localName) {
				this.attributes.removeNamedItemNS(namespaceURI, localName)
			},
			removeAttributeNode: function(attr) {
				$(this.attributes).removeNode(attr)
			},
			setAttribute: function(name, value) {
				var attr = this.ownerDocument.createAttribute(name)
				attr.value = value
				this.attributes.setNamedItem(attr)
			},
			setAttributeNS: function(namespaceURI, localName, value) {
				var attr = this.ownerDocument.createAttributeNS(namespaceURI, localName)
				attr.value = value
				this.attributes.setNamedItemNS(attr)
			},
			setAttributeNode: function(attr) {
				this.attributes.setNamedItem(attr)
			},
			setAttributeNodeNS: function(attr) {
				this.attributes.setNamedItemNS(attr)
			}
		})

		this.privateMethods({
			searchElementsByTagName: function(tagName, list) {
				for (var i = 0; i < this.childNodes; i ++) {
					var child = this.childNodes[i]
					if (child.nodeType == ELEMENT_NODE) {
						if (child.tagName == tagName) {
							list.push(child)
						}
						$(child).searchElementsByTagName(tagName, list)
					}
				}
			}
		})
	})


	var Entity = def(Node, function($) {
		this.initializer(function($super, document, name, publicId, systemId) {
			$super(document, ENTITY_NODE)
			$(this, {
				nodeName: name,
				publicId: publicId,
				systemId: systemId

			})
		})
		this.attrReadOnly('nodeName', 'publicId', 'systemId')
	})

	var EntityReference = def(Node, function($) {
		this.initializer(function($super, document, name) {
			$super(document, ENTITY_REFERENCE_NODE)
			$(this).nodeName = name
		})
		this.attrReadOnly('nodeName')
	})

	var Notation = def(Node, function($) {
		this.initializer(function($super, document, name, publicId, systemId) {
			$super(document, NOTATION_NODE)
			$(this, {
				nodeName: name,
				publicId: publicId,
				systemId: systemId
			})
		})
		this.attrReadOnly('nodeName', 'publicId', 'systemId')
	})

	var ProcessingInstruction = def(Node, function($) {
		this.initializer(function($super, document, target, data) {
			$super(document, PROCESSING_INSTRUCTION_NODE)
			$(this, {
				target: target,
				data: data
			})
		})
		this.attrReadOnly('target')
		this.attrAlias('target', 'nodeName')
		this.attrReadWrite('data')
	})

	return {
		ELEMENT_NODE: ELEMENT_NODE,
		ATTRIBUTE_NODE: ATTRIBUTE_NODE,
		TEXT_NODE: TEXT_NODE,
		CDATA_SECTION_NODE: CDATA_SECTION_NODE,
		ENTITY_REFERENCE_NODE: ENTITY_REFERENCE_NODE,
		ENTITY_NODE: ENTITY_NODE,
		PROCESSING_INSTRUCTION_NODE: PROCESSING_INSTRUCTION_NODE,
		COMMENT_NODE: COMMENT_NODE,
		DOCUMENT_NODE: DOCUMENT_NODE,
		DOCUMENT_TYPE_NODE: DOCUMENT_TYPE_NODE,
		DOCUMENT_FRAGMENT_NODE: DOCUMENT_FRAGMENT_NODE,
		NOTATION_NODE: NOTATION_NODE,

		Node: Node,
		NodeList: NodeList,
		NamedNodeMap: NamedNodeMap,
		Attr: Attr,
		CharacterData: CharacterData,
		Text: Text,
		CDATASection: CDATASection,
		Comment: Comment,
		Document: Document,
		DocumentFragment: DocumentFragment,
		DocumentType: DocumentType,
		Element: Element,
		Entity: Entity,
		EntityReference: EntityReference,
		Notation: Notation,
		ProcessingInstruction: ProcessingInstruction
	}
})()