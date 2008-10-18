
crosscheck.dom = {
	impl: {
		Node: function(document, nodeType) {
			this._document = document
			this._nodeType = nodeType
			this._children = []
		}
	},

	defclass: function(proto, extend) {
		var ctor = function() {
			this.constructor = arguments.callee
			var initialize = this.initialize
			if (initialize) {
				initialize.apply(this, arguments)
			}
		}
		ctor.prototype = proto
		if (extend) {
			for (property in extend) {
				ctor.prototype[property] = extend[property]
			}
			if (extend.__get__) {
				for (var prop in extend.__get__) {
					ctor.prototype.__defineGetter__(prop, extend.__get__[prop])
				}
			}
			if (extend.__set__) {
				for (var prop in extend.__set__) {
					ctor.prototype.__defineSetter__(prop, extend.__set__[prop])
				}
			}
		}
		return ctor
	},
	tagsoup: {
		java: Packages.org.ccil.cowan.tagsoup
	}
}

crosscheck.dom.impl.Node.prototype = {
	ELEMENT_NODE: 1,
	ATTRIBUTE_NODE: 2,
	TEXT_NODE: 3,
	CDATA_SECTION_NODE: 4,
	ENTITY_REFERENCE_NODE: 5,
	ENTITY_NODE: 6,
	PROCESSING_INSTRUCTION_NODE: 7,
	COMMENT_NODE: 8,
	DOCUMENT_NODE: 9,
	DOCUMENT_TYPE_NODE: 10,
	DOCUMENT_FRAGMENT_NODE: 11,
	NOTATION_NODE: 12,

	get attributes() {return null},
	get childNodes() {return new crosscheck.dom.impl.NodeList(this._children)},
	get firstChild() {return this.hasChildNodes() ? this.childNodes.item(0) : null},
	get lastChild() {return this.hasChildNodes() ? this.childNodes.item(this.childNodes.length - 1): null},
	get localName() {return this._localName},
	get namespaceURI() {return this._nsURI},
	get nodeType() {return this._nodeType},
	get nodeValue() {return null},
	set nodeValue(value) {},
	get ownerDocument() {return this._document},
	get parentNode() {return this._parentNode},
	get prefix() {return this._prefix},
	set prefix(value) {},
	get previousSibling() {return null},

	appendChild: function(child) {
		return this.insertBefore(child, null)
	},

	cloneNode: function(deep) {
		return null
	},

	hasAttributes: function() {
		return false
	},

	hasChildNodes: function() {
		return this._children.length > 0
	},

	insertBefore: function(newChild, refChild) {
		var index = this._children.indexOf(refChild);
		if (index < 0) {
			this.__insertAt(newChild, this.childNodes.length - 1)
		} else {
			this.__insertAt(newChild, index)
		}
		return newChild
	},
	
	isSupported: function(feature, version) {
		throw 'unsupported'
	},

	normalize: function() {
		throw 'unsupported'
 	},

	removeChild: function(oldChild) {
		var index = this._children.indexOf(oldChild)
		if (index >= 0) {
			this._children.splice(index, 1)
			oldChild._parentNode = null
		}
	},

	replaceChild: function(newChild, oldChild) {
		var index = this._children.indexOf(oldChild)
		if (index > 0) {
			this.insertBefore(newChild, oldChild)
			this.removeChild(oldChild)
		}
	},

	__insertAt: function(newChild, index) {
		if (newChild.nodeType == this.DOCUMENT_FRAGMENT_NODE) {
			var children = newChild.childNodes;
			for (var i = 0; i < children.length; i++) {
				this.__insertAt(children[i], index + i)
			}
		} else {
			if (newChild.parentNode) {
				newChild.parentNode.removeChild(newChild)
			}
			newChild._parentNode = this
			this._children.splice(index, 0, newChild)
		}
	},

	__insertAfter: function(newChild, refChild) {
		this.__insertAt(newChild, this._children.indexOf(refChild))
	}
}


crosscheck.dom.impl.NodeList = crosscheck.dom.defclass(new Object(), {
	initialize: function(list) {
		this._list = new Array(list.length)
		for (var i = 0; i < list.length; i++) {
			this._list[i] = list[i]
		}
		this.__defineGetter__("length", function() {return this._list.length})
	},

	item: function(index) {
		return this._list[index]	
	}
})

crosscheck.dom.impl.NamedNodeMap = function() {
		this._values = new Array()
		this._map = new Object()
}

