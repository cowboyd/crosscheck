before(function() {
	//noinspection JSUndeclaredVariable
	document = new Document()
})


it("can create a valid attribute", function() {
	var attr = document.createAttribute("we")
	assertEquals("we", attr.nodeName)
})


it("maintains correct_child_order with splitText", function() {
	var parent = document.createElement('div');
	var original = document.createTextNode('onetwo');
	parent.appendChild(original);

	var result = original.splitText(3);
	assertEquals('two', result.data)
	assertEquals(original, parent.firstChild);
	assertEquals(result, parent.lastChild);
})

it("can split text", function() {
	var original = document.createTextNode('onetwo');

	var result = original.splitText(0)

	assertEquals('', original.data)
	assertEquals('onetwo', result.data)

	original = result
	result = original.splitText(3)
	assertEquals('one', original.data)
	assertEquals('two', result.data)

	original = result
	result = original.splitText(3)
	assertEquals('two', original.data)
	assertEquals('', result.data)
})


it("appends a new node to parent when splitting text", function() {
	var parent = document.createElement('div');
	var original = parent.appendChild(document.createTextNode('onetwo'))
	var result = original.splitText(3)

	assertEquals(parent, original.parentNode)
	assertEquals(parent, result.parentNode)
})

it("can split CDATASections", function() {
	var parent = document.createElement('div')
	var original = parent.appendChild(document.createCDATASection('onetwo'))
	var result = original.splitText(3)

	assertEquals('two', result.data)
	assertEquals(original, parent.firstChild)
	assertEquals(result, parent.lastChild)
	//noinspection JSUnresolvedVariable
	assertEquals(CDATA_SECTION_NODE, result.nodeType, 0)
})

it("can insertBefore with null reference node", function() {
	var element = document.createElement('div');
	element.insertBefore(document.createElement('span'), null);
	assertEquals(1, element.childNodes.length, 0);
})

it("appends to children when calling insertBefore with a null reference node", function() {
	var element = document.createElement('div');
	var first = element.appendChild(document.createElement('span'));

	var next = element.insertBefore(document.createElement('span'), null);
	assertEquals(first, element.firstChild);
	assertEquals(next, element.lastChild);
})

it("can set an attribute", function() {
	var div = document.createElement('div')
	div.setAttribute('we', 'await')
	assertEquals('await', div.getAttribute('we'))
	var node = div.getAttributeNode('we')
	assertEquals('we', node.name)
	assertEquals('await', node.value)
})
//
it("has attributes that are available via index", function() {
	var div = document.createElement('div')
	div.setAttribute('we', 'await')
	div.setAttribute('silent', 'tristeros')
	div.setAttribute('empire', '')
	assertEquals(3, div.attributes.length, 0);

	var we = div.getAttributeNode('we');
	assertEquals(we, div.attributes.item(0))
	var silent = div.getAttributeNode('silent');
	assertEquals(silent, div.attributes.item(1))

	assertEquals(we, div.attributes[0]);
	assertEquals(silent, div.attributes[1]);
})

it("can overwrite an attribute, yet stil preserve its index", function() {
	var div = document.createElement('div')
	div.setAttribute('we', 'await')
	assertEquals('we', div.attributes[0].name)
	assertEquals('await', div.attributes[0].value)
	div.setAttribute('we', 'leave')
	assertEquals('leave', div.attributes[0].value)
})


it("has childNodes available via an index", function() {
	var source = document.createElement('div')
	source.appendChild(document.createElement('span'))
	source.appendChild(document.createElement('span'))

	assertEquals(2, source.childNodes.length, 0);

	var child0 = source.childNodes.item(0);
	var child1 = source.childNodes.item(1);

	assertEquals(child0, source.childNodes[0]);
	assertEquals(child1, source.childNodes[1]);

	var child2 = source.appendChild(document.createElement('input'));
	assertEquals(child2, source.childNodes[2]);

	var child3 = source.insertBefore(document.createElement('input'), child2);
	assertEquals(child3, source.childNodes[2]);
	assertEquals(child2, source.childNodes[3]);

	var child4 = document.createElement('input');
	source.replaceChild(child4, child0);
	assertEquals(child4, source.childNodes[0]);

	source.removeChild(child2);
	assertEquals('undefined', typeof source.childNodes[3]);
})

