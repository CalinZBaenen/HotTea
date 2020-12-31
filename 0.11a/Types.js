
/**
* A `TypedObject` is an `Object` that is strongly typed using a blueprint.
* @param {object} blueprint A map consisting of keys and types (e.g. `{"name": String}`).
* @param {boolean} strict Determines if primitive types should be treated as their `Object` equivalents.
* @param {object} base The default values of each key. Throws an error if the key doesn't exist, or if the type doesn't match with the one in the blueprint.
*/
const TypedObject = globalThis.TypedObject = function TypedObject(
	blueprint, strict=true, base=new Object()
) {
	if(base === null || typeof base != "object") base = new Object();


	if(blueprint === null || typeof blueprint != "object") blueprint = new Object();
	blueprint = Object.freeze(blueprint);

	if(typeof strict != "boolean") strict = true;


	const container = new Object();
	const instance = new Proxy(new Object(), {

		get: function get(...args) {
			const p = args[1];
			if(!container.hasOwnProperty(p))
				throw ReferenceError("key '"+String(p)+"' does not exist");
			return container[p];
		},
		set: function set(...args) {
			const p = args[1];
			let v = args[2];

			if(!container.hasOwnProperty(p))
				throw ReferenceError("key '"+String(p)+"' does not exist");


			let primitive = "";
			if(isprimitive(v) && v !== undefined) primitext = "(primitive)";

			if(
				v instanceof blueprint[p] ||
				(isprimitive.of(v, blueprint[p], false) && !strict) ||
				v === null
			) {
				container[p] = v;
				return;
			}
			if(v === undefined) v = new (class undefined {})();
			throw TypeError(
				"type "+v.constructor.name+primitext+" does not match the required type "+
				blueprint[p].name
			);
		}

	});

	for(const key in blueprint) container[key] = null;



	for(const key in base) instance[key] = base[key];
	return Object.seal(instance);
};



/**
* Returns whether a given value is a primitive or not.
* @param {*} v The value to test.
*/
const isprimitive = globalThis.isprimitive = function isprimitive(v) {
	if(v === undefined) return true;
	if(v === null) return false;
	return Boolean(
		!(typeof v == typeof new v.constructor(v)) &&
		typeof v != "object"
	);
};

/**
* Test if a value is the primitive version of another value.
* @param {*} v The value to test.
* @param {function} t The type to test for.
* @param {boolean} strict Determines if `Object`s can be treated as primitives. When set to be true, only primitives can let the method return `true`.
*/
isprimitive.of = function of(v, t, strict=true) {
	if(typeof strict != "boolean") strict = true;

	if(
		v === undefined ||
		(!isprimitive(v) && strict) ||
		(typeof t != "function" && typeof t != "class")
	) return false;
	return Boolean(new v.constructor() instanceof t);
};

Object.freeze(isprimitive);