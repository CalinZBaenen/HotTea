
/**
* Gets the type of any given value.
* @param {*} v The value to get the type of.
* @param {boolean} cn Decides if primitives (and `undefined`) get custom names (e.g. `undefined` => `void`).
*/
const type = globalThis.type = function type(v, cn) {
	if(v === undefined) {if(cn) return "void"; return "undefined"}
	if(v === null) v = new Object();

	if(cn) {
		if(isprimitive(v)) {
			const n = String(v.constructor.name).trim();
			const lc = n.toLowerCase();

			if(n === "undefined") return "void";
			if(n === "Number") return lc;
			if(n === "String") return lc;
			if(n === "BigInt") return lc;
			if(n === "Boolean") return "bool";
			if(n === "Symbol") return lc;

			return null;
		}
		return v.constructor.name;
	}
	return v.constructor.name;
};

/**
* Get the class a value belongs to.
* @param v The value to get the class of.
*/
type.class = function getClass(v) {
	if(v === undefined) return Void;
	if(v === null) v = new Object();
	return v.constructor;
};



/**
* A `TypedObject` is an `Object` that is strongly typed using a blueprint.
* @param {object} blueprint A map consisting of keys and types (e.g. `{"name": String}`).
* @param {boolean} strict Determines if primitive types should be treated as their `Object` equivalents.
* @param {object} base The default values of each key. Throws an error if the key doesn't exist, or if the type doesn't match with the one in the blueprint.
*/
const TypedObject = globalThis.TypedObject = function TypedObject(
	blueprint, strict=true, base=new Object()
) {
	"use strict";



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
				(v === undefined && blueprint[p] === Void) ||
				v instanceof blueprint[p] ||
				(isprimitive.of(v, blueprint[p], false) && !strict) ||
				(v === null && blueprint[p] !== Void)
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

	for(const key in blueprint) {
		if(blueprint[key] !== Void) container[key] = null;
		else container[key] = undefined;
	}



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



/**
* `Void` is a class for reprsenting absolutely nothing. Used as a stand-in for the
* constructor of `undefined`.
*/
const Void = globalThis.Void = new Proxy(class Void {
	"use strict";
	constructor() {"use strict"; throw Error("Void can not be instantiated")}
}, {
	get: function get(...args) {
		const p = args[1];

		if(p === "TYPE") return args[0];
		throw ReferenceError("key '"+String(p)+"' does not exist");
	},
	set: function set(...args) {
		throw Error("properties of Void can not be set");
	}
});