test("cloneNode shallow", function() {
	//<div id='wicker' style='margin-right:10px; border: 10px solid #F00;'>
	//<!--comment-->
	//<span><strong>man</strong></span>
	//</div>

	var wicker = document.createElement('div')
	wicker.setAttribute('id', 'wicker')
	wicker.setAttribute('style', 'margin-right: 10px;')
	wicker.appendChild(document.createComment('comment'))

	var span = document.createElement('span')
	var strong = document.createElement('strong')
	strong.appendChild(document.createTextNode('man'))
	span.appendChild(strong)
	wicker.appendChild(span)

	var clone = wicker.cloneNode(false)

	assertEquals(true, clone != null);
	assertEquals(false, wicker == clone);
	assertEquals('div', clone.tagName)
	assertEquals(ELEMENT_NODE, clone.nodeType, 0)
	assertEquals(document, clone.ownerDocument)
	assertEquals(false, clone.hasChildNodes())
	assertEquals('wicker', clone.getAttribute('id'));
	assertEquals('margin-right: 10px;', clone.getAttribute('style'));
})

test("cloneNode deep", function() {
	//<div id='wicker' style='margin-right:10px; border: 10px solid #F00;'>
	//<!--comment-->
	//<span><strong>man</strong></span>
	//</div>

	var wicker = document.createElement('div')
	wicker.setAttribute('id', 'wicker')
	wicker.setAttribute('style', 'margin-right: 10px;')
	wicker.appendChild(document.createComment('comment'))

	var span = document.createElement('span')
	var strong = document.createElement('strong')
	strong.appendChild(document.createTextNode('man'))
	span.appendChild(strong)
	wicker.appendChild(span)


	var clone = wicker.cloneNode(true);
	assertEquals(true, clone != null)
	assertEquals(true, wicker != clone);
	assertEquals('div', clone.tagName)
	assertEquals(ELEMENT_NODE, clone.nodeType, 0)
	assertEquals(document, clone.ownerDocument)
	assertEquals(2, clone.childNodes.length, 0)
	assertEquals('wicker', clone.getAttribute('id'))
	assertEquals('margin-right: 10px;', clone.getAttribute('style'))

	var comment = clone.childNodes.item(0);
	assertEquals(true, comment != null)
	assertEquals('#comment', comment.nodeName)
	assertEquals(COMMENT_NODE, comment.nodeType, 0)
	assertEquals(document, comment.ownerDocument)
	assertEquals('comment', comment.nodeValue)
	assertEquals('comment', comment.data);

	var cspan = clone.childNodes.item(1);
	assertEquals('span', cspan.tagName)
	assertEquals(ELEMENT_NODE, cspan.nodeType, 0)
	assertEquals(document, cspan.ownerDocument)
	assertEquals(1, cspan.childNodes.length, 0)

	var cstrong = span.childNodes.item(0);
	assertEquals('strong', cstrong.nodeName)
	assertEquals(ELEMENT_NODE, cstrong.nodeType, 0)
	assertEquals(document, cstrong.ownerDocument)
	assertEquals(1, cstrong.childNodes.length, 0)

	var text = strong.childNodes.item(0);
	assertEquals('#text', text.nodeName)
	assertEquals(cstrong, text.parentNode)
	assertEquals(TEXT_NODE, text.nodeType, 0)
	assertEquals(document, text.ownerDocument)
	assertEquals('man', text.nodeValue)
	assertEquals('man', text.data)
})

test("getElementsByName", function() {
	var div1 = document.documentElement.appendChild(document.createElement('div'));
	div1.appendChild(document.createElement('span'));
	div1.appendChild(document.createElement('div'));
	div1.appendChild(document.createElement('span'));
	var span1 = div1.appendChild(document.createElement('span'));
	var div3 = span1.appendChild(document.createElement('div'));
	var div4 = div3.appendChild(document.createElement('div'));

	document.documentElement.setAttribute('name', 'bob');
	div1.setAttribute('name', 'bob');
	div4.setAttribute('name', 'bob');

	var list = document.getElementsByName('bob');
	assertEquals(3, list.length, 0)
	assertEquals(document.documentElement, list.item(0))
	assertEquals(div1, list.item(1))
	assertEquals(div4, list.item(2))
})

