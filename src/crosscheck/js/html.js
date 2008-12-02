
crosscheck.depends(crosscheck.java.js.dom)

crosscheck.html = (function() {
	var dom = crosscheck.dom

	var HTMLElement = crosscheck.metadef(new dom.Element(), function(self) {
		this.attrReadWrite('id', 'title', 'dir', 'lang')

		this.attrAccessor('innerHTML', {
			get: function() {

			},
			set: function(value) {

			}
		})
		
	})

	var HTMLHtmlElement = crosscheck.define(new dom.Element(), function() {
		this.attr_reader('version')
	})
	var HTMLDivElement
	var HTMLBodyElement

	var HTMLDocument = crosscheck.define(new dom.Document(), function() {
		var types = {
			html: HTMLHtmlElement,
			div: HTMLDivElement,
			body: HTMLBodyElement
		}
		this.methods({
			createElement: function(name) {
				var ElementType = types[name.toLowerCase()] || HTMLElement
				return new ElementType(this, name.toUpperCase())
			}
		})
	})

	return {
		HTMLDocument: HTMLDocument

	}
})()