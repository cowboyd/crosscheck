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
		this.attrReadOnly('nextSibling', function() {
			if (this.parentNode) {
				var children = $(this.parentNode).children;
				var idx = children.indexOf(this)
				return children.length - idx > 1 ? children[idx + 1] : null
			} else {
				return null
			}
		})
		this.attrReadOnly('previousSibling', function() {
			if (this.parentNode) {
				var children = $(this.parentNode).children
				var idx = children.indexOf(this)
				return idx > 0 ? children[idx - 1] : null
			} else {
				return null
			}
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
					return $(this).insertAt(newChild, this.childNodes.length)
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
					$(this).children.splice(index, 1)
					$(oldChild).parentNode = null
				}
				return oldChild
			},
			replaceChild: function(newChild, oldChild) {
				var index = $(this).children.indexOf(oldChild)
				if (index >= 0) {
					this.removeChild(oldChild)
					$(this).insertAt(newChild, index)
				}
				return oldChild
			}
		})

		//noinspection JSUnresolvedFunction
		this.privateMethods({
			insertAt: function(newChild, index) {
				if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
					var children = newChild.childNodes
					for (var i = 0; i < children.length; i++) {
						$(this).insertAt(children.item(i), index + i)
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
				$(this).insertAt(newChild, $(this).children.indexOf(refChild) + 1)
			}
		})

	})

	var NodeList = def(function($) {
		//noinspection JSUnresolvedFunction
		this.initializer(function(list) {
			$(this).elements = new Array(list.length)
			for (var i = 0; i < list.length; i++) {
				$(this).elements[i] = list[i]
			}
		})

		//noinspection JSUnresolvedFunction
		this.attrReadOnly('length', function() {
			return $(this).elements.length
		})

		//noinspection JSUnresolvedFunction
		this.methods({
			item: function(index) {
				return $(this).elements[index]
			}
		})

		this.indexedLookup(function(index) {
			return this.item(index)
		})
	})

	var NamedNodeMap = def(function($) {
		//noinspection JSUnresolvedFunction
		this.initializer(function() {
			$(this, {
				map: new java.util.HashMap(),
				elements: [] //used for referencing attributes by index.
			})
		})

		//noinspection JSUnresolvedFunction
		this.attrReadOnly('length', function() {
			return $(this).map.size()
		})
		//noinspection JSUnresolvedFunction,JSUnusedLocalSymbols,JSUnusedLocalSymbols
		this.methods({
			getNamedItem: function(name) {
				var entry = $(this).map.get(name);
				return entry ? entry.value : null
			},
			item: function(index) {
				return $(this).elements[index]
			},
			removeNamedItem: function(name) {
				var entry = $(this).map.get(name)
				if (entry) {
					$(this).map.remove(name)
					$(this).elements.splice(entry.index, 1)
					return entry.value
				} else {
					throw "NOT_FOUND_ERR"
				}
			},
			setNamedItem: function(node) {
				var entry = $(this).map.get(node.nodeName)
				if (entry) {
					var oldAttr = entry.value;
					entry.value = node
					$(this).elements[entry.index] = node
					return oldAttr
				} else {
					entry = {
						value: node,
						index: $(this).elements.length
					}
					$(this).map.put(node.nodeName, entry)
					$(this).elements.push(node)
					return null
				}
			}
		})

		this.indexedLookup(function(index) {
			return this.item(index)
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
			$super(document, nodeType, data)
		})
		this.attrReadOnly('nodeName', "#text")
		this.method('splitText', function(offset) {
			var unsplit = $(this).data
			$(this).data = unsplit.slice(0, offset)
			var doc = this.ownerDocument;
			var nextData = unsplit.slice(offset).join('')
			var next = this.nodeType == CDATA_SECTION_NODE ? doc.createCDATASection(nextData) : doc.createTextNode(nextData)
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
			createAttribute: function(name) {
				return new Attr(this, name, null, false)
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
			getAttributeNode: function(name) {
				return this.attributes.getNamedItem(name)
			},
			getElementsByTagName: function(name) {
				return new NodeList($(this).searchElementsByTagName(name, []))
			},
			hasAttribute: function(name) {
				return this.getAttributeNode(name) ? true : false
			},
			removeAttribute: function(name) {
				this.attributes.removeNamedItem(name)
			},
			removeAttributeNode: function(attr) {
				this.attributes.removeNamedItem(attr.name)
			},
			setAttribute: function(name, value) {
				var attr = this.ownerDocument.createAttribute(name)
				attr.value = value
				this.attributes.setNamedItem(attr)
			},
			setAttributeNode: function(attr) {
				this.attributes.setNamedItem(attr)
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