test("removeAttribute", function() {
	var div = document.createElement('div')

	div.setAttribute('name', 'bob');
	assertEquals('bob', div.getAttribute('name'));
	div.removeAttribute('name');
	assertEquals(true, div.getAttribute('name') == null);
})

test("getElementsByTagName", function() {
	var top = document.createElement('div')
	var div1 = document.createElement('div');
	top.appendChild(div1)
	div1.appendChild(document.createElement('span'));
	var div2 = div1.appendChild(document.createElement('div'));
	div1.appendChild(document.createElement('span'));
	var span1 = div1.appendChild(document.createElement('span'));
	var div3 = span1.appendChild(document.createElement('div'));
	var div4 = div3.appendChild(document.createElement('div'));

	var list = top.getElementsByTagName('div');

	assertEquals(4, list.length, 0);
	assertEquals(div1, list.item(0));
	assertEquals(div2, list.item(1));
	assertEquals(div3, list.item(2));
	assertEquals(div4, list.item(3));

	list = div1.getElementsByTagName('div');

	assertEquals(3, list.length, 0);
	assertEquals(div2, list.item(0));
	assertEquals(div3, list.item(1));
	assertEquals(div4, list.item(2));

	list = top.getElementsByTagName('*')
	assertEquals(7, list.length, 0)
})

test("createAttribute", function() {
	var attr = document.createAttribute('name');
	assertEquals('name', attr.name);
	assertEquals('', attr.value);
	assertEquals(document, attr.ownerDocument);
})

test("createComment", function() {
	var comment = document.createComment('test comment');
	assertEquals('test comment', comment.data);
	assertEquals(document, comment.ownerDocument);
})

test("createTextNode", function() {
	var text = document.createTextNode('bargain with the raisin girl');
	assertEquals('bargain with the raisin girl'.length, text.length, 0);
	assertEquals('bargain with the raisin girl', text.data);
	assertEquals('bargain with the raisin girl', text.nodeValue);
	assertEquals(document, text.ownerDocument);
})

test("createElement", function() {
	var element = document.createElement('div');
	assertEquals('div', element.nodeName);
	assertEquals(document, element.ownerDocument);
	element = document.createElement('DiV')
	assertEquals('DiV', element.tagName)
})

test("createElement without a name throws an error", function() {
	try {
		document.createElement();
		assertEquals("should have errored", false, true)
	} catch(e) {

	}
})

test("default element properties", function() {
	var element = document.createElement('div');
	//noinspection JSUnresolvedVariable
	assertEquals(ELEMENT_NODE, element.nodeType, 0);
	assertEquals('div', element.nodeName);

	//properties defined on Node
	assertEquals('div', element.nodeName);
	assertEquals(true, element.nodeValue == null);
	//noinspection JSUnresolvedVariable
	assertEquals(ELEMENT_NODE, element.nodeType, 0);
	assertEquals(true, element.parentNode == null);

	assertEquals(false, element.childNodes == null);
	assertEquals(0, element.childNodes.length, 0);

	assertEquals(true, element.firstChild == null);
	assertEquals(true, element.lastChild == null);
	assertEquals(true, element.previousSibling == null);
	assertEquals(true, element.nextSibling == null);
	assertEquals(0, element.attributes.length, 0);
	assertEquals(document, element.ownerDocument);

	//properties defined on Element
	assertEquals(element.nodeName, element.tagName);
})

test("appendChild", function() {
	var parent = document.createElement('div');
	var child = parent.appendChild(document.createElement('span'));

	assertEquals(parent, child.parentNode);
	assertEquals(true, parent.hasChildNodes());
	assertEquals(child, parent.firstChild);
	assertEquals(child, parent.lastChild);
	assertEquals(1, parent.childNodes.length, 0);
	assertEquals(child, parent.childNodes.item(0));
})