crosscheck.dom.impl.NamedNodeMap.prototype = {
	get length() {return this._values.length},

	getNamedItem: function(name) {
		return this._values[this._map[name]]
	},
	getNamedItemNS: function(namespaceURL, localName) {
		throw 'unsupported'
	},
	item: function(index) {
		return this._values[index]
	},
	removeNamedItem: function(name) {
		var index = this._map[name]
		this._values.splice(index,1)
		for (var key in this._map) {
			if (this._map[key] == index) {
				delete this._map[key]
				break;
			}
		}
	},
	removeNamedItemNS: function(namespaceURI, localName) {
		throw 'unsupported'
	},

	setNamedItem: function(node) {
		var index = this._map[node.nodeName]
		if (!index) {
			index = this._values.length
			this._values.push(node)
		} else {
			this._values[index] = node
		}
		this._map[node.nodeName] = index
	},

	setNamedItemNS: function(node) {
		throw 'unsupported'
	},

	__remove__: function(item) {
		var index = this._values.indexOf(item)
		if (index >= 0) {
			this._values.splice(index, 1)
			delete this._map[item.name]
		}
	}
}

crosscheck.dom.impl.Attr = crosscheck.dom.defclass(new crosscheck.dom.impl.Node(), {

	initialize: function(document, name, value, specified) {
		crosscheck.dom.impl.Node.call(this, document, this.ATTRIBUTE_NODE)
		this._name = name
		this._value = value
		this._specified = specified
	},

	__get__: {
		nodeName: function() {return this.name},
		nodeValue: function() {return this.value},

		name: function() {return this._name},
		value: function() {return this._value},
		specified: function() {return this._specified},
		ownerElement: function() {return this._element}
	},

	__set__: {
		value: function(value) {this._value = value}
	}
})

crosscheck.dom.impl.CharacterData = crosscheck.dom.defclass(new crosscheck.dom.impl.Node(), {

	initialize: function(document, nodeType, data) {
		crosscheck.dom.impl.Node.call(this, document, nodeType)
		this.data = data ? data : ''
	},

	__get__: {

		nodeValue: function() {return this.data},

		length: function() {return this._data.length},
		data: function() {return this._data.join('')}
	},

	__set__: {
		data: function(str) {this._data = str.split('')}
	},

	appendData: function(data) {
		this._data = this._data.concat.apply(this._data, data.split(''))
	},
	deleteData: function(offset, count) {
		this._data.splice(offset, count)
	},
	insertData: function(offset, data) {
		this.replaceData(offset, 0, data)
	},
	replaceData: function(offset, count, data) {
		this._data.splice(offset, count, data.split(''))
	},
	substringData: function(offset, count) {
		return this._data.slice(offset, offset + count).join('')
	}
})

crosscheck.dom.impl.Text = crosscheck.dom.defclass(new crosscheck.dom.impl.CharacterData(), {
	initialize: function(document, nodeType, data) {
		if (!nodeType) nodeType = this.TEXT_NODE
		crosscheck.dom.impl.CharacterData.prototype.initialize.call(this, document, nodeType, data)
	},

	__get__: {
		nodeName: function() {return "#text"}
	},

	splitText: function(offset) {
		var unsplit = this.data

		this.data = unsplit.slice(0, offset)
		var next = this.ownerDocument.createTextNode(unsplit.slice(offset))
		if (this.parentNode) {
			this.parentNode.__insertAfter(next, this)
		}
		return next
	}
})

crosscheck.dom.impl.CDATASection = crosscheck.dom.defclass(new crosscheck.dom.impl.Text(), {
	initialize: function(document, data) {
		crosscheck.dom.impl.Text.prototype.initialize.call(this, document, this.CDATA_SECTION_NODE, data)
	},

	__get__: {
		nodeName: function() {return "#cdata-section"}
	}
})

crosscheck.dom.impl.Comment = crosscheck.dom.defclass(new crosscheck.dom.impl.CharacterData(), {
	initialize: function(document) {
		crosscheck.dom.impl.CharacterData.prototype.initialize.call(this, document, this.COMMENT_NODE, data)
	},

	__get__: {nodeName: function() {return "#comment"}}
})

crosscheck.dom.impl.Document = crosscheck.dom.defclass(new crosscheck.dom.impl.Node(), {
	initialize: function() {
		crosscheck.dom.impl.Node.call(this, null, this.DOCUMENT_NODE)
	},

	__get__: {
		nodeName: function() {return "#document"},
		doctype: function() {throw 'unsupported'},
		implementation: function() {throw 'unsupported'},
		documentElement: function() {throw 'unsupported'}
	},

	getElementById: function(id) {
		throw 'unsupported'
	},

	getElementsByTagName: function() {
		throw 'unsupported'
	},

	getElementsByTagNameNS: function() {
		throw 'unsupported'
	},

	createAttribute: function(name) {
		return new crosscheck.dom.impl.Attr(this, name, null, false)
	},
	createAttributeNS: function(namespaceURI, qualifiedName) {
		throw 'unsupported'
	},
	createCDATASection: function(data) {
		return new crosscheck.dom.impl.CDATASection(this, data)
	},
	createComment: function(data) {
		return new crosscheck.dom.impl.Comment(this, data)
	},

	createDocumentFragment: function() {
		return new crosscheck.dom.impl.DocumentFragment(this)
	},

	createElement: function(tagName) {
		return new crosscheck.dom.impl.Element(this, tagName)
	},

	createElementNS: function() {
		throw 'unsupported'
	},

	createEntityReference: function(name) {
		return new crosscheck.dom.impl.EntityReference(this, name)
	},

	createProcessingInstruction: function(target, data) {
		return new crosscheck.dom.impl.ProcessingInstruction(this, target, data)
	},

	createTextNode: function(data) {
		return new crosscheck.dom.impl.Text(this, null, data)
	},

	importNode: function(deep) {
		throw 'unsupported'
	}
	
})

