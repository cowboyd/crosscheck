package crosscheck.dom;

import org.ccil.cowan.tagsoup.Parser;
import org.xml.sax.*;

import java.io.IOException;
import java.io.StringReader;


public class HTMLParser {

	public static void main(String[] args) throws IOException, SAXException {
		Parser parser = new Parser();
		parser.setContentHandler(new ContentHandler() {
			public void setDocumentLocator(Locator locator) {
				System.out.println("locator = " + locator);
			}

			public void startDocument() throws SAXException {
				System.out.println("startDocument()\n");
			}

			public void endDocument() throws SAXException {
				System.out.println("endDocument()\n");
			}

			public void startPrefixMapping(String s, String s1) throws SAXException {
				System.out.format("startPrefixMapping(%s,%s)\n", s, s1);
			}

			public void endPrefixMapping(String s) throws SAXException {
				System.out.format("endPrefixMapping(%s)\n", s);
			}

			public void startElement(String s, String s1, String s2, Attributes attributes) throws SAXException {
				System.out.format("startElement(%s,%s,%s)\n", s, s1, s2.toString());
			}

			public void endElement(String s, String s1, String s2) throws SAXException {
				System.out.format("endElement(%s,%s,%s)\n", s, s1, s2.toString());
			}

			public void characters(char[] chars, int i, int i1) throws SAXException {
				System.out.format("characters(%s,%d,%d)\n", new String(chars), i, i1);
			}

			public void ignorableWhitespace(char[] chars, int i, int i1) throws SAXException {
				System.out.format("ignorableWhitespace(%s,%d,%d)\n", new String(chars),i,i1);
			}

			public void processingInstruction(String s, String s1) throws SAXException {
				System.out.format("processingInstruction(%s, %s)\n", s, s1);
			}

			public void skippedEntity(String s) throws SAXException {
				System.out.format("skipppedEntity(%s)\n");
			}
		});
		parser.parse(new InputSource(new StringReader("<div/>")));
	}
}