test("appendChild with DocumentFragment", function() {
	var parent = document.createElement('div')
	var one = document.createElement('div')
	var two = document.createElement('div')
	var three = document.createElement('div')

	var fragment = document.createDocumentFragment()
	fragment.appendChild(one)
	fragment.appendChild(two)
	fragment.appendChild(three)
	parent.appendChild(fragment)

	assertEquals(3, parent.childNodes.length, 0)
	assertEquals(one, parent.firstChild)
	assertEquals(two, parent.childNodes.item(1))
	assertEquals(three, parent.lastChild)

	assertEquals(0, fragment.childNodes.length, 0)
})

it("throws an error when you try to append a child from a different document", function() {
	var parent = document.createElement('div')
	var child = new Document().createElement('span')
	try {
		parent.appendChild(child)
		assertEquals('should have thrown an error', true, false)
	} catch (e) {}
})

test("insertBefore", function() {
	var parent = document.createElement('div');
	var refChild = parent.appendChild(document.createElement('span'));
	var lastChild = parent.appendChild(document.createElement('span'));
	var newChild = document.createElement('strong');

	var result = parent.insertBefore(newChild, refChild);
	assertEquals(newChild, result);

	assertEquals(3, parent.childNodes.length, 0);
	assertEquals(newChild, parent.childNodes.item(0));
	assertEquals(refChild, parent.childNodes.item(1));
	assertEquals(lastChild, parent.childNodes.item(2));

	assertEquals(parent, newChild.parentNode);
})

test("insertBefore with a DocumentFragment", function() {
	var parent = document.createElement('div')
	var fragment = document.createDocumentFragment()
	var one = document.createElement('div')
	var two = document.createElement('div')
	var three = document.createElement('div')
	fragment.appendChild(one)
	fragment.appendChild(two)
	fragment.appendChild(three)

	var ref = document.createElement('div')
	parent.appendChild(ref)
	parent.insertBefore(fragment, ref)
	assertEquals(4, parent.childNodes.length, 0)
	assertEquals(one, parent.firstChild)
	assertEquals(two, parent.childNodes.item(1))
	assertEquals(three, parent.childNodes.item(2))
	assertEquals(ref, parent.lastChild)

	assertEquals(0, fragment.childNodes.length, 0)
})

test("removeChild", function() {
	var parent = document.createElement('div');
	var child1 = parent.appendChild(document.createElement('span'));
	var child2 = parent.appendChild(document.createElement('span'));
	var child3 = parent.appendChild(document.createElement('span'));

	var result = parent.removeChild(child2);
	assertEquals(child2, result);

	assertEquals(2, parent.childNodes.length, 0);
	assertEquals(child1, parent.childNodes.item(0));
	assertEquals(child3, parent.childNodes.item(1));

	assertEquals(true, child2.parentNode == null);
})

test("adding a child to a different node removes that child from its child list", function() {
	var mother = document.createElement('div')
	var father = document.createElement('div')
	var johnBoy = document.createElement('div')
	var maryJoe = document.createElement('div')
	mother.appendChild(johnBoy)
	mother.appendChild(maryJoe)
	father.appendChild(johnBoy)
	father.insertBefore(maryJoe, johnBoy)
	assertEquals(maryJoe, father.firstChild)
	assertEquals(johnBoy, father.lastChild)
	assertEquals(0, mother.childNodes.length, 0)
})


test("replaceChild", function() {
	var parent = document.createElement('div');
	var child1 = parent.appendChild(document.createElement('span'));
	var child2 = parent.appendChild(document.createElement('span'));
	var child3 = parent.appendChild(document.createElement('span'));
	var replacement = document.createElement('span');

	var result = parent.replaceChild(replacement, child2);
	assertEquals(child2, result);

	assertEquals(3, parent.childNodes.length, 0);
	assertEquals(child1, parent.childNodes.item(0));
	assertEquals(replacement, parent.childNodes.item(1));
	assertEquals(child3, parent.childNodes.item(2));

	assertEquals(true, child2.parentNode == null);
	assertEquals(parent, replacement.parentNode);
})

test("nextSibling", function() {
	var parent = document.createElement('div');
	var child1 = parent.appendChild(document.createElement('span'));
	var child2 = parent.appendChild(document.createElement('p'));
	var child3 = parent.appendChild(document.createElement('em'));

	assertEquals(child2, child1.nextSibling);
	assertEquals(child3, child2.nextSibling);
	assertEquals(true, child3.nextSibling == null);
})
