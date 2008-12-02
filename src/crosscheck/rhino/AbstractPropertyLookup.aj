
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

aspect AbstractPropertyLookup {

	pointcut geti(Scriptable object, int index, Scriptable start): call(Object Scriptable.get(int, Scriptable)) && target(object) && args(index, start);
	pointcut gets(Scriptable object, String name, Scriptable start): call(Object Scriptable.get(String, Scriptable)) && target(object) && args(name, start);

	pointcut puti(Scriptable object, int index, Scriptable start, Object value): call(void Scriptable.put(int, Scriptable, Object)) && target(object) && args(index, start, value);
	pointcut puts(Scriptable object, String name, Scriptable start, Object value): call(void Scriptable.put(String, Scriptable, Object)) && target(object) && args(name, start, value);

	before(Scriptable object, int index, Scriptable start): geti(object, index, start) {
        //System.out.println("about to get indexed property of <" + object.getClass().getName() + ">: " + index);
	}

	before(Scriptable object, String name, Scriptable start): gets(object, name, start) {
		//System.out.println("about to get named property of <" + object.getClass().getName() + ">: " + name);
	}

	before(Scriptable object, int index, Scriptable start, Object value): puti(object, index, start, value) {
		//System.out.println("about to set indexed property of <" + object.getClass().getName() + ">: " + index + " -> " + value);
	}

	before(Scriptable object, String name, Scriptable start, Object value): puts(object, name, start, value) {
		//System.out.println("about to set named property of <" + object.getClass().getName() + ">: " + name + " -> " + value);
	}
}