crosscheck.dom.impl.DocumentFragment = crosscheck.dom.defclass(new crosscheck.dom.impl.Node(), {
	initialize: function(document) {
		crosscheck.dom.impl.Node.call(this, document, this.DOCUMENT_FRAGMENT_NODE)
	},

	__get__: { nodeName: function() {return "#document-fragment"}}
})

crosscheck.dom.impl.DocumentType = crosscheck.dom.defclass(new crosscheck.dom.impl.Node(), {
	initialize: function(document) {
		crosscheck.dom.impl.Node.call(this, document, this.DOCUMENT_TYPE_NODE)
	}

//	get entities() {return null},
//	get internalSubset() {return null},
//	get name() {return null},
//	get notations() {return null},
//	get publicId() {return null},
//	get systemId() {return null}
})

crosscheck.dom.impl.Element = crosscheck.dom.defclass(new crosscheck.dom.impl.Node(), {
	initialize: function(document, name) {
		crosscheck.dom.impl.Node.call(this, document, this.ELEMENT_NODE)
		this._name = name
		this._attributes = new crosscheck.dom.impl.NamedNodeMap()
	},

	__get__: {

		nodeName: function() {return this.tagName},
		attributes: function() {return this._attributes},
		tagName: function() {return this._name}
	},

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
		throw 'unsupported'
	},

	getElementsByTagNameNS: function(name) {
		throw 'unsupported'
	},

	hasAttribute: function(name) {
		return this.getAttributeNode(name) ? true : false
	},

	hasAttributeNS: function(namespaceURI, localName) {
		return this.getAttributeNodeNS(namespaceURI, localName) ? true : false
	},

	removeAttribute: function(name) {
		this._attributes.removeNamedItem(name)
	},
	removeAttributeNS: function(namespaceURI, localName) {
		this._attributes.removeNamedItemNS(namespaceURI, localName)
	},
	removeAttributeNode: function(attr) {
		this._attributes.__remove__(attr)
	},
	setAttribute: function(name, value) {
		var attr = this.ownerDocument.createAttribute(name)
		attr.value = value
		this._attributes.setNamedItem(attr)
	},
	setAttributeNS: function(namespaceURI, localName, value) {
		var attr = this.ownerDocument.createAttributeNS(namespaceURI, localName)
		attr.value = value
		this._attributes.setNamedItemNS(attr)
	},
	setAttributeNode: function(attr) {
		this._attributes.setNamedItem(attr)
	},
	setAttributeNodeNS: function(attr) {
		this._attributes.setNamedItemNS(attr)
	}
})

crosscheck.dom.impl.Entity = crosscheck.dom.defclass(new crosscheck.dom.impl.Node(), {
	initialize: function(document, name, publicId, systemId) {
		crosscheck.dom.impl.Node.call(this, document, this.ENTITY_NODE)
		this._name = name
		this._publicId = publicId
		this._systemId = systemId
	},

	__get__: {
		nodeName: function() {return this._name},
		publicId: function() {return this._publicId},
		systemId: function() {return this._systemId}
	}
})

crosscheck.dom.impl.EntityReference = crosscheck.dom.defclass(new crosscheck.dom.impl.Node(), {
	initialize: function(document, name) {
		crosscheck.dom.impl.Node.call(this, document, this.ENTITY_REFERENCE_NODE)
		this._name = name
	},

	__get__: {nodeName: function() {return this._name}}
})

crosscheck.dom.impl.Notation = crosscheck.dom.defclass(new crosscheck.dom.impl.Node(), {
	initialize: function(document, name, publicId, systemId) {
		crosscheck.dom.impl.Node.call(this, document, this.NOTATION_NODE)
		this._name = name
		this._publicId = publicId
		this._systemId = systemId
	},

	__get__: {
		nodeName: function() {return this._name},

		publicId: function() {return this._publicId},
		systemId: function() {return this._systemId}
	}
})

crosscheck.dom.impl.ProcessingInstruction = crosscheck.dom.defclass(new crosscheck.dom.impl.Node(), {
	initialize: function(document, target, data) {
		crosscheck.dom.impl.Node.call(this, document, this.PROCESSING_INSTRUCTION_NODE)
		this._target = target
		this._data = data
	},

	__get__: {
		nodeName: function() {return this.target},

		target: function() {return this._target},
		data: function() {return this._data}
	},

	__set__: {
		data: function(data) {this._data = data}
	}
})
