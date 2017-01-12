/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 39);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(4);


// Vol is the basic building block of all data in a net.
// it is essentially just a 3D volume of Ts, with a
// width (sx), height (sy), and depth (depth).
// it is used to hold data for all filters, all volumes,
// all weights, and also stores all gradients w.r.t. 
// the data. c is optionally a value to initialize the volume
// with. If c is missing, fills the Vol with random Ts.
let Vol = class Vol {
  constructor(sx, sy, depth, c) {
    if (Object.prototype.toString.call(sx) === '[object Array]') {
      // we were given a list in sx, assume 1D volume and fill it up
      this.sx = 1;
      this.sy = 1;
      this.depth = sx.length;
      // we have to do the following copy because we want to use
      // fast typed arrays, not an ordinary javascript array
      this.w = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* zeros */])(this.depth);
      this.dw = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* zeros */])(this.depth);
      for (var i = 0; i < this.depth; i++) {
        this.w[i] = sx[i];
      }
    } else {
      // we were given dimensions of the vol
      this.sx = sx;
      this.sy = sy;
      this.depth = depth;
      var n = sx * sy * depth;
      this.w = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* zeros */])(n);
      this.dw = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* zeros */])(n);
      if (typeof c === 'undefined') {
        // weight normalization is done to equalize the output
        // variance of every neuron, otherwise neurons with a lot
        // of incoming connections have outputs of larger variance
        var scale = Math.sqrt(1.0 / (sx * sy * depth));
        for (var i = 0; i < n; i++) {
          this.w[i] = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* randn */])(0.0, scale);
        }
      } else {
        for (var i = 0; i < n; i++) {
          this.w[i] = c;
        }
      }
    }
  }

  get(x, y, d) {
    var ix = (this.sx * y + x) * this.depth + d;
    return this.w[ix];
  }

  set(x, y, d, v) {
    var ix = (this.sx * y + x) * this.depth + d;
    this.w[ix] = v;
  }

  add(x, y, d, v) {
    var ix = (this.sx * y + x) * this.depth + d;
    this.w[ix] += v;
  }

  get_grad(x, y, d) {
    var ix = (this.sx * y + x) * this.depth + d;
    return this.dw[ix];
  }

  set_grad(x, y, d, v) {
    var ix = (this.sx * y + x) * this.depth + d;
    this.dw[ix] = v;
  }

  add_grad(x, y, d, v) {
    var ix = (this.sx * y + x) * this.depth + d;
    this.dw[ix] += v;
  }

  cloneAndZero() {
    return new Vol(this.sx, this.sy, this.depth, 0.0);
  }

  clone() {
    var V = new Vol(this.sx, this.sy, this.depth, 0.0);
    var n = this.w.length;
    for (var i = 0; i < n; i++) {
      V.w[i] = this.w[i];
    }
    return V;
  }

  addFrom(V) {
    for (var k = 0; k < this.w.length; k++) {
      this.w[k] += V.w[k];
    }
  }

  addFromScaled(V, a) {
    for (var k = 0; k < this.w.length; k++) {
      this.w[k] += a * V.w[k];
    }
  }

  setConst(a) {
    for (var k = 0; k < this.w.length; k++) {
      this.w[k] = a;
    }
  }

  toJSON() {
    // todo: we may want to only save d most significant digits to save space
    var json = {};
    json.sx = this.sx;
    json.sy = this.sy;
    json.depth = this.depth;
    json.w = this.w;
    return json;
    // we wont back up gradients to save space
  }

  fromJSON(json) {
    this.sx = json.sx;
    this.sy = json.sy;
    this.depth = json.depth;

    var n = this.sx * this.sy * this.depth;
    this.w = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* zeros */])(n);
    this.dw = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* zeros */])(n);
    // copy over the elements.
    for (var i = 0; i < n; i++) {
      this.w[i] = json.w[i];
    }
  }
};


/* harmony default export */ exports["a"] = Vol;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', {
  value: true
});
var _slice = Array.prototype.slice;

var _createDecoratedClass = function () {
  function defineProperties(target, descriptors, initializers) {
    for (var i = 0; i < descriptors.length; i++) {
      var descriptor = descriptors[i];var decorators = descriptor.decorators;var key = descriptor.key;delete descriptor.key;delete descriptor.decorators;descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor || descriptor.initializer) descriptor.writable = true;if (decorators) {
        for (var f = 0; f < decorators.length; f++) {
          var decorator = decorators[f];if (typeof decorator === 'function') {
            descriptor = decorator(target, key, descriptor) || descriptor;
          } else {
            throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator);
          }
        }if (descriptor.initializer !== undefined) {
          initializers[key] = descriptor;continue;
        }
      }Object.defineProperty(target, key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers);if (staticProps) defineProperties(Constructor, staticProps, staticInitializers);return Constructor;
  };
}();

exports.isDescriptor = isDescriptor;
exports.decorate = decorate;
exports.metaFor = metaFor;
exports.getOwnPropertyDescriptors = getOwnPropertyDescriptors;
exports.createDefaultSetter = createDefaultSetter;

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];return arr2;
  } else {
    return Array.from(arr);
  }
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _defineDecoratedPropertyDescriptor(target, key, descriptors) {
  var _descriptor = descriptors[key];if (!_descriptor) return;var descriptor = {};for (var _key in _descriptor) descriptor[_key] = _descriptor[_key];descriptor.value = descriptor.initializer ? descriptor.initializer.call(target) : undefined;Object.defineProperty(target, key, descriptor);
}

var _lazyInitialize = __webpack_require__(6);

var _lazyInitialize2 = _interopRequireDefault(_lazyInitialize);

var defineProperty = Object.defineProperty;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;

function isDescriptor(desc) {
  if (!desc || !desc.hasOwnProperty) {
    return false;
  }

  var keys = ['value', 'initializer', 'get', 'set'];

  for (var i = 0, l = keys.length; i < l; i++) {
    if (desc.hasOwnProperty(keys[i])) {
      return true;
    }
  }

  return false;
}

function decorate(handleDescriptor, entryArgs) {
  if (isDescriptor(entryArgs[entryArgs.length - 1])) {
    return handleDescriptor.apply(undefined, _toConsumableArray(entryArgs).concat([[]]));
  } else {
    return function () {
      return handleDescriptor.apply(undefined, _slice.call(arguments).concat([entryArgs]));
    };
  }
}

var Meta = function () {
  var _instanceInitializers = {};

  function Meta() {
    _classCallCheck(this, Meta);

    _defineDecoratedPropertyDescriptor(this, 'debounceTimeoutIds', _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, 'throttleTimeoutIds', _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, 'throttlePreviousTimestamps', _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, 'throttleTrailingArgs', _instanceInitializers);
  }

  _createDecoratedClass(Meta, [{
    key: 'debounceTimeoutIds',
    decorators: [_lazyInitialize2['default']],
    initializer: function initializer() {
      return {};
    },
    enumerable: true
  }, {
    key: 'throttleTimeoutIds',
    decorators: [_lazyInitialize2['default']],
    initializer: function initializer() {
      return {};
    },
    enumerable: true
  }, {
    key: 'throttlePreviousTimestamps',
    decorators: [_lazyInitialize2['default']],
    initializer: function initializer() {
      return {};
    },
    enumerable: true
  }, {
    key: 'throttleTrailingArgs',
    decorators: [_lazyInitialize2['default']],
    initializer: function initializer() {
      return null;
    },
    enumerable: true
  }], null, _instanceInitializers);

  return Meta;
}();

var META_KEY = typeof Symbol === 'function' ? Symbol('__core_decorators__') : '__core_decorators__';

function metaFor(obj) {
  if (obj.hasOwnProperty(META_KEY) === false) {
    defineProperty(obj, META_KEY, {
      // Defaults: NOT enumerable, configurable, or writable
      value: new Meta()
    });
  }

  return obj[META_KEY];
}

var getOwnKeys = getOwnPropertySymbols ? function (object) {
  return getOwnPropertyNames(object).concat(getOwnPropertySymbols(object));
} : getOwnPropertyNames;

exports.getOwnKeys = getOwnKeys;

function getOwnPropertyDescriptors(obj) {
  var descs = {};

  getOwnKeys(obj).forEach(function (key) {
    return descs[key] = getOwnPropertyDescriptor(obj, key);
  });

  return descs;
}

function createDefaultSetter(key) {
  return function set(newValue) {
    Object.defineProperty(this, key, {
      configurable: true,
      writable: true,
      // IS enumerable when reassigned by the outside word
      enumerable: true,
      value: newValue
    });

    return newValue;
  };
}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
let layers = {};

const createLayer = def => {
	if (layers(def.type)) return new layers(def.type)(def);
	throw new Error(`UNRECOGNIZED LAYER TYPE: ${ def.type }`);
};
/* unused harmony export createLayer */


const register = (type, Layer) => {
	if (layers[type]) throw new Error(`layer ${ type } has been registered`);
	layers[type] = Layer;
};
/* harmony export (immutable) */ exports["a"] = register;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/**
 * core-decorators.js
 * (c) 2016 Jay Phelps and contributors
 * MIT Licensed
 * https://github.com/jayphelps/core-decorators.js
 * @license
 */


Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequire(obj) {
  return obj && obj.__esModule ? obj['default'] : obj;
}

var _override = __webpack_require__(20);

exports.override = _interopRequire(_override);

var _deprecate = __webpack_require__(13);

exports.deprecate = _interopRequire(_deprecate);
exports.deprecated = _interopRequire(_deprecate);

var _suppressWarnings = __webpack_require__(22);

exports.suppressWarnings = _interopRequire(_suppressWarnings);

var _memoize = __webpack_require__(16);

exports.memoize = _interopRequire(_memoize);

var _autobind = __webpack_require__(10);

exports.autobind = _interopRequire(_autobind);

var _readonly = __webpack_require__(21);

exports.readonly = _interopRequire(_readonly);

var _enumerable = __webpack_require__(14);

exports.enumerable = _interopRequire(_enumerable);

var _nonenumerable = __webpack_require__(19);

exports.nonenumerable = _interopRequire(_nonenumerable);

var _nonconfigurable = __webpack_require__(18);

exports.nonconfigurable = _interopRequire(_nonconfigurable);

var _debounce = __webpack_require__(11);

exports.debounce = _interopRequire(_debounce);

var _throttle = __webpack_require__(23);

exports.throttle = _interopRequire(_throttle);

var _decorate = __webpack_require__(12);

exports.decorate = _interopRequire(_decorate);

var _mixin = __webpack_require__(17);

exports.mixin = _interopRequire(_mixin);
exports.mixins = _interopRequire(_mixin);

var _lazyInitialize = __webpack_require__(6);

exports.lazyInitialize = _interopRequire(_lazyInitialize);

var _time = __webpack_require__(24);

exports.time = _interopRequire(_time);

var _extendDescriptor = __webpack_require__(15);

exports.extendDescriptor = _interopRequire(_extendDescriptor);

// Helper to apply decorators to a class without transpiler support

var _applyDecorators = __webpack_require__(9);

exports.applyDecorators = _interopRequire(_applyDecorators);

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__vol__ = __webpack_require__(0);


let return_v = false;
let v_val = 0.0;

const gaussRandom = function () {
  if (return_v) {
    return_v = false;
    return v_val;
  }
  var u = 2 * Math.random() - 1;
  var v = 2 * Math.random() - 1;
  var r = u * u + v * v;
  if (r == 0 || r > 1) return gaussRandom();
  var c = Math.sqrt(-2 * Math.log(r) / r);
  v_val = v * c; // cache this
  return_v = true;
  return u * c;
};
/* unused harmony export gaussRandom */


const randf = function (a, b) {
  return Math.random() * (b - a) + a;
};
/* harmony export (immutable) */ exports["h"] = randf;


const randi = function (a, b) {
  return Math.floor(Math.random() * (b - a) + a);
};
/* harmony export (immutable) */ exports["g"] = randi;


const randn = function (mu, std) {
  return mu + gaussRandom() * std;
};
/* harmony export (immutable) */ exports["b"] = randn;


const zeros = function (n) {
  if (typeof n === 'undefined' || isNaN(n)) {
    return [];
  }
  if (typeof ArrayBuffer === 'undefined') {
    // lacking browser support
    var arr = new Array(n);
    for (var i = 0; i < n; i++) {
      arr[i] = 0;
    }
    return arr;
  } else {
    return new Float64Array(n);
  }
};
/* harmony export (immutable) */ exports["a"] = zeros;


const arrContains = function (arr, elt) {
  for (var i = 0, n = arr.length; i < n; i++) {
    if (arr[i] === elt) return true;
  }
  return false;
};
/* unused harmony export arrContains */


const arrUnique = function (arr) {
  var b = [];
  for (var i = 0, n = arr.length; i < n; i++) {
    if (!arrContains(b, arr[i])) {
      b.push(arr[i]);
    }
  }
  return b;
};
/* harmony export (immutable) */ exports["d"] = arrUnique;


// return max and min of a given non-empty array.
const maxmin = function (w) {
  if (w.length === 0) {
    return {};
  } // ... ;s
  var maxv = w[0];
  var minv = w[0];
  var maxi = 0;
  var mini = 0;
  var n = w.length;
  for (var i = 1; i < n; i++) {
    if (w[i] > maxv) {
      maxv = w[i];
      maxi = i;
    }
    if (w[i] < minv) {
      minv = w[i];
      mini = i;
    }
  }
  return { maxi: maxi, maxv: maxv, mini: mini, minv: minv, dv: maxv - minv };
};
/* harmony export (immutable) */ exports["i"] = maxmin;


// create random permutation of numbers, in range [0...n-1]
const randperm = function (n) {
  var i = n,
      j = 0,
      temp;
  var array = [];
  for (var q = 0; q < n; q++) array[q] = q;
  while (i--) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};
/* harmony export (immutable) */ exports["e"] = randperm;


// sample from list lst according to probabilities in list probs
// the two lists are of same size, and probs adds up to 1
const weightedSample = function (lst, probs) {
  var p = randf(0, 1.0);
  var cumprob = 0.0;
  for (var k = 0, n = lst.length; k < n; k++) {
    cumprob += probs[k];
    if (p < cumprob) {
      return lst[k];
    }
  }
};
/* harmony export (immutable) */ exports["f"] = weightedSample;


// syntactic sugar function for getting default parameter values
const getopt = function (opt, field_name, default_value) {
  if (typeof field_name === 'string') {
    // case of single string
    return typeof opt[field_name] !== 'undefined' ? opt[field_name] : default_value;
  } else {
    // assume we are given a list of string instead
    var ret = default_value;
    for (var i = 0; i < field_name.length; i++) {
      var f = field_name[i];
      if (typeof opt[f] !== 'undefined') {
        ret = opt[f]; // overwrite return value
      }
    }
    return ret;
  }
};
/* harmony export (immutable) */ exports["c"] = getopt;


const assert = function (condition, message) {
  if (!condition) {
    message = message || "Assertion failed";
    if (typeof Error !== "undefined") {
      throw new Error(message);
    }
    throw message; // Fallback
  }
};
/* harmony export (immutable) */ exports["j"] = assert;


// Volume utilities
// intended for use with data augmentation
// crop is the size of output
// dx,dy are offset wrt incoming volume, of the shift
// fliplr is boolean on whether we also want to flip left<->right
const augment = function (V, crop, dx, dy, fliplr) {
  // note assumes square outputs of size crop x crop
  if (typeof fliplr === 'undefined') var fliplr = false;
  if (typeof dx === 'undefined') var dx = global.randi(0, V.sx - crop);
  if (typeof dy === 'undefined') var dy = global.randi(0, V.sy - crop);

  // randomly sample a crop in the input volume
  var W;
  if (crop !== V.sx || dx !== 0 || dy !== 0) {
    W = new __WEBPACK_IMPORTED_MODULE_0__vol__["a" /* default */](crop, crop, V.depth, 0.0);
    for (var x = 0; x < crop; x++) {
      for (var y = 0; y < crop; y++) {
        if (x + dx < 0 || x + dx >= V.sx || y + dy < 0 || y + dy >= V.sy) continue; // oob
        for (var d = 0; d < V.depth; d++) {
          W.set(x, y, d, V.get(x + dx, y + dy, d)); // copy data over
        }
      }
    }
  } else {
    W = V;
  }

  if (fliplr) {
    // flip volume horziontally
    var W2 = W.cloneAndZero();
    for (var x = 0; x < W.sx; x++) {
      for (var y = 0; y < W.sy; y++) {
        for (var d = 0; d < W.depth; d++) {
          W2.set(x, y, d, W.get(W.sx - x - 1, y, d)); // copy data over
        }
      }
    }
    W = W2; //swap
  }
  return W;
};

// img is a DOM element that contains a loaded image
// returns a Vol of size (W, H, 4). 4 is for RGBA
const img_to_vol = function (img, convert_grayscale) {

  if (typeof convert_grayscale === 'undefined') var convert_grayscale = false;

  var canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext("2d");

  // due to a Firefox bug
  try {
    ctx.drawImage(img, 0, 0);
  } catch (e) {
    if (e.name === "NS_ERROR_NOT_AVAILABLE") {
      // sometimes happens, lets just abort
      return false;
    } else {
      throw e;
    }
  }

  try {
    var img_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  } catch (e) {
    if (e.name === 'IndexSizeError') {
      return false; // not sure what causes this sometimes but okay abort
    } else {
      throw e;
    }
  }

  // prepare the input: get pixels and normalize them
  var p = img_data.data;
  var W = img.width;
  var H = img.height;
  var pv = [];
  for (var i = 0; i < p.length; i++) {
    pv.push(p[i] / 255.0 - 0.5); // normalize image pixels to [-0.5, 0.5]
  }
  var x = new __WEBPACK_IMPORTED_MODULE_0__vol__["a" /* default */](W, H, 4, 0.0); //input volume (image)
  x.w = pv;

  if (convert_grayscale) {
    // flatten into depth=1 array
    var x1 = new __WEBPACK_IMPORTED_MODULE_0__vol__["a" /* default */](W, H, 1, 0.0);
    for (var i = 0; i < W; i++) {
      for (var j = 0; j < H; j++) {
        x1.set(i, j, 0, x.get(i, j, 0));
      }
    }
    x = x1;
  }

  return x;
};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__vol__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__layer_factory__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__layers__ = __webpack_require__(28);
 // convenience




// Net manages a set of layers
// For now constraints: Simple linear order of layers, first layer input last layer a cost layer
let Net = class Net {
  constructor(options) {
    this.layers = [];
  }

  // takes a list of layer definitions and creates the network layer objects
  makeLayers(defs) {
    // few checks
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["j" /* assert */])(defs.length >= 2, 'Error! At least one input layer and one loss layer are required.');
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["j" /* assert */])(defs[0].type === 'input', 'Error! First layer must be the input layer, to declare size of inputs');

    // desugar layer_defs for adding activation, dropout layers etc
    var desugar = function () {
      var new_defs = [];
      for (var i = 0; i < defs.length; i++) {
        var def = defs[i];

        if (def.type === 'softmax' || def.type === 'svm') {
          // add an fc layer here, there is no reason the user should
          // have to worry about this and we almost always want to
          new_defs.push({ type: 'fc', num_neurons: def.num_classes });
        }

        if (def.type === 'regression') {
          // add an fc layer here, there is no reason the user should
          // have to worry about this and we almost always want to
          new_defs.push({ type: 'fc', num_neurons: def.num_neurons });
        }

        if ((def.type === 'fc' || def.type === 'conv') && typeof def.bias_pref === 'undefined') {
          def.bias_pref = 0.0;
          if (typeof def.activation !== 'undefined' && def.activation === 'relu') {
            def.bias_pref = 0.1; // relus like a bit of positive bias to get gradients early
            // otherwise it's technically possible that a relu unit will never turn on (by chance)
            // and will never get any gradient and never contribute any computation. Dead relu.
          }
        }

        new_defs.push(def);

        if (typeof def.activation !== 'undefined') {
          if (def.activation === 'relu') {
            new_defs.push({ type: 'relu' });
          } else if (def.activation === 'sigmoid') {
            new_defs.push({ type: 'sigmoid' });
          } else if (def.activation === 'tanh') {
            new_defs.push({ type: 'tanh' });
          } else if (def.activation === 'maxout') {
            // create maxout activation, and pass along group size, if provided
            var gs = def.group_size !== 'undefined' ? def.group_size : 2;
            new_defs.push({ type: 'maxout', group_size: gs });
          } else {
            console.log('ERROR unsupported activation ' + def.activation);
          }
        }
        if (typeof def.drop_prob !== 'undefined' && def.type !== 'dropout') {
          new_defs.push({ type: 'dropout', drop_prob: def.drop_prob });
        }
      }
      return new_defs;
    };
    defs = desugar(defs);

    // create the layers
    this.layers = [];
    for (var i = 0; i < defs.length; i++) {
      var def = defs[i];
      if (i > 0) {
        var prev = this.layers[i - 1];
        def.in_sx = prev.out_sx;
        def.in_sy = prev.out_sy;
        def.in_depth = prev.out_depth;
      }

      switch (def.type) {
        case 'fc':
          this.layers.push(new FullyConnLayer(def));
          break;
        case 'lrn':
          this.layers.push(new LocalResponseNormalizationLayer(def));
          break;
        case 'dropout':
          this.layers.push(new DropoutLayer(def));
          break;
        case 'input':
          this.layers.push(new InputLayer(def));
          break;
        case 'softmax':
          this.layers.push(new SoftmaxLayer(def));
          break;
        case 'regression':
          this.layers.push(new RegressionLayer(def));
          break;
        case 'conv':
          this.layers.push(new ConvLayer(def));
          break;
        case 'pool':
          this.layers.push(new PoolLayer(def));
          break;
        case 'relu':
          this.layers.push(new ReluLayer(def));
          break;
        case 'sigmoid':
          this.layers.push(new SigmoidLayer(def));
          break;
        case 'tanh':
          this.layers.push(new TanhLayer(def));
          break;
        case 'maxout':
          this.layers.push(new MaxoutLayer(def));
          break;
        case 'svm':
          this.layers.push(new SVMLayer(def));
          break;
        default:
          console.log('ERROR: UNRECOGNIZED LAYER TYPE: ' + def.type);
      }
    }
  }

  // forward prop the network. 
  // The trainer class passes is_training = true, but when this function is
  // called from outside (not from the trainer), it defaults to prediction mode
  forward(V, is_training) {
    if (typeof is_training === 'undefined') is_training = false;
    var act = this.layers[0].forward(V, is_training);
    for (var i = 1; i < this.layers.length; i++) {
      act = this.layers[i].forward(act, is_training);
    }
    return act;
  }

  getCostLoss(V, y) {
    this.forward(V, false);
    var N = this.layers.length;
    var loss = this.layers[N - 1].backward(y);
    return loss;
  }

  // backprop: compute gradients wrt all parameters
  backward(y) {
    var N = this.layers.length;
    var loss = this.layers[N - 1].backward(y); // last layer assumed to be loss layer
    for (var i = N - 2; i >= 0; i--) {
      // first layer assumed input
      this.layers[i].backward();
    }
    return loss;
  }

  getParamsAndGrads() {
    // accumulate parameters and gradients for the entire network
    var response = [];
    for (var i = 0; i < this.layers.length; i++) {
      var layer_reponse = this.layers[i].getParamsAndGrads();
      for (var j = 0; j < layer_reponse.length; j++) {
        response.push(layer_reponse[j]);
      }
    }
    return response;
  }

  getPrediction() {
    // this is a convenience function for returning the argmax
    // prediction, assuming the last layer of the net is a softmax
    var S = this.layers[this.layers.length - 1];
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["j" /* assert */])(S.layer_type === 'softmax', 'getPrediction function assumes softmax as last layer of the net!');

    var p = S.out_act.w;
    var maxv = p[0];
    var maxi = 0;
    for (var i = 1; i < p.length; i++) {
      if (p[i] > maxv) {
        maxv = p[i];
        maxi = i;
      }
    }
    return maxi; // return index of the class with highest class probability
  }

  toJSON() {
    var json = {};
    json.layers = [];
    for (var i = 0; i < this.layers.length; i++) {
      json.layers.push(this.layers[i].toJSON());
    }
    return json;
  }

  fromJSON(json) {
    this.layers = [];
    for (var i = 0; i < json.layers.length; i++) {
      var Lj = json.layers[i];
      var t = Lj.layer_type;
      var L;
      if (t === 'input') {
        L = new InputLayer();
      }
      if (t === 'relu') {
        L = new ReluLayer();
      }
      if (t === 'sigmoid') {
        L = new SigmoidLayer();
      }
      if (t === 'tanh') {
        L = new TanhLayer();
      }
      if (t === 'dropout') {
        L = new DropoutLayer();
      }
      if (t === 'conv') {
        L = new ConvLayer();
      }
      if (t === 'pool') {
        L = new PoolLayer();
      }
      if (t === 'lrn') {
        L = new LocalResponseNormalizationLayer();
      }
      if (t === 'softmax') {
        L = new SoftmaxLayer();
      }
      if (t === 'regression') {
        L = new RegressionLayer();
      }
      if (t === 'fc') {
        L = new FullyConnLayer();
      }
      if (t === 'maxout') {
        L = new MaxoutLayer();
      }
      if (t === 'svm') {
        L = new SVMLayer();
      }
      L.fromJSON(Lj);
      this.layers.push(L);
    }
  }
};


/* harmony default export */ exports["a"] = Net;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = lazyInitialize;

var _privateUtils = __webpack_require__(1);

var defineProperty = Object.defineProperty;

function handleDescriptor(target, key, descriptor) {
  var configurable = descriptor.configurable;
  var enumerable = descriptor.enumerable;
  var initializer = descriptor.initializer;
  var value = descriptor.value;

  return {
    configurable: configurable,
    enumerable: enumerable,

    get: function get() {
      // This happens if someone accesses the
      // property directly on the prototype
      if (this === target) {
        return;
      }

      var ret = initializer ? initializer.call(this) : value;

      defineProperty(this, key, {
        configurable: configurable,
        enumerable: enumerable,
        writable: true,
        value: ret
      });

      return ret;
    },

    set: (0, _privateUtils.createDefaultSetter)(key)
  };
}

function lazyInitialize() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return (0, _privateUtils.decorate)(handleDescriptor, args);
}

module.exports = exports['default'];

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__net__ = __webpack_require__(5);



let MagicNet = class MagicNet {
  constructor(data, labels, opt) {
    var opt = opt || {};
    if (typeof data === 'undefined') {
      data = [];
    }
    if (typeof labels === 'undefined') {
      labels = [];
    }

    // required inputs
    this.data = data; // store these pointers to data
    this.labels = labels;

    // optional inputs
    this.train_ratio = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* getopt */])(opt, 'train_ratio', 0.7);
    this.num_folds = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* getopt */])(opt, 'num_folds', 10);
    this.num_candidates = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* getopt */])(opt, 'num_candidates', 50); // we evaluate several in parallel
    // how many epochs of data to train every network? for every fold?
    // higher values mean higher accuracy in final results, but more expensive
    this.num_epochs = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* getopt */])(opt, 'num_epochs', 50);
    // number of best models to average during prediction. Usually higher = better
    this.ensemble_size = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* getopt */])(opt, 'ensemble_size', 10);

    // candidate parameters
    this.batch_size_min = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* getopt */])(opt, 'batch_size_min', 10);
    this.batch_size_max = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* getopt */])(opt, 'batch_size_max', 300);
    this.l2_decay_min = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* getopt */])(opt, 'l2_decay_min', -4);
    this.l2_decay_max = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* getopt */])(opt, 'l2_decay_max', 2);
    this.learning_rate_min = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* getopt */])(opt, 'learning_rate_min', -4);
    this.learning_rate_max = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* getopt */])(opt, 'learning_rate_max', 0);
    this.momentum_min = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* getopt */])(opt, 'momentum_min', 0.9);
    this.momentum_max = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* getopt */])(opt, 'momentum_max', 0.9);
    this.neurons_min = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* getopt */])(opt, 'neurons_min', 5);
    this.neurons_max = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* getopt */])(opt, 'neurons_max', 30);

    // computed
    this.folds = []; // data fold indices, gets filled by sampleFolds()
    this.candidates = []; // candidate networks that are being currently evaluated
    this.evaluated_candidates = []; // history of all candidates that were fully evaluated on all folds
    this.unique_labels = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["d" /* arrUnique */])(labels);
    this.iter = 0; // iteration counter, goes from 0 -> num_epochs * num_training_data
    this.foldix = 0; // index of active fold

    // callbacks
    this.finish_fold_callback = null;
    this.finish_batch_callback = null;

    // initializations
    if (this.data.length > 0) {
      this.sampleFolds();
      this.sampleCandidates();
    }
  }

  // sets this.folds to a sampling of this.num_folds folds
  sampleFolds() {
    var N = this.data.length;
    var num_train = Math.floor(this.train_ratio * N);
    this.folds = []; // flush folds, if any
    for (var i = 0; i < this.num_folds; i++) {
      var p = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["e" /* randperm */])(N);
      this.folds.push({ train_ix: p.slice(0, num_train), test_ix: p.slice(num_train, N) });
    }
  }

  // returns a random candidate network
  sampleCandidate() {
    var input_depth = this.data[0].w.length;
    var num_classes = this.unique_labels.length;

    // sample network topology and hyperparameters
    var layer_defs = [];
    layer_defs.push({ type: 'input', out_sx: 1, out_sy: 1, out_depth: input_depth });
    var nl = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["f" /* weightedSample */])([0, 1, 2, 3], [0.2, 0.3, 0.3, 0.2]); // prefer nets with 1,2 hidden layers
    for (var q = 0; q < nl; q++) {
      var ni = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["g" /* randi */])(this.neurons_min, this.neurons_max);
      var act = ['tanh', 'maxout', 'relu'][__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["g" /* randi */])(0, 3)];
      if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["h" /* randf */])(0, 1) < 0.5) {
        var dp = Math.random();
        layer_defs.push({ type: 'fc', num_neurons: ni, activation: act, drop_prob: dp });
      } else {
        layer_defs.push({ type: 'fc', num_neurons: ni, activation: act });
      }
    }
    layer_defs.push({ type: 'softmax', num_classes: num_classes });
    var net = new __WEBPACK_IMPORTED_MODULE_1__net__["a" /* default */]();
    net.makeLayers(layer_defs);

    // sample training hyperparameters
    var bs = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["g" /* randi */])(this.batch_size_min, this.batch_size_max); // batch size
    var l2 = Math.pow(10, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["h" /* randf */])(this.l2_decay_min, this.l2_decay_max)); // l2 weight decay
    var lr = Math.pow(10, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["h" /* randf */])(this.learning_rate_min, this.learning_rate_max)); // learning rate
    var mom = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["h" /* randf */])(this.momentum_min, this.momentum_max); // momentum. Lets just use 0.9, works okay usually ;p
    var tp = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["h" /* randf */])(0, 1); // trainer type
    var trainer_def;
    if (tp < 0.33) {
      trainer_def = { method: 'adadelta', batch_size: bs, l2_decay: l2 };
    } else if (tp < 0.66) {
      trainer_def = { method: 'adagrad', learning_rate: lr, batch_size: bs, l2_decay: l2 };
    } else {
      trainer_def = { method: 'sgd', learning_rate: lr, momentum: mom, batch_size: bs, l2_decay: l2 };
    }

    var trainer = new Trainer(net, trainer_def);

    var cand = {};
    cand.acc = [];
    cand.accv = 0; // this will maintained as sum(acc) for convenience
    cand.layer_defs = layer_defs;
    cand.trainer_def = trainer_def;
    cand.net = net;
    cand.trainer = trainer;
    return cand;
  }

  // sets this.candidates with this.num_candidates candidate nets
  sampleCandidates() {
    this.candidates = []; // flush, if any
    for (var i = 0; i < this.num_candidates; i++) {
      var cand = this.sampleCandidate();
      this.candidates.push(cand);
    }
  }

  step() {

    // run an example through current candidate
    this.iter++;

    // step all candidates on a random data point
    var fold = this.folds[this.foldix]; // active fold
    var dataix = fold.train_ix[__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["g" /* randi */])(0, fold.train_ix.length)];
    for (var k = 0; k < this.candidates.length; k++) {
      var x = this.data[dataix];
      var l = this.labels[dataix];
      this.candidates[k].trainer.train(x, l);
    }

    // process consequences: sample new folds, or candidates
    var lastiter = this.num_epochs * fold.train_ix.length;
    if (this.iter >= lastiter) {
      // finished evaluation of this fold. Get final validation
      // accuracies, record them, and go on to next fold.
      var val_acc = this.evalValErrors();
      for (var k = 0; k < this.candidates.length; k++) {
        var c = this.candidates[k];
        c.acc.push(val_acc[k]);
        c.accv += val_acc[k];
      }
      this.iter = 0; // reset step number
      this.foldix++; // increment fold

      if (this.finish_fold_callback !== null) {
        this.finish_fold_callback();
      }

      if (this.foldix >= this.folds.length) {
        // we finished all folds as well! Record these candidates
        // and sample new ones to evaluate.
        for (var k = 0; k < this.candidates.length; k++) {
          this.evaluated_candidates.push(this.candidates[k]);
        }
        // sort evaluated candidates according to accuracy achieved
        this.evaluated_candidates.sort(function (a, b) {
          return a.accv / a.acc.length > b.accv / b.acc.length ? -1 : 1;
        });
        // and clip only to the top few ones (lets place limit at 3*ensemble_size)
        // otherwise there are concerns with keeping these all in memory 
        // if MagicNet is being evaluated for a very long time
        if (this.evaluated_candidates.length > 3 * this.ensemble_size) {
          this.evaluated_candidates = this.evaluated_candidates.slice(0, 3 * this.ensemble_size);
        }
        if (this.finish_batch_callback !== null) {
          this.finish_batch_callback();
        }
        this.sampleCandidates(); // begin with new candidates
        this.foldix = 0; // reset this
      } else {
        // we will go on to another fold. reset all candidates nets
        for (var k = 0; k < this.candidates.length; k++) {
          var c = this.candidates[k];
          var net = new __WEBPACK_IMPORTED_MODULE_1__net__["a" /* default */]();
          net.makeLayers(c.layer_defs);
          var trainer = new Trainer(net, c.trainer_def);
          c.net = net;
          c.trainer = trainer;
        }
      }
    }
  }

  evalValErrors() {
    // evaluate candidates on validation data and return performance of current networks
    // as simple list
    var vals = [];
    var fold = this.folds[this.foldix]; // active fold
    for (var k = 0; k < this.candidates.length; k++) {
      var net = this.candidates[k].net;
      var v = 0.0;
      for (var q = 0; q < fold.test_ix.length; q++) {
        var x = this.data[fold.test_ix[q]];
        var l = this.labels[fold.test_ix[q]];
        net.forward(x);
        var yhat = net.getPrediction();
        v += yhat === l ? 1.0 : 0.0; // 0 1 loss
      }
      v /= fold.test_ix.length; // normalize
      vals.push(v);
    }
    return vals;
  }

  // returns prediction scores for given test data point, as Vol
  // uses an averaged prediction from the best ensemble_size models
  // x is a Vol.
  predict_soft(data) {
    // forward prop the best networks
    // and accumulate probabilities at last layer into a an output Vol

    var eval_candidates = [];
    var nv = 0;
    if (this.evaluated_candidates.length === 0) {
      // not sure what to do here, first batch of nets hasnt evaluated yet
      // lets just predict with current candidates.
      nv = this.candidates.length;
      eval_candidates = this.candidates;
    } else {
      // forward prop the best networks from evaluated_candidates
      nv = Math.min(this.ensemble_size, this.evaluated_candidates.length);
      eval_candidates = this.evaluated_candidates;
    }

    // forward nets of all candidates and average the predictions
    var xout, n;
    for (var j = 0; j < nv; j++) {
      var net = eval_candidates[j].net;
      var x = net.forward(data);
      if (j === 0) {
        xout = x;
        n = x.w.length;
      } else {
        // add it on
        for (var d = 0; d < n; d++) {
          xout.w[d] += x.w[d];
        }
      }
    }
    // produce average
    for (var d = 0; d < n; d++) {
      xout.w[d] /= nv;
    }
    return xout;
  }

  predict(data) {
    var xout = this.predict_soft(data);
    if (xout.w.length !== 0) {
      var stats = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["i" /* maxmin */])(xout.w);
      var predicted_label = stats.maxi;
    } else {
      var predicted_label = -1; // error out
    }
    return predicted_label;
  }

  toJSON() {
    // dump the top ensemble_size networks as a list
    var nv = Math.min(this.ensemble_size, this.evaluated_candidates.length);
    var json = {};
    json.nets = [];
    for (var i = 0; i < nv; i++) {
      json.nets.push(this.evaluated_candidates[i].net.toJSON());
    }
    return json;
  }

  fromJSON(json) {
    this.ensemble_size = json.nets.length;
    this.evaluated_candidates = [];
    for (var i = 0; i < this.ensemble_size; i++) {
      var net = new __WEBPACK_IMPORTED_MODULE_1__net__["a" /* default */]();
      net.fromJSON(json.nets[i]);
      var dummy_candidate = {};
      dummy_candidate.net = net;
      this.evaluated_candidates.push(dummy_candidate);
    }
  }

  // callback functions
  // called when a fold is finished, while evaluating a batch
  onFinishFold(f) {
    this.finish_fold_callback = f;
  }
  // called when a batch of candidates has finished evaluating
  onFinishBatch(f) {
    this.finish_batch_callback = f;
  }
};


/* unused harmony default export */ var _unused_webpack_default_export = MagicNet;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__vol__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(4);



let Trainer = class Trainer {
  constructor(net, options) {
    this.net = net;

    var options = options || {};
    this.learning_rate = typeof options.learning_rate !== 'undefined' ? options.learning_rate : 0.01;
    this.l1_decay = typeof options.l1_decay !== 'undefined' ? options.l1_decay : 0.0;
    this.l2_decay = typeof options.l2_decay !== 'undefined' ? options.l2_decay : 0.0;
    this.batch_size = typeof options.batch_size !== 'undefined' ? options.batch_size : 1;
    this.method = typeof options.method !== 'undefined' ? options.method : 'sgd'; // sgd/adam/adagrad/adadelta/windowgrad/netsterov

    this.momentum = typeof options.momentum !== 'undefined' ? options.momentum : 0.9;
    this.ro = typeof options.ro !== 'undefined' ? options.ro : 0.95; // used in adadelta
    this.eps = typeof options.eps !== 'undefined' ? options.eps : 1e-8; // used in adam or adadelta
    this.beta1 = typeof options.beta1 !== 'undefined' ? options.beta1 : 0.9; // used in adam
    this.beta2 = typeof options.beta2 !== 'undefined' ? options.beta2 : 0.999; // used in adam

    this.k = 0; // iteration counter
    this.gsum = []; // last iteration gradients (used for momentum calculations)
    this.xsum = []; // used in adam or adadelta

    // check if regression is expected 
    if (this.net.layers[this.net.layers.length - 1].layer_type === "regression") this.regression = true;else this.regression = false;
  }

  train(x, y) {

    var start = new Date().getTime();
    this.net.forward(x, true); // also set the flag that lets the net know we're just training
    var end = new Date().getTime();
    var fwd_time = end - start;

    var start = new Date().getTime();
    var cost_loss = this.net.backward(y);
    var l2_decay_loss = 0.0;
    var l1_decay_loss = 0.0;
    var end = new Date().getTime();
    var bwd_time = end - start;

    if (this.regression && y.constructor !== Array) console.log("Warning: a regression net requires an array as training output vector.");

    this.k++;
    if (this.k % this.batch_size === 0) {

      var pglist = this.net.getParamsAndGrads();

      // initialize lists for accumulators. Will only be done once on first iteration
      if (this.gsum.length === 0 && (this.method !== 'sgd' || this.momentum > 0.0)) {
        // only vanilla sgd doesnt need either lists
        // momentum needs gsum
        // adagrad needs gsum
        // adam and adadelta needs gsum and xsum
        for (var i = 0; i < pglist.length; i++) {
          this.gsum.push(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* zeros */])(pglist[i].params.length));
          if (this.method === 'adam' || this.method === 'adadelta') {
            this.xsum.push(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* zeros */])(pglist[i].params.length));
          } else {
            this.xsum.push([]); // conserve memory
          }
        }
      }

      // perform an update for all sets of weights
      for (var i = 0; i < pglist.length; i++) {
        var pg = pglist[i]; // param, gradient, other options in future (custom learning rate etc)
        var p = pg.params;
        var g = pg.grads;

        // learning rate for some parameters.
        var l2_decay_mul = typeof pg.l2_decay_mul !== 'undefined' ? pg.l2_decay_mul : 1.0;
        var l1_decay_mul = typeof pg.l1_decay_mul !== 'undefined' ? pg.l1_decay_mul : 1.0;
        var l2_decay = this.l2_decay * l2_decay_mul;
        var l1_decay = this.l1_decay * l1_decay_mul;

        var plen = p.length;
        for (var j = 0; j < plen; j++) {
          l2_decay_loss += l2_decay * p[j] * p[j] / 2; // accumulate weight decay loss
          l1_decay_loss += l1_decay * Math.abs(p[j]);
          var l1grad = l1_decay * (p[j] > 0 ? 1 : -1);
          var l2grad = l2_decay * p[j];

          var gij = (l2grad + l1grad + g[j]) / this.batch_size; // raw batch gradient

          var gsumi = this.gsum[i];
          var xsumi = this.xsum[i];
          if (this.method === 'adam') {
            // adam update
            gsumi[j] = gsumi[j] * this.beta1 + (1 - this.beta1) * gij; // update biased first moment estimate
            xsumi[j] = xsumi[j] * this.beta2 + (1 - this.beta2) * gij * gij; // update biased second moment estimate
            var biasCorr1 = gsumi[j] * (1 - Math.pow(this.beta1, this.k)); // correct bias first moment estimate
            var biasCorr2 = xsumi[j] * (1 - Math.pow(this.beta2, this.k)); // correct bias second moment estimate
            var dx = -this.learning_rate * biasCorr1 / (Math.sqrt(biasCorr2) + this.eps);
            p[j] += dx;
          } else if (this.method === 'adagrad') {
            // adagrad update
            gsumi[j] = gsumi[j] + gij * gij;
            var dx = -this.learning_rate / Math.sqrt(gsumi[j] + this.eps) * gij;
            p[j] += dx;
          } else if (this.method === 'windowgrad') {
            // this is adagrad but with a moving window weighted average
            // so the gradient is not accumulated over the entire history of the run. 
            // it's also referred to as Idea #1 in Zeiler paper on Adadelta. Seems reasonable to me!
            gsumi[j] = this.ro * gsumi[j] + (1 - this.ro) * gij * gij;
            var dx = -this.learning_rate / Math.sqrt(gsumi[j] + this.eps) * gij; // eps added for better conditioning
            p[j] += dx;
          } else if (this.method === 'adadelta') {
            gsumi[j] = this.ro * gsumi[j] + (1 - this.ro) * gij * gij;
            var dx = -Math.sqrt((xsumi[j] + this.eps) / (gsumi[j] + this.eps)) * gij;
            xsumi[j] = this.ro * xsumi[j] + (1 - this.ro) * dx * dx; // yes, xsum lags behind gsum by 1.
            p[j] += dx;
          } else if (this.method === 'nesterov') {
            var dx = gsumi[j];
            gsumi[j] = gsumi[j] * this.momentum + this.learning_rate * gij;
            dx = this.momentum * dx - (1.0 + this.momentum) * gsumi[j];
            p[j] += dx;
          } else {
            // assume SGD
            if (this.momentum > 0.0) {
              // momentum update
              var dx = this.momentum * gsumi[j] - this.learning_rate * gij; // step
              gsumi[j] = dx; // back this up for next iteration of momentum
              p[j] += dx; // apply corrected gradient
            } else {
              // vanilla sgd
              p[j] += -this.learning_rate * gij;
            }
          }
          g[j] = 0.0; // zero out gradient so that we can begin accumulating anew
        }
      }
    }

    // appending softmax_loss for backwards compatibility, but from now on we will always use cost_loss
    // in future, TODO: have to completely redo the way loss is done around the network as currently 
    // loss is a bit of a hack. Ideally, user should specify arbitrary number of loss functions on any layer
    // and it should all be computed correctly and automatically. 
    return {
      fwd_time: fwd_time,
      bwd_time: bwd_time,
      l2_decay_loss: l2_decay_loss,
      l1_decay_loss: l1_decay_loss,
      cost_loss: cost_loss,
      softmax_loss: cost_loss,
      loss: cost_loss + l1_decay_loss + l2_decay_loss
    };
  }
};


/* unused harmony default export */ var _unused_webpack_default_export = Trainer;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = applyDecorators;
var defineProperty = Object.defineProperty;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

function applyDecorators(Class, props) {
  var prototype = Class.prototype;

  for (var key in props) {
    var decorators = props[key];

    for (var i = 0, l = decorators.length; i < l; i++) {
      var decorator = decorators[i];

      defineProperty(prototype, key, decorator(prototype, key, getOwnPropertyDescriptor(prototype, key)));
    }
  }

  return Class;
}

module.exports = exports["default"];

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = autobind;

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];return arr2;
  } else {
    return Array.from(arr);
  }
}

var _privateUtils = __webpack_require__(1);

var defineProperty = Object.defineProperty;
var getPrototypeOf = Object.getPrototypeOf;

function bind(fn, context) {
  if (fn.bind) {
    return fn.bind(context);
  } else {
    return function __autobind__() {
      return fn.apply(context, arguments);
    };
  }
}

var mapStore = undefined;

function getBoundSuper(obj, fn) {
  if (typeof WeakMap === 'undefined') {
    throw new Error('Using @autobind on ' + fn.name + '() requires WeakMap support due to its use of super.' + fn.name + '()\n      See https://github.com/jayphelps/core-decorators.js/issues/20');
  }

  if (!mapStore) {
    mapStore = new WeakMap();
  }

  if (mapStore.has(obj) === false) {
    mapStore.set(obj, new WeakMap());
  }

  var superStore = mapStore.get(obj);

  if (superStore.has(fn) === false) {
    superStore.set(fn, bind(fn, obj));
  }

  return superStore.get(fn);
}

function autobindClass(klass) {
  var descs = (0, _privateUtils.getOwnPropertyDescriptors)(klass.prototype);
  var keys = (0, _privateUtils.getOwnKeys)(descs);

  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    var desc = descs[key];

    if (typeof desc.value !== 'function' || key === 'constructor') {
      continue;
    }

    defineProperty(klass.prototype, key, autobindMethod(klass.prototype, key, desc));
  }
}

function autobindMethod(target, key, _ref) {
  var fn = _ref.value;
  var configurable = _ref.configurable;
  var enumerable = _ref.enumerable;

  if (typeof fn !== 'function') {
    throw new SyntaxError('@autobind can only be used on functions, not: ' + fn);
  }

  var constructor = target.constructor;

  return {
    configurable: configurable,
    enumerable: enumerable,

    get: function get() {
      // Class.prototype.key lookup
      // Someone accesses the property directly on the prototype on which it is
      // actually defined on, i.e. Class.prototype.hasOwnProperty(key)
      if (this === target) {
        return fn;
      }

      // Class.prototype.key lookup
      // Someone accesses the property directly on a prototype but it was found
      // up the chain, not defined directly on it
      // i.e. Class.prototype.hasOwnProperty(key) == false && key in Class.prototype
      if (this.constructor !== constructor && getPrototypeOf(this).constructor === constructor) {
        return fn;
      }

      // Autobound method calling super.sameMethod() which is also autobound and so on.
      if (this.constructor !== constructor && key in this.constructor.prototype) {
        return getBoundSuper(this, fn);
      }

      var boundFn = bind(fn, this);

      defineProperty(this, key, {
        configurable: true,
        writable: true,
        // NOT enumerable when it's a bound method
        enumerable: false,
        value: boundFn
      });

      return boundFn;
    },
    set: (0, _privateUtils.createDefaultSetter)(key)
  };
}

function handle(args) {
  if (args.length === 1) {
    return autobindClass.apply(undefined, _toConsumableArray(args));
  } else {
    return autobindMethod.apply(undefined, _toConsumableArray(args));
  }
}

function autobind() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  if (args.length === 0) {
    return function () {
      return handle(arguments);
    };
  } else {
    return handle(args);
  }
}

module.exports = exports['default'];

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;_e = err;
    } finally {
      try {
        if (!_n && _i['return']) _i['return']();
      } finally {
        if (_d) throw _e;
      }
    }return _arr;
  }return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError('Invalid attempt to destructure non-iterable instance');
    }
  };
}();

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

exports['default'] = debounce;

var _privateUtils = __webpack_require__(1);

var DEFAULT_TIMEOUT = 300;

function handleDescriptor(target, key, descriptor, _ref) {
  var _ref2 = _slicedToArray(_ref, 2);

  var _ref2$0 = _ref2[0];
  var wait = _ref2$0 === undefined ? DEFAULT_TIMEOUT : _ref2$0;
  var _ref2$1 = _ref2[1];
  var immediate = _ref2$1 === undefined ? false : _ref2$1;

  var callback = descriptor.value;

  if (typeof callback !== 'function') {
    throw new SyntaxError('Only functions can be debounced');
  }

  return _extends({}, descriptor, {
    value: function value() {
      var _this = this;

      var _metaFor = (0, _privateUtils.metaFor)(this);

      var debounceTimeoutIds = _metaFor.debounceTimeoutIds;

      var timeout = debounceTimeoutIds[key];
      var callNow = immediate && !timeout;
      var args = arguments;

      clearTimeout(timeout);

      debounceTimeoutIds[key] = setTimeout(function () {
        delete debounceTimeoutIds[key];
        if (!immediate) {
          callback.apply(_this, args);
        }
      }, wait);

      if (callNow) {
        callback.apply(this, args);
      }
    }
  });
}

function debounce() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return (0, _privateUtils.decorate)(handleDescriptor, args);
}

module.exports = exports['default'];

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = decorate;

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];return arr2;
  } else {
    return Array.from(arr);
  }
}

function _toArray(arr) {
  return Array.isArray(arr) ? arr : Array.from(arr);
}

var _privateUtils = __webpack_require__(1);

var defineProperty = Object.defineProperty;

function handleDescriptor(target, key, descriptor, _ref) {
  var _ref2 = _toArray(_ref);

  var decorator = _ref2[0];

  var args = _ref2.slice(1);

  var configurable = descriptor.configurable;
  var enumerable = descriptor.enumerable;
  var writable = descriptor.writable;

  var originalGet = descriptor.get;
  var originalSet = descriptor.set;
  var originalValue = descriptor.value;
  var isGetter = !!originalGet;

  return {
    configurable: configurable,
    enumerable: enumerable,
    get: function get() {
      var fn = isGetter ? originalGet.call(this) : originalValue;
      var value = decorator.call.apply(decorator, [this, fn].concat(_toConsumableArray(args)));

      if (isGetter) {
        return value;
      } else {
        var desc = {
          configurable: configurable,
          enumerable: enumerable
        };

        desc.value = value;
        desc.writable = writable;

        defineProperty(this, key, desc);

        return value;
      }
    },
    set: isGetter ? originalSet : (0, _privateUtils.createDefaultSetter)()
  };
}

function decorate() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return (0, _privateUtils.decorate)(handleDescriptor, args);
}

module.exports = exports['default'];

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;_e = err;
    } finally {
      try {
        if (!_n && _i['return']) _i['return']();
      } finally {
        if (_d) throw _e;
      }
    }return _arr;
  }return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError('Invalid attempt to destructure non-iterable instance');
    }
  };
}();

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

exports['default'] = deprecate;

var _privateUtils = __webpack_require__(1);

var DEFAULT_MSG = 'This function will be removed in future versions.';

function handleDescriptor(target, key, descriptor, _ref) {
  var _ref2 = _slicedToArray(_ref, 2);

  var _ref2$0 = _ref2[0];
  var msg = _ref2$0 === undefined ? DEFAULT_MSG : _ref2$0;
  var _ref2$1 = _ref2[1];
  var options = _ref2$1 === undefined ? {} : _ref2$1;

  if (typeof descriptor.value !== 'function') {
    throw new SyntaxError('Only functions can be marked as deprecated');
  }

  var methodSignature = target.constructor.name + '#' + key;

  if (options.url) {
    msg += '\n\n    See ' + options.url + ' for more details.\n\n';
  }

  return _extends({}, descriptor, {
    value: function deprecationWrapper() {
      console.warn('DEPRECATION ' + methodSignature + ': ' + msg);
      return descriptor.value.apply(this, arguments);
    }
  });
}

function deprecate() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return (0, _privateUtils.decorate)(handleDescriptor, args);
}

module.exports = exports['default'];

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = enumerable;

var _privateUtils = __webpack_require__(1);

function handleDescriptor(target, key, descriptor) {
  descriptor.enumerable = true;
  return descriptor;
}

function enumerable() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return (0, _privateUtils.decorate)(handleDescriptor, args);
}

module.exports = exports['default'];

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

exports['default'] = extendDescriptor;

var _privateUtils = __webpack_require__(1);

var getPrototypeOf = Object.getPrototypeOf;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

function handleDescriptor(target, key, descriptor) {
  var superKlass = getPrototypeOf(target);
  var superDesc = getOwnPropertyDescriptor(superKlass, key);

  return _extends({}, superDesc, {
    value: descriptor.value,
    initializer: descriptor.initializer,
    get: descriptor.get || superDesc.get,
    set: descriptor.set || superDesc.set
  });
}

function extendDescriptor() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return (0, _privateUtils.decorate)(handleDescriptor, args);
}

module.exports = exports['default'];

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

exports['default'] = memoize;

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
  } else {
    obj[key] = value;
  }return obj;
}

var _privateUtils = __webpack_require__(1);

function toObject(cache, value) {
  if (value === Object(value)) {
    return value;
  }
  return cache[value] || (cache[value] = {});
}

function applyAndCache(context, fn, args, cache, signature) {
  var ret = fn.apply(context, args);
  cache[signature] = ret;
  return ret;
}

function metaForDescriptor(descriptor) {
  var fn = undefined,
      wrapKey = undefined;

  // This is ugly code, but way faster than other
  // ways I tried that *looked* pretty

  if (descriptor.value) {
    fn = descriptor.value;
    wrapKey = 'value';
  } else if (descriptor.get) {
    fn = descriptor.get;
    wrapKey = 'get';
  } else if (descriptor.set) {
    fn = descriptor.set;
    wrapKey = 'set';
  }

  return { fn: fn, wrapKey: wrapKey };
}

function handleDescriptor(target, key, descriptor) {
  console.warn('DEPRECATION: @memoize is deprecated and will be removed shortly. Use @decorate with lodash\'s memoize helper.\n\n  https://github.com/jayphelps/core-decorators.js#decorate');

  var _metaForDescriptor = metaForDescriptor(descriptor);

  var fn = _metaForDescriptor.fn;
  var wrapKey = _metaForDescriptor.wrapKey;

  var argumentCache = new WeakMap();
  var signatureCache = Object.create(null);
  var primativeRefCache = Object.create(null);
  var argumentIdCounter = 0;

  return _extends({}, descriptor, _defineProperty({}, wrapKey, function memoizeWrapper() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var signature = '0';

    for (var i = 0, l = args.length; i < l; i++) {
      var arg = args[i];
      var argRef = toObject(primativeRefCache, arg);
      var argKey = argumentCache.get(argRef);

      if (argKey === undefined) {
        argKey = ++argumentIdCounter;
        argumentCache.set(argRef, argKey);
      }

      signature += argKey;
    }

    return signatureCache[signature] || applyAndCache(this, fn, arguments, signatureCache, signature);
  }));
}

function memoize() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return (0, _privateUtils.decorate)(handleDescriptor, args);
}

module.exports = exports['default'];

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = mixin;

var _privateUtils = __webpack_require__(1);

var defineProperty = Object.defineProperty;
var getPrototypeOf = Object.getPrototypeOf;

function buggySymbol(symbol) {
  return Object.prototype.toString.call(symbol) === '[object Symbol]' && typeof symbol === 'object';
}

function hasProperty(prop, obj) {
  // We have to traverse manually prototypes' chain for polyfilled ES6 Symbols
  // like "in" operator does.
  // I.e.: Babel 5 Symbol polyfill stores every created symbol in Object.prototype.
  // That's why we cannot use construction like "prop in obj" to check, if needed
  // prop actually exists in given object/prototypes' chain.
  if (buggySymbol(prop)) {
    do {
      if (obj === Object.prototype) {
        // Polyfill assigns undefined as value for stored symbol key.
        // We can assume in this special case if there is nothing assigned it doesn't exist.
        return typeof obj[prop] !== 'undefined';
      }
      if (obj.hasOwnProperty(prop)) {
        return true;
      }
    } while (obj = getPrototypeOf(obj));
    return false;
  } else {
    return prop in obj;
  }
}

function handleClass(target, mixins) {
  if (!mixins.length) {
    throw new SyntaxError('@mixin() class ' + target.name + ' requires at least one mixin as an argument');
  }

  for (var i = 0, l = mixins.length; i < l; i++) {
    var descs = (0, _privateUtils.getOwnPropertyDescriptors)(mixins[i]);
    var keys = (0, _privateUtils.getOwnKeys)(descs);

    for (var j = 0, k = keys.length; j < k; j++) {
      var key = keys[j];

      if (!hasProperty(key, target.prototype)) {
        defineProperty(target.prototype, key, descs[key]);
      }
    }
  }
}

function mixin() {
  for (var _len = arguments.length, mixins = Array(_len), _key = 0; _key < _len; _key++) {
    mixins[_key] = arguments[_key];
  }

  if (typeof mixins[0] === 'function') {
    return handleClass(mixins[0], []);
  } else {
    return function (target) {
      return handleClass(target, mixins);
    };
  }
}

module.exports = exports['default'];

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = nonconfigurable;

var _privateUtils = __webpack_require__(1);

function handleDescriptor(target, key, descriptor) {
  descriptor.configurable = false;
  return descriptor;
}

function nonconfigurable() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return (0, _privateUtils.decorate)(handleDescriptor, args);
}

module.exports = exports['default'];

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = nonenumerable;

var _privateUtils = __webpack_require__(1);

function handleDescriptor(target, key, descriptor) {
  descriptor.enumerable = false;
  return descriptor;
}

function nonenumerable() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return (0, _privateUtils.decorate)(handleDescriptor, args);
}

module.exports = exports['default'];

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ('value' in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

exports['default'] = override;

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

var _privateUtils = __webpack_require__(1);

var GENERIC_FUNCTION_ERROR = '{child} does not properly override {parent}';
var FUNCTION_REGEXP = /^function ([_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*)?(\([^\)]*\))[\s\S]+$/;

var SyntaxErrorReporter = function () {
  _createClass(SyntaxErrorReporter, [{
    key: '_getTopic',
    value: function _getTopic(descriptor) {
      if (descriptor === undefined) {
        return null;
      }

      if ('value' in descriptor) {
        return descriptor.value;
      }

      if ('get' in descriptor) {
        return descriptor.get;
      }

      if ('set' in descriptor) {
        return descriptor.set;
      }
    }
  }, {
    key: '_extractTopicSignature',
    value: function _extractTopicSignature(topic) {
      switch (typeof topic) {
        case 'function':
          return this._extractFunctionSignature(topic);
        default:
          return this.key;
      }
    }
  }, {
    key: '_extractFunctionSignature',
    value: function _extractFunctionSignature(fn) {
      var _this = this;

      return fn.toString().replace(FUNCTION_REGEXP, function (match, name, params) {
        if (name === undefined) name = _this.key;
        return name + params;
      });
    }
  }, {
    key: 'key',
    get: function get() {
      return this.childDescriptor.key;
    }
  }, {
    key: 'parentNotation',
    get: function get() {
      return this.parentKlass.constructor.name + '#' + this.parentPropertySignature;
    }
  }, {
    key: 'childNotation',
    get: function get() {
      return this.childKlass.constructor.name + '#' + this.childPropertySignature;
    }
  }, {
    key: 'parentTopic',
    get: function get() {
      return this._getTopic(this.parentDescriptor);
    }
  }, {
    key: 'childTopic',
    get: function get() {
      return this._getTopic(this.childDescriptor);
    }
  }, {
    key: 'parentPropertySignature',
    get: function get() {
      return this._extractTopicSignature(this.parentTopic);
    }
  }, {
    key: 'childPropertySignature',
    get: function get() {
      return this._extractTopicSignature(this.childTopic);
    }
  }]);

  function SyntaxErrorReporter(parentKlass, childKlass, parentDescriptor, childDescriptor) {
    _classCallCheck(this, SyntaxErrorReporter);

    this.parentKlass = parentKlass;
    this.childKlass = childKlass;
    this.parentDescriptor = parentDescriptor;
    this.childDescriptor = childDescriptor;
  }

  _createClass(SyntaxErrorReporter, [{
    key: 'assert',
    value: function assert(condition) {
      var msg = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

      if (condition !== true) {
        this.error(GENERIC_FUNCTION_ERROR + msg);
      }
    }
  }, {
    key: 'error',
    value: function error(msg) {
      var _this2 = this;

      msg = msg
      // Replace lazily, because they actually might not
      // be available in all cases
      .replace('{parent}', function (m) {
        return _this2.parentNotation;
      }).replace('{child}', function (m) {
        return _this2.childNotation;
      });
      throw new SyntaxError(msg);
    }
  }]);

  return SyntaxErrorReporter;
}();

function getDescriptorType(descriptor) {
  if (descriptor.hasOwnProperty('value')) {
    return 'data';
  }

  if (descriptor.hasOwnProperty('get') || descriptor.hasOwnProperty('set')) {
    return 'accessor';
  }

  // If none of them exist, browsers treat it as
  // a data descriptor with a value of `undefined`
  return 'data';
}

function checkFunctionSignatures(parent, child, reporter) {
  reporter.assert(parent.length === child.length);
}

function checkDataDescriptors(parent, child, reporter) {
  var parentValueType = typeof parent.value;
  var childValueType = typeof child.value;

  if (parentValueType === 'undefined' && childValueType === 'undefined') {
    // class properties can be any expression, which isn't ran until the
    // the instance is created, so we can't reliably get type information
    // for them yet (per spec). Perhaps when Babel includes flow-type info
    // in runtime? Tried regex solutions, but super hacky and only feasible
    // on primitives, which is confusing for usage...
    reporter.error('descriptor values are both undefined. (class properties are are not currently supported)\'');
  }

  if (parentValueType !== childValueType) {
    var isFunctionOverUndefined = childValueType === 'function' && parentValueType === undefined;
    // Even though we don't support class properties, this
    // will still handle more than just functions, just in case.
    // Shadowing an undefined value is an error if the inherited
    // value was undefined (usually a class property, not a method)
    if (isFunctionOverUndefined || parentValueType !== undefined) {
      reporter.error('value types do not match. {parent} is "' + parentValueType + '", {child} is "' + childValueType + '"');
    }
  }

  // Switch, in preparation for supporting more types
  switch (childValueType) {
    case 'function':
      checkFunctionSignatures(parent.value, child.value, reporter);
      break;

    default:
      reporter.error('Unexpected error. Please file a bug with: {parent} is "' + parentValueType + '", {child} is "' + childValueType + '"');
      break;
  }
}

function checkAccessorDescriptors(parent, child, reporter) {
  var parentHasGetter = typeof parent.get === 'function';
  var childHasGetter = typeof child.get === 'function';
  var parentHasSetter = typeof parent.set === 'function';
  var childHasSetter = typeof child.set === 'function';

  if (parentHasGetter || childHasGetter) {
    if (!parentHasGetter && parentHasSetter) {
      reporter.error('{parent} is setter but {child} is getter');
    }

    if (!childHasGetter && childHasSetter) {
      reporter.error('{parent} is getter but {child} is setter');
    }

    checkFunctionSignatures(parent.get, child.get, reporter);
  }

  if (parentHasSetter || childHasSetter) {
    if (!parentHasSetter && parentHasGetter) {
      reporter.error('{parent} is getter but {child} is setter');
    }

    if (!childHasSetter && childHasGetter) {
      reporter.error('{parent} is setter but {child} is getter');
    }

    checkFunctionSignatures(parent.set, child.set, reporter);
  }
}

function checkDescriptors(parent, child, reporter) {
  var parentType = getDescriptorType(parent);
  var childType = getDescriptorType(child);

  if (parentType !== childType) {
    reporter.error('descriptor types do not match. {parent} is "' + parentType + '", {child} is "' + childType + '"');
  }

  switch (childType) {
    case 'data':
      checkDataDescriptors(parent, child, reporter);
      break;

    case 'accessor':
      checkAccessorDescriptors(parent, child, reporter);
      break;
  }
}

var suggestionTransforms = [function (key) {
  return key.toLowerCase();
}, function (key) {
  return key.toUpperCase();
}, function (key) {
  return key + 's';
}, function (key) {
  return key.slice(0, -1);
}, function (key) {
  return key.slice(1, key.length);
}];

function findPossibleAlternatives(superKlass, key) {
  for (var i = 0, l = suggestionTransforms.length; i < l; i++) {
    var fn = suggestionTransforms[i];
    var suggestion = fn(key);

    if (suggestion in superKlass) {
      return suggestion;
    }
  }

  return null;
}

function handleDescriptor(target, key, descriptor) {
  descriptor.key = key;
  var superKlass = Object.getPrototypeOf(target);
  var superDescriptor = Object.getOwnPropertyDescriptor(superKlass, key);
  var reporter = new SyntaxErrorReporter(superKlass, target, superDescriptor, descriptor);

  if (superDescriptor === undefined) {
    var suggestedKey = findPossibleAlternatives(superKlass, key);
    var suggestion = suggestedKey ? '\n\n  Did you mean "' + suggestedKey + '"?' : '';
    reporter.error('No descriptor matching {child} was found on the prototype chain.' + suggestion);
  }

  checkDescriptors(superDescriptor, descriptor, reporter);

  return descriptor;
}

function override() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return (0, _privateUtils.decorate)(handleDescriptor, args);
}

module.exports = exports['default'];

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = readonly;

var _privateUtils = __webpack_require__(1);

function handleDescriptor(target, key, descriptor) {
  descriptor.writable = false;
  return descriptor;
}

function readonly() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return (0, _privateUtils.decorate)(handleDescriptor, args);
}

module.exports = exports['default'];

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

exports['default'] = suppressWarnings;

var _privateUtils = __webpack_require__(1);

function suppressedWarningNoop() {
  // Warnings are currently suppressed via @suppressWarnings
}

function applyWithoutWarnings(context, fn, args) {
  if (typeof console === 'object') {
    var nativeWarn = console.warn;
    console.warn = suppressedWarningNoop;
    var ret = fn.apply(context, args);
    console.warn = nativeWarn;
    return ret;
  } else {
    return fn.apply(context, args);
  }
}

function handleDescriptor(target, key, descriptor) {
  return _extends({}, descriptor, {
    value: function suppressWarningsWrapper() {
      return applyWithoutWarnings(this, descriptor.value, arguments);
    }
  });
}

function suppressWarnings() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return (0, _privateUtils.decorate)(handleDescriptor, args);
}

module.exports = exports['default'];

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;_e = err;
    } finally {
      try {
        if (!_n && _i['return']) _i['return']();
      } finally {
        if (_d) throw _e;
      }
    }return _arr;
  }return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError('Invalid attempt to destructure non-iterable instance');
    }
  };
}();

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

exports['default'] = throttle;

var _privateUtils = __webpack_require__(1);

var DEFAULT_TIMEOUT = 300;

function handleDescriptor(target, key, descriptor, _ref) {
  var _ref2 = _slicedToArray(_ref, 2);

  var _ref2$0 = _ref2[0];
  var wait = _ref2$0 === undefined ? DEFAULT_TIMEOUT : _ref2$0;
  var _ref2$1 = _ref2[1];
  var options = _ref2$1 === undefined ? {} : _ref2$1;

  var callback = descriptor.value;

  if (typeof callback !== 'function') {
    throw new SyntaxError('Only functions can be throttled');
  }

  if (options.leading !== false) {
    options.leading = true;
  }

  if (options.trailing !== false) {
    options.trailing = true;
  }

  return _extends({}, descriptor, {
    value: function value() {
      var _this = this;

      var meta = (0, _privateUtils.metaFor)(this);
      var throttleTimeoutIds = meta.throttleTimeoutIds;
      var throttlePreviousTimestamps = meta.throttlePreviousTimestamps;

      var timeout = throttleTimeoutIds[key];
      // last execute timestamp
      var previous = throttlePreviousTimestamps[key] || 0;
      var now = Date.now();

      if (options.trailing) {
        meta.throttleTrailingArgs = arguments;
      }

      // if first be called and disable the execution on the leading edge
      // set last execute timestamp to now
      if (!previous && options.leading === false) {
        previous = now;
      }

      var remaining = wait - (now - previous);

      if (remaining <= 0) {
        clearTimeout(timeout);
        delete throttleTimeoutIds[key];
        throttlePreviousTimestamps[key] = now;
        callback.apply(this, arguments);
      } else if (!timeout && options.trailing) {
        throttleTimeoutIds[key] = setTimeout(function () {
          throttlePreviousTimestamps[key] = options.leading === false ? 0 : Date.now();
          delete throttleTimeoutIds[key];
          callback.apply(_this, meta.throttleTrailingArgs);
          // don't leak memory!
          meta.throttleTrailingArgs = null;
        }, remaining);
      }
    }
  });
}

function throttle() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return (0, _privateUtils.decorate)(handleDescriptor, args);
}

module.exports = exports['default'];

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;_e = err;
    } finally {
      try {
        if (!_n && _i['return']) _i['return']();
      } finally {
        if (_d) throw _e;
      }
    }return _arr;
  }return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError('Invalid attempt to destructure non-iterable instance');
    }
  };
}();

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

exports['default'] = time;

var _privateUtils = __webpack_require__(1);

var labels = {};

// Exported for mocking in tests
var defaultConsole = {
  time: console.time ? console.time.bind(console) : function (label) {
    labels[label] = new Date();
  },
  timeEnd: console.timeEnd ? console.timeEnd.bind(console) : function (label) {
    var timeNow = new Date();
    var timeTaken = timeNow - labels[label];
    delete labels[label];
    console.log(label + ': ' + timeTaken + 'ms');
  }
};

exports.defaultConsole = defaultConsole;
var count = 0;

function handleDescriptor(target, key, descriptor, _ref) {
  var _ref2 = _slicedToArray(_ref, 2);

  var _ref2$0 = _ref2[0];
  var prefix = _ref2$0 === undefined ? null : _ref2$0;
  var _ref2$1 = _ref2[1];
  var console = _ref2$1 === undefined ? defaultConsole : _ref2$1;

  var fn = descriptor.value;

  if (prefix === null) {
    prefix = target.constructor.name + '.' + key;
  }

  if (typeof fn !== 'function') {
    throw new SyntaxError('@time can only be used on functions, not: ' + fn);
  }

  return _extends({}, descriptor, {
    value: function value() {
      var label = prefix + '-' + count;
      count++;
      console.time(label);

      try {
        return fn.apply(this, arguments);
      } finally {
        console.timeEnd(label);
      }
    }
  });
}

function time() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return (0, _privateUtils.decorate)(handleDescriptor, args);
}

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__layer_factory__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_core_decorators__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__vol__ = __webpack_require__(0);
/* unused harmony export ConvLayer */
var _dec, _class;





let ConvLayer = (_dec = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_core_decorators__["decorate"])(__WEBPACK_IMPORTED_MODULE_0__layer_factory__["a" /* register */]), _dec(_class = class ConvLayer {
  constructor(opt) {
    var opt = opt || {};

    // required
    this.out_depth = opt.filters;
    this.sx = opt.sx; // filter size. Should be odd if possible, it's cleaner.
    this.in_depth = opt.in_depth;
    this.in_sx = opt.in_sx;
    this.in_sy = opt.in_sy;

    // optional
    this.sy = typeof opt.sy !== 'undefined' ? opt.sy : this.sx;
    this.stride = typeof opt.stride !== 'undefined' ? opt.stride : 1; // stride at which we apply filters to input volume
    this.pad = typeof opt.pad !== 'undefined' ? opt.pad : 0; // amount of 0 padding to add around borders of input volume
    this.l1_decay_mul = typeof opt.l1_decay_mul !== 'undefined' ? opt.l1_decay_mul : 0.0;
    this.l2_decay_mul = typeof opt.l2_decay_mul !== 'undefined' ? opt.l2_decay_mul : 1.0;

    // computed
    // note we are doing floor, so if the strided convolution of the filter doesnt fit into the input
    // volume exactly, the output volume will be trimmed and not contain the (incomplete) computed
    // final application.
    this.out_sx = Math.floor((this.in_sx + this.pad * 2 - this.sx) / this.stride + 1);
    this.out_sy = Math.floor((this.in_sy + this.pad * 2 - this.sy) / this.stride + 1);
    this.layer_type = 'conv';

    // initializations
    var bias = typeof opt.bias_pref !== 'undefined' ? opt.bias_pref : 0.0;
    this.filters = [];
    for (var i = 0; i < this.out_depth; i++) {
      this.filters.push(new __WEBPACK_IMPORTED_MODULE_2__vol__["a" /* default */](this.sx, this.sy, this.in_depth));
    }
    this.biases = new __WEBPACK_IMPORTED_MODULE_2__vol__["a" /* default */](1, 1, this.out_depth, bias);
  }

  forward(V, is_training) {
    // optimized code by @mdda that achieves 2x speedup over previous version

    this.in_act = V;
    var A = new __WEBPACK_IMPORTED_MODULE_2__vol__["a" /* default */](this.out_sx | 0, this.out_sy | 0, this.out_depth | 0, 0.0);

    var V_sx = V.sx | 0;
    var V_sy = V.sy | 0;
    var xy_stride = this.stride | 0;

    for (var d = 0; d < this.out_depth; d++) {
      var f = this.filters[d];
      var x = -this.pad | 0;
      var y = -this.pad | 0;
      for (var ay = 0; ay < this.out_sy; y += xy_stride, ay++) {
        // xy_stride
        x = -this.pad | 0;
        for (var ax = 0; ax < this.out_sx; x += xy_stride, ax++) {
          // xy_stride

          // convolve centered at this particular location
          var a = 0.0;
          for (var fy = 0; fy < f.sy; fy++) {
            var oy = y + fy; // coordinates in the original input array coordinates
            for (var fx = 0; fx < f.sx; fx++) {
              var ox = x + fx;
              if (oy >= 0 && oy < V_sy && ox >= 0 && ox < V_sx) {
                for (var fd = 0; fd < f.depth; fd++) {
                  // avoid function call overhead (x2) for efficiency, compromise modularity :(
                  a += f.w[(f.sx * fy + fx) * f.depth + fd] * V.w[(V_sx * oy + ox) * V.depth + fd];
                }
              }
            }
          }
          a += this.biases.w[d];
          A.set(ax, ay, d, a);
        }
      }
    }
    this.out_act = A;
    return this.out_act;
  }

  backward() {

    var V = this.in_act;
    V.dw = global.zeros(V.w.length); // zero out gradient wrt bottom data, we're about to fill it

    var V_sx = V.sx | 0;
    var V_sy = V.sy | 0;
    var xy_stride = this.stride | 0;

    for (var d = 0; d < this.out_depth; d++) {
      var f = this.filters[d];
      var x = -this.pad | 0;
      var y = -this.pad | 0;
      for (var ay = 0; ay < this.out_sy; y += xy_stride, ay++) {
        // xy_stride
        x = -this.pad | 0;
        for (var ax = 0; ax < this.out_sx; x += xy_stride, ax++) {
          // xy_stride

          // convolve centered at this particular location
          var chain_grad = this.out_act.get_grad(ax, ay, d); // gradient from above, from chain rule
          for (var fy = 0; fy < f.sy; fy++) {
            var oy = y + fy; // coordinates in the original input array coordinates
            for (var fx = 0; fx < f.sx; fx++) {
              var ox = x + fx;
              if (oy >= 0 && oy < V_sy && ox >= 0 && ox < V_sx) {
                for (var fd = 0; fd < f.depth; fd++) {
                  // avoid function call overhead (x2) for efficiency, compromise modularity :(
                  var ix1 = (V_sx * oy + ox) * V.depth + fd;
                  var ix2 = (f.sx * fy + fx) * f.depth + fd;
                  f.dw[ix2] += V.w[ix1] * chain_grad;
                  V.dw[ix1] += f.w[ix2] * chain_grad;
                }
              }
            }
          }
          this.biases.dw[d] += chain_grad;
        }
      }
    }
  }

  getParamsAndGrads() {
    var response = [];
    for (var i = 0; i < this.out_depth; i++) {
      response.push({ params: this.filters[i].w, grads: this.filters[i].dw, l2_decay_mul: this.l2_decay_mul, l1_decay_mul: this.l1_decay_mul });
    }
    response.push({ params: this.biases.w, grads: this.biases.dw, l1_decay_mul: 0.0, l2_decay_mul: 0.0 });
    return response;
  }

  toJSON() {
    var json = {};
    json.sx = this.sx; // filter size in x, y dims
    json.sy = this.sy;
    json.stride = this.stride;
    json.in_depth = this.in_depth;
    json.out_depth = this.out_depth;
    json.out_sx = this.out_sx;
    json.out_sy = this.out_sy;
    json.layer_type = this.layer_type;
    json.l1_decay_mul = this.l1_decay_mul;
    json.l2_decay_mul = this.l2_decay_mul;
    json.pad = this.pad;
    json.filters = [];
    for (var i = 0; i < this.filters.length; i++) {
      json.filters.push(this.filters[i].toJSON());
    }
    json.biases = this.biases.toJSON();
    return json;
  }

  fromJSON(json) {
    this.out_depth = json.out_depth;
    this.out_sx = json.out_sx;
    this.out_sy = json.out_sy;
    this.layer_type = json.layer_type;
    this.sx = json.sx; // filter size in x, y dims
    this.sy = json.sy;
    this.stride = json.stride;
    this.in_depth = json.in_depth; // depth of input volume
    this.filters = [];
    this.l1_decay_mul = typeof json.l1_decay_mul !== 'undefined' ? json.l1_decay_mul : 1.0;
    this.l2_decay_mul = typeof json.l2_decay_mul !== 'undefined' ? json.l2_decay_mul : 1.0;
    this.pad = typeof json.pad !== 'undefined' ? json.pad : 0;
    for (var i = 0; i < json.filters.length; i++) {
      var v = new __WEBPACK_IMPORTED_MODULE_2__vol__["a" /* default */](0, 0, 0, 0);
      v.fromJSON(json.filters[i]);
      this.filters.push(v);
    }
    this.biases = new __WEBPACK_IMPORTED_MODULE_2__vol__["a" /* default */](0, 0, 0, 0);
    this.biases.fromJSON(json.biases);
  }
}) || _class);

//export default ConvLayer

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__layer_factory__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_core_decorators__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__vol__ = __webpack_require__(0);
var _dec, _class;





let DropoutLayer = (_dec = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_core_decorators__["decorate"])(__WEBPACK_IMPORTED_MODULE_0__layer_factory__["a" /* register */]), _dec(_class = class DropoutLayer {
  constructor(opt) {
    opt = opt || {};

    // computed
    this.out_sx = opt.in_sx;
    this.out_sy = opt.in_sy;
    this.out_depth = opt.in_depth;
    this.layer_type = 'dropout';
    this.drop_prob = typeof opt.drop_prob !== 'undefined' ? opt.drop_prob : 0.5;
    this.dropped = global.zeros(this.out_sx * this.out_sy * this.out_depth);
  }

  forward(V, is_training) {
    this.in_act = V;
    if (typeof is_training === 'undefined') {
      is_training = false;
    } // default is prediction mode
    var V2 = V.clone();
    var N = V.w.length;
    if (is_training) {
      // do dropout
      for (var i = 0; i < N; i++) {
        if (Math.random() < this.drop_prob) {
          V2.w[i] = 0;
          this.dropped[i] = true;
        } // drop!
        else {
            this.dropped[i] = false;
          }
      }
    } else {
      // scale the activations during prediction
      for (var i = 0; i < N; i++) {
        V2.w[i] *= this.drop_prob;
      }
    }
    this.out_act = V2;
    return this.out_act; // dummy identity function for now
  }

  backward() {
    var V = this.in_act; // we need to set dw of this
    var chain_grad = this.out_act;
    var N = V.w.length;
    V.dw = global.zeros(N); // zero out gradient wrt data
    for (var i = 0; i < N; i++) {
      if (!this.dropped[i]) {
        V.dw[i] = chain_grad.dw[i]; // copy over the gradient
      }
    }
  }

  getParamsAndGrads() {
    return [];
  }

  toJSON() {
    var json = {};
    json.out_depth = this.out_depth;
    json.out_sx = this.out_sx;
    json.out_sy = this.out_sy;
    json.layer_type = this.layer_type;
    json.drop_prob = this.drop_prob;
    return json;
  }

  fromJSON(json) {
    this.out_depth = json.out_depth;
    this.out_sx = json.out_sx;
    this.out_sy = json.out_sy;
    this.layer_type = json.layer_type;
    this.drop_prob = json.drop_prob;
  }
}) || _class);


/* unused harmony default export */ var _unused_webpack_default_export = DropoutLayer;

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__layer_factory__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_core_decorators__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__vol__ = __webpack_require__(0);
var _dec, _class;





let FullyConnLayer = (_dec = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_core_decorators__["decorate"])(__WEBPACK_IMPORTED_MODULE_0__layer_factory__["a" /* register */]), _dec(_class = class FullyConnLayer {
  constructor(opt) {
    var opt = opt || {};

    // required
    // ok fine we will allow 'filters' as the word as well
    this.out_depth = typeof opt.num_neurons !== 'undefined' ? opt.num_neurons : opt.filters;

    // optional 
    this.l1_decay_mul = typeof opt.l1_decay_mul !== 'undefined' ? opt.l1_decay_mul : 0.0;
    this.l2_decay_mul = typeof opt.l2_decay_mul !== 'undefined' ? opt.l2_decay_mul : 1.0;

    // computed
    this.num_inputs = opt.in_sx * opt.in_sy * opt.in_depth;
    this.out_sx = 1;
    this.out_sy = 1;
    this.layer_type = 'fc';

    // initializations
    var bias = typeof opt.bias_pref !== 'undefined' ? opt.bias_pref : 0.0;
    this.filters = [];
    for (var i = 0; i < this.out_depth; i++) {
      this.filters.push(new __WEBPACK_IMPORTED_MODULE_2__vol__["a" /* default */](1, 1, this.num_inputs));
    }
    this.biases = new __WEBPACK_IMPORTED_MODULE_2__vol__["a" /* default */](1, 1, this.out_depth, bias);
  }

  forward(V, is_training) {
    this.in_act = V;
    var A = new __WEBPACK_IMPORTED_MODULE_2__vol__["a" /* default */](1, 1, this.out_depth, 0.0);
    var Vw = V.w;
    for (var i = 0; i < this.out_depth; i++) {
      var a = 0.0;
      var wi = this.filters[i].w;
      for (var d = 0; d < this.num_inputs; d++) {
        a += Vw[d] * wi[d]; // for efficiency use Vols directly for now
      }
      a += this.biases.w[i];
      A.w[i] = a;
    }
    this.out_act = A;
    return this.out_act;
  }

  backward() {
    var V = this.in_act;
    V.dw = global.zeros(V.w.length); // zero out the gradient in input Vol

    // compute gradient wrt weights and data
    for (var i = 0; i < this.out_depth; i++) {
      var tfi = this.filters[i];
      var chain_grad = this.out_act.dw[i];
      for (var d = 0; d < this.num_inputs; d++) {
        V.dw[d] += tfi.w[d] * chain_grad; // grad wrt input data
        tfi.dw[d] += V.w[d] * chain_grad; // grad wrt params
      }
      this.biases.dw[i] += chain_grad;
    }
  }

  getParamsAndGrads() {
    var response = [];
    for (var i = 0; i < this.out_depth; i++) {
      response.push({ params: this.filters[i].w, grads: this.filters[i].dw, l1_decay_mul: this.l1_decay_mul, l2_decay_mul: this.l2_decay_mul });
    }
    response.push({ params: this.biases.w, grads: this.biases.dw, l1_decay_mul: 0.0, l2_decay_mul: 0.0 });
    return response;
  }

  toJSON() {
    var json = {};
    json.out_depth = this.out_depth;
    json.out_sx = this.out_sx;
    json.out_sy = this.out_sy;
    json.layer_type = this.layer_type;
    json.num_inputs = this.num_inputs;
    json.l1_decay_mul = this.l1_decay_mul;
    json.l2_decay_mul = this.l2_decay_mul;
    json.filters = [];
    for (var i = 0; i < this.filters.length; i++) {
      json.filters.push(this.filters[i].toJSON());
    }
    json.biases = this.biases.toJSON();
    return json;
  }

  fromJSON(json) {
    this.out_depth = json.out_depth;
    this.out_sx = json.out_sx;
    this.out_sy = json.out_sy;
    this.layer_type = json.layer_type;
    this.num_inputs = json.num_inputs;
    this.l1_decay_mul = typeof json.l1_decay_mul !== 'undefined' ? json.l1_decay_mul : 1.0;
    this.l2_decay_mul = typeof json.l2_decay_mul !== 'undefined' ? json.l2_decay_mul : 1.0;
    this.filters = [];
    for (var i = 0; i < json.filters.length; i++) {
      var v = new __WEBPACK_IMPORTED_MODULE_2__vol__["a" /* default */](0, 0, 0, 0);
      v.fromJSON(json.filters[i]);
      this.filters.push(v);
    }
    this.biases = new __WEBPACK_IMPORTED_MODULE_2__vol__["a" /* default */](0, 0, 0, 0);
    this.biases.fromJSON(json.biases);
  }
}) || _class);


/* unused harmony default export */ var _unused_webpack_default_export = FullyConnLayer;

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__fc__ = __webpack_require__(27);
/* unused harmony reexport namespace */
/* unused harmony reexport namespace */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__lrn__ = __webpack_require__(30);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__dropout__ = __webpack_require__(26);
/* unused harmony reexport namespace */
/* unused harmony reexport namespace */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__input__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__softmax__ = __webpack_require__(36);
/* unused harmony reexport namespace */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__regression__ = __webpack_require__(33);
/* unused harmony reexport namespace */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__cnn__ = __webpack_require__(25);
/* unused harmony reexport namespace */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__pool__ = __webpack_require__(32);
/* unused harmony reexport namespace */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__relu__ = __webpack_require__(34);
/* unused harmony reexport namespace */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__sigmoid__ = __webpack_require__(35);
/* unused harmony reexport namespace */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__tanh__ = __webpack_require__(38);
/* unused harmony reexport namespace */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__maxout__ = __webpack_require__(31);
/* unused harmony reexport namespace */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__svm__ = __webpack_require__(37);
/* unused harmony reexport namespace */














/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__layer_factory__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_core_decorators__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__vol__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils__ = __webpack_require__(4);
var _dec, _class;






let InputLayer = (_dec = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_core_decorators__["decorate"])(__WEBPACK_IMPORTED_MODULE_0__layer_factory__["a" /* register */]), _dec(_class = class InputLayer {
  constructor(opt) {
    opt = opt || {};

    // required: depth
    this.out_depth = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__utils__["c" /* getopt */])(opt, ['out_depth', 'depth'], 0);

    // optional: default these dimensions to 1
    this.out_sx = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__utils__["c" /* getopt */])(opt, ['out_sx', 'sx', 'width'], 1);
    this.out_sy = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__utils__["c" /* getopt */])(opt, ['out_sy', 'sy', 'height'], 1);

    // computed
    this.layer_type = 'input';
  }

  forward(V, is_training) {
    this.in_act = V;
    this.out_act = V;
    return this.out_act; // simply identity function for now
  }

  backward() {}

  getParamsAndGrads() {
    return [];
  }

  toJSON() {
    var json = {};
    json.out_depth = this.out_depth;
    json.out_sx = this.out_sx;
    json.out_sy = this.out_sy;
    json.layer_type = this.layer_type;
    return json;
  }

  fromJSON(json) {
    this.out_depth = json.out_depth;
    this.out_sx = json.out_sx;
    this.out_sy = json.out_sy;
    this.layer_type = json.layer_type;
  }
}) || _class);


/* unused harmony default export */ var _unused_webpack_default_export = InputLayer;

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__layer_factory__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_core_decorators__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__vol__ = __webpack_require__(0);
var _dec, _class;





let LocalResponseNormalizationLayer = (_dec = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_core_decorators__["decorate"])(__WEBPACK_IMPORTED_MODULE_0__layer_factory__["a" /* register */]), _dec(_class = class LocalResponseNormalizationLayer {
  constructor(opt) {
    var opt = opt || {};

    // required
    this.k = opt.k;
    this.n = opt.n;
    this.alpha = opt.alpha;
    this.beta = opt.beta;

    // computed
    this.out_sx = opt.in_sx;
    this.out_sy = opt.in_sy;
    this.out_depth = opt.in_depth;
    this.layer_type = 'lrn';

    // checks
    if (this.n % 2 === 0) {
      console.log('WARNING n should be odd for LRN layer');
    }
  }

  forward(V, is_training) {
    this.in_act = V;

    var A = V.cloneAndZero();
    this.S_cache_ = V.cloneAndZero();
    var n2 = Math.floor(this.n / 2);
    for (var x = 0; x < V.sx; x++) {
      for (var y = 0; y < V.sy; y++) {
        for (var i = 0; i < V.depth; i++) {

          var ai = V.get(x, y, i);

          // normalize in a window of size n
          var den = 0.0;
          for (var j = Math.max(0, i - n2); j <= Math.min(i + n2, V.depth - 1); j++) {
            var aa = V.get(x, y, j);
            den += aa * aa;
          }
          den *= this.alpha / this.n;
          den += this.k;
          this.S_cache_.set(x, y, i, den); // will be useful for backprop
          den = Math.pow(den, this.beta);
          A.set(x, y, i, ai / den);
        }
      }
    }

    this.out_act = A;
    return this.out_act; // dummy identity function for now
  }

  backward() {
    // evaluate gradient wrt data
    var V = this.in_act; // we need to set dw of this
    V.dw = global.zeros(V.w.length); // zero out gradient wrt data
    var A = this.out_act; // computed in forward pass 

    var n2 = Math.floor(this.n / 2);
    for (var x = 0; x < V.sx; x++) {
      for (var y = 0; y < V.sy; y++) {
        for (var i = 0; i < V.depth; i++) {

          var chain_grad = this.out_act.get_grad(x, y, i);
          var S = this.S_cache_.get(x, y, i);
          var SB = Math.pow(S, this.beta);
          var SB2 = SB * SB;

          // normalize in a window of size n
          for (var j = Math.max(0, i - n2); j <= Math.min(i + n2, V.depth - 1); j++) {
            var aj = V.get(x, y, j);
            var g = -aj * this.beta * Math.pow(S, this.beta - 1) * this.alpha / this.n * 2 * aj;
            if (j === i) g += SB;
            g /= SB2;
            g *= chain_grad;
            V.add_grad(x, y, j, g);
          }
        }
      }
    }
  }

  getParamsAndGrads() {
    return [];
  }

  toJSON() {
    var json = {};
    json.k = this.k;
    json.n = this.n;
    json.alpha = this.alpha; // normalize by size
    json.beta = this.beta;
    json.out_sx = this.out_sx;
    json.out_sy = this.out_sy;
    json.out_depth = this.out_depth;
    json.layer_type = this.layer_type;
    return json;
  }

  fromJSON(json) {
    this.k = json.k;
    this.n = json.n;
    this.alpha = json.alpha; // normalize by size
    this.beta = json.beta;
    this.out_sx = json.out_sx;
    this.out_sy = json.out_sy;
    this.out_depth = json.out_depth;
    this.layer_type = json.layer_type;
  }
}) || _class);


/* unused harmony default export */ var _unused_webpack_default_export = LocalResponseNormalizationLayer;

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__layer_factory__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_core_decorators__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__vol__ = __webpack_require__(0);
var _dec, _class;





let MaxoutLayer = (_dec = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_core_decorators__["decorate"])(__WEBPACK_IMPORTED_MODULE_0__layer_factory__["a" /* register */]), _dec(_class = class MaxoutLayer {
  constructor(opt) {
    var opt = opt || {};

    // required
    this.group_size = typeof opt.group_size !== 'undefined' ? opt.group_size : 2;

    // computed
    this.out_sx = opt.in_sx;
    this.out_sy = opt.in_sy;
    this.out_depth = Math.floor(opt.in_depth / this.group_size);
    this.layer_type = 'maxout';

    this.switches = global.zeros(this.out_sx * this.out_sy * this.out_depth); // useful for backprop
  }

  forward(V, is_training) {
    this.in_act = V;
    var N = this.out_depth;
    var V2 = new __WEBPACK_IMPORTED_MODULE_2__vol__["a" /* default */](this.out_sx, this.out_sy, this.out_depth, 0.0);

    // optimization branch. If we're operating on 1D arrays we dont have
    // to worry about keeping track of x,y,d coordinates inside
    // input volumes. In convnets we do :(
    if (this.out_sx === 1 && this.out_sy === 1) {
      for (var i = 0; i < N; i++) {
        var ix = i * this.group_size; // base index offset
        var a = V.w[ix];
        var ai = 0;
        for (var j = 1; j < this.group_size; j++) {
          var a2 = V.w[ix + j];
          if (a2 > a) {
            a = a2;
            ai = j;
          }
        }
        V2.w[i] = a;
        this.switches[i] = ix + ai;
      }
    } else {
      var n = 0; // counter for switches
      for (var x = 0; x < V.sx; x++) {
        for (var y = 0; y < V.sy; y++) {
          for (var i = 0; i < N; i++) {
            var ix = i * this.group_size;
            var a = V.get(x, y, ix);
            var ai = 0;
            for (var j = 1; j < this.group_size; j++) {
              var a2 = V.get(x, y, ix + j);
              if (a2 > a) {
                a = a2;
                ai = j;
              }
            }
            V2.set(x, y, i, a);
            this.switches[n] = ix + ai;
            n++;
          }
        }
      }
    }
    this.out_act = V2;
    return this.out_act;
  }

  backward() {
    var V = this.in_act; // we need to set dw of this
    var V2 = this.out_act;
    var N = this.out_depth;
    V.dw = global.zeros(V.w.length); // zero out gradient wrt data

    // pass the gradient through the appropriate switch
    if (this.out_sx === 1 && this.out_sy === 1) {
      for (var i = 0; i < N; i++) {
        var chain_grad = V2.dw[i];
        V.dw[this.switches[i]] = chain_grad;
      }
    } else {
      // bleh okay, lets do this the hard way
      var n = 0; // counter for switches
      for (var x = 0; x < V2.sx; x++) {
        for (var y = 0; y < V2.sy; y++) {
          for (var i = 0; i < N; i++) {
            var chain_grad = V2.get_grad(x, y, i);
            V.set_grad(x, y, this.switches[n], chain_grad);
            n++;
          }
        }
      }
    }
  }

  getParamsAndGrads() {
    return [];
  }

  toJSON() {
    var json = {};
    json.out_depth = this.out_depth;
    json.out_sx = this.out_sx;
    json.out_sy = this.out_sy;
    json.layer_type = this.layer_type;
    json.group_size = this.group_size;
    return json;
  }

  fromJSON(json) {
    this.out_depth = json.out_depth;
    this.out_sx = json.out_sx;
    this.out_sy = json.out_sy;
    this.layer_type = json.layer_type;
    this.group_size = json.group_size;
    this.switches = global.zeros(this.group_size);
  }
}) || _class);


/* unused harmony default export */ var _unused_webpack_default_export = MaxoutLayer;

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__layer_factory__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_core_decorators__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__vol__ = __webpack_require__(0);
var _dec, _class;





let PoolLayer = (_dec = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_core_decorators__["decorate"])(__WEBPACK_IMPORTED_MODULE_0__layer_factory__["a" /* register */]), _dec(_class = class PoolLayer {
  constructor(opt) {
    var opt = opt || {};

    // required
    this.sx = opt.sx; // filter size
    this.in_depth = opt.in_depth;
    this.in_sx = opt.in_sx;
    this.in_sy = opt.in_sy;

    // optional
    this.sy = typeof opt.sy !== 'undefined' ? opt.sy : this.sx;
    this.stride = typeof opt.stride !== 'undefined' ? opt.stride : 2;
    this.pad = typeof opt.pad !== 'undefined' ? opt.pad : 0; // amount of 0 padding to add around borders of input volume

    // computed
    this.out_depth = this.in_depth;
    this.out_sx = Math.floor((this.in_sx + this.pad * 2 - this.sx) / this.stride + 1);
    this.out_sy = Math.floor((this.in_sy + this.pad * 2 - this.sy) / this.stride + 1);
    this.layer_type = 'pool';
    // store switches for x,y coordinates for where the max comes from, for each output neuron
    this.switchx = global.zeros(this.out_sx * this.out_sy * this.out_depth);
    this.switchy = global.zeros(this.out_sx * this.out_sy * this.out_depth);
  }

  forward(V, is_training) {
    this.in_act = V;

    var A = new __WEBPACK_IMPORTED_MODULE_2__vol__["a" /* default */](this.out_sx, this.out_sy, this.out_depth, 0.0);

    var n = 0; // a counter for switches
    for (var d = 0; d < this.out_depth; d++) {
      var x = -this.pad;
      var y = -this.pad;
      for (var ax = 0; ax < this.out_sx; x += this.stride, ax++) {
        y = -this.pad;
        for (var ay = 0; ay < this.out_sy; y += this.stride, ay++) {

          // convolve centered at this particular location
          var a = -99999; // hopefully small enough ;\
          var winx = -1,
              winy = -1;
          for (var fx = 0; fx < this.sx; fx++) {
            for (var fy = 0; fy < this.sy; fy++) {
              var oy = y + fy;
              var ox = x + fx;
              if (oy >= 0 && oy < V.sy && ox >= 0 && ox < V.sx) {
                var v = V.get(ox, oy, d);
                // perform max pooling and store pointers to where
                // the max came from. This will speed up backprop 
                // and can help make nice visualizations in future
                if (v > a) {
                  a = v;
                  winx = ox;
                  winy = oy;
                }
              }
            }
          }
          this.switchx[n] = winx;
          this.switchy[n] = winy;
          n++;
          A.set(ax, ay, d, a);
        }
      }
    }
    this.out_act = A;
    return this.out_act;
  }

  backward() {
    // pooling layers have no parameters, so simply compute 
    // gradient wrt data here
    var V = this.in_act;
    V.dw = global.zeros(V.w.length); // zero out gradient wrt data
    var A = this.out_act; // computed in forward pass 

    var n = 0;
    for (var d = 0; d < this.out_depth; d++) {
      var x = -this.pad;
      var y = -this.pad;
      for (var ax = 0; ax < this.out_sx; x += this.stride, ax++) {
        y = -this.pad;
        for (var ay = 0; ay < this.out_sy; y += this.stride, ay++) {

          var chain_grad = this.out_act.get_grad(ax, ay, d);
          V.add_grad(this.switchx[n], this.switchy[n], d, chain_grad);
          n++;
        }
      }
    }
  }

  getParamsAndGrads() {
    return [];
  }

  toJSON() {
    var json = {};
    json.sx = this.sx;
    json.sy = this.sy;
    json.stride = this.stride;
    json.in_depth = this.in_depth;
    json.out_depth = this.out_depth;
    json.out_sx = this.out_sx;
    json.out_sy = this.out_sy;
    json.layer_type = this.layer_type;
    json.pad = this.pad;
    return json;
  }

  fromJSON(json) {
    this.out_depth = json.out_depth;
    this.out_sx = json.out_sx;
    this.out_sy = json.out_sy;
    this.layer_type = json.layer_type;
    this.sx = json.sx;
    this.sy = json.sy;
    this.stride = json.stride;
    this.in_depth = json.in_depth;
    this.pad = typeof json.pad !== 'undefined' ? json.pad : 0; // backwards compatibility
    this.switchx = global.zeros(this.out_sx * this.out_sy * this.out_depth); // need to re-init these appropriately
    this.switchy = global.zeros(this.out_sx * this.out_sy * this.out_depth);
  }
}) || _class);


/* unused harmony default export */ var _unused_webpack_default_export = PoolLayer;

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__layer_factory__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_core_decorators__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__vol__ = __webpack_require__(0);
var _dec, _class;





let RegressionLayer = (_dec = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_core_decorators__["decorate"])(__WEBPACK_IMPORTED_MODULE_0__layer_factory__["a" /* register */]), _dec(_class = class RegressionLayer {
  constructor(opt) {
    var opt = opt || {};

    // computed
    this.num_inputs = opt.in_sx * opt.in_sy * opt.in_depth;
    this.out_depth = this.num_inputs;
    this.out_sx = 1;
    this.out_sy = 1;
    this.layer_type = 'regression';
  }

  forward(V, is_training) {
    this.in_act = V;
    this.out_act = V;
    return V; // identity function
  }

  // y is a list here of size num_inputs
  // or it can be a number if only one value is regressed
  // or it can be a struct {dim: i, val: x} where we only want to 
  // regress on dimension i and asking it to have value x
  backward(y) {

    // compute and accumulate gradient wrt weights and bias of this layer
    var x = this.in_act;
    x.dw = global.zeros(x.w.length); // zero out the gradient of input Vol
    var loss = 0.0;
    if (y instanceof Array || y instanceof Float64Array) {
      for (var i = 0; i < this.out_depth; i++) {
        var dy = x.w[i] - y[i];
        x.dw[i] = dy;
        loss += 0.5 * dy * dy;
      }
    } else if (typeof y === 'number') {
      // lets hope that only one number is being regressed
      var dy = x.w[0] - y;
      x.dw[0] = dy;
      loss += 0.5 * dy * dy;
    } else {
      // assume it is a struct with entries .dim and .val
      // and we pass gradient only along dimension dim to be equal to val
      var i = y.dim;
      var yi = y.val;
      var dy = x.w[i] - yi;
      x.dw[i] = dy;
      loss += 0.5 * dy * dy;
    }
    return loss;
  }

  getParamsAndGrads() {
    return [];
  }

  toJSON() {
    var json = {};
    json.out_depth = this.out_depth;
    json.out_sx = this.out_sx;
    json.out_sy = this.out_sy;
    json.layer_type = this.layer_type;
    json.num_inputs = this.num_inputs;
    return json;
  }

  fromJSON(json) {
    this.out_depth = json.out_depth;
    this.out_sx = json.out_sx;
    this.out_sy = json.out_sy;
    this.layer_type = json.layer_type;
    this.num_inputs = json.num_inputs;
  }
}) || _class);


/* unused harmony default export */ var _unused_webpack_default_export = RegressionLayer;

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__layer_factory__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_core_decorators__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__vol__ = __webpack_require__(0);
var _dec, _class;





let ReluLayer = (_dec = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_core_decorators__["decorate"])(__WEBPACK_IMPORTED_MODULE_0__layer_factory__["a" /* register */]), _dec(_class = class ReluLayer {
  constructor(opt) {
    var opt = opt || {};

    // computed
    this.out_sx = opt.in_sx;
    this.out_sy = opt.in_sy;
    this.out_depth = opt.in_depth;
    this.layer_type = 'relu';
  }

  forward(V, is_training) {
    this.in_act = V;
    var V2 = V.clone();
    var N = V.w.length;
    var V2w = V2.w;
    for (var i = 0; i < N; i++) {
      if (V2w[i] < 0) V2w[i] = 0; // threshold at 0
    }
    this.out_act = V2;
    return this.out_act;
  }

  backward() {
    var V = this.in_act; // we need to set dw of this
    var V2 = this.out_act;
    var N = V.w.length;
    V.dw = global.zeros(N); // zero out gradient wrt data
    for (var i = 0; i < N; i++) {
      if (V2.w[i] <= 0) V.dw[i] = 0; // threshold
      else V.dw[i] = V2.dw[i];
    }
  }

  getParamsAndGrads() {
    return [];
  }

  toJSON() {
    var json = {};
    json.out_depth = this.out_depth;
    json.out_sx = this.out_sx;
    json.out_sy = this.out_sy;
    json.layer_type = this.layer_type;
    return json;
  }

  fromJSON(json) {
    this.out_depth = json.out_depth;
    this.out_sx = json.out_sx;
    this.out_sy = json.out_sy;
    this.layer_type = json.layer_type;
  }
}) || _class);


/* unused harmony default export */ var _unused_webpack_default_export = ReluLayer;

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__layer_factory__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_core_decorators__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__vol__ = __webpack_require__(0);
var _dec, _class;





let SigmoidLayer = (_dec = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_core_decorators__["decorate"])(__WEBPACK_IMPORTED_MODULE_0__layer_factory__["a" /* register */]), _dec(_class = class SigmoidLayer {
  constructor(opt) {
    var opt = opt || {};

    // computed
    this.out_sx = opt.in_sx;
    this.out_sy = opt.in_sy;
    this.out_depth = opt.in_depth;
    this.layer_type = 'sigmoid';
  }

  forward(V, is_training) {
    this.in_act = V;
    var V2 = V.cloneAndZero();
    var N = V.w.length;
    var V2w = V2.w;
    var Vw = V.w;
    for (var i = 0; i < N; i++) {
      V2w[i] = 1.0 / (1.0 + Math.exp(-Vw[i]));
    }
    this.out_act = V2;
    return this.out_act;
  }

  backward() {
    var V = this.in_act; // we need to set dw of this
    var V2 = this.out_act;
    var N = V.w.length;
    V.dw = global.zeros(N); // zero out gradient wrt data
    for (var i = 0; i < N; i++) {
      var v2wi = V2.w[i];
      V.dw[i] = v2wi * (1.0 - v2wi) * V2.dw[i];
    }
  }

  getParamsAndGrads() {
    return [];
  }

  toJSON() {
    var json = {};
    json.out_depth = this.out_depth;
    json.out_sx = this.out_sx;
    json.out_sy = this.out_sy;
    json.layer_type = this.layer_type;
    return json;
  }

  fromJSON(json) {
    this.out_depth = json.out_depth;
    this.out_sx = json.out_sx;
    this.out_sy = json.out_sy;
    this.layer_type = json.layer_type;
  }
}) || _class);


/* unused harmony default export */ var _unused_webpack_default_export = SigmoidLayer;

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__layer_factory__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_core_decorators__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__vol__ = __webpack_require__(0);
var _dec, _class;





let SoftmaxLayer = (_dec = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_core_decorators__["decorate"])(__WEBPACK_IMPORTED_MODULE_0__layer_factory__["a" /* register */]), _dec(_class = class SoftmaxLayer {
  constructor(opt) {
    opt = opt || {};

    // computed
    this.num_inputs = opt.in_sx * opt.in_sy * opt.in_depth;
    this.out_depth = this.num_inputs;
    this.out_sx = 1;
    this.out_sy = 1;
    this.layer_type = 'softmax';
  }

  forward(V, is_training) {
    this.in_act = V;

    var A = new __WEBPACK_IMPORTED_MODULE_2__vol__["a" /* default */](1, 1, this.out_depth, 0.0);

    // compute max activation
    var as = V.w;
    var amax = V.w[0];
    for (var i = 1; i < this.out_depth; i++) {
      if (as[i] > amax) amax = as[i];
    }

    // compute exponentials (carefully to not blow up)
    var es = global.zeros(this.out_depth);
    var esum = 0.0;
    for (var i = 0; i < this.out_depth; i++) {
      var e = Math.exp(as[i] - amax);
      esum += e;
      es[i] = e;
    }

    // normalize and output to sum to one
    for (var i = 0; i < this.out_depth; i++) {
      es[i] /= esum;
      A.w[i] = es[i];
    }

    this.es = es; // save these for backprop
    this.out_act = A;
    return this.out_act;
  }

  backward(y) {

    // compute and accumulate gradient wrt weights and bias of this layer
    var x = this.in_act;
    x.dw = global.zeros(x.w.length); // zero out the gradient of input Vol

    for (var i = 0; i < this.out_depth; i++) {
      var indicator = i === y ? 1.0 : 0.0;
      var mul = -(indicator - this.es[i]);
      x.dw[i] = mul;
    }

    // loss is the class negative log likelihood
    return -Math.log(this.es[y]);
  }

  getParamsAndGrads() {
    return [];
  }

  toJSON() {
    var json = {};
    json.out_depth = this.out_depth;
    json.out_sx = this.out_sx;
    json.out_sy = this.out_sy;
    json.layer_type = this.layer_type;
    json.num_inputs = this.num_inputs;
    return json;
  }

  fromJSON(json) {
    this.out_depth = json.out_depth;
    this.out_sx = json.out_sx;
    this.out_sy = json.out_sy;
    this.layer_type = json.layer_type;
    this.num_inputs = json.num_inputs;
  }
}) || _class);


/* unused harmony default export */ var _unused_webpack_default_export = SoftmaxLayer;

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__layer_factory__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_core_decorators__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__vol__ = __webpack_require__(0);
var _dec, _class;





let SVMLayer = (_dec = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_core_decorators__["decorate"])(__WEBPACK_IMPORTED_MODULE_0__layer_factory__["a" /* register */]), _dec(_class = class SVMLayer {
  constructor(opt) {
    opt = opt || {};

    // computed
    this.num_inputs = opt.in_sx * opt.in_sy * opt.in_depth;
    this.out_depth = this.num_inputs;
    this.out_sx = 1;
    this.out_sy = 1;
    this.layer_type = 'svm';
  }

  forward(V, is_training) {
    this.in_act = V;
    this.out_act = V;
    return V; // identity function
  }

  // y is a list here of size num_inputs
  // or it can be a number if only one value is regressed
  // or it can be a struct {dim: i, val: x} where we only want to 
  // regress on dimension i and asking it to have value x
  backward(y) {

    // compute and accumulate gradient wrt weights and bias of this layer
    var x = this.in_act;
    x.dw = global.zeros(x.w.length); // zero out the gradient of input Vol

    // we're using structured loss here, which means that the score
    // of the ground truth should be higher than the score of any other 
    // class, by a margin
    var yscore = x.w[y]; // score of ground truth
    var margin = 1.0;
    var loss = 0.0;
    for (var i = 0; i < this.out_depth; i++) {
      if (y === i) {
        continue;
      }
      var ydiff = -yscore + x.w[i] + margin;
      if (ydiff > 0) {
        // violating dimension, apply loss
        x.dw[i] += 1;
        x.dw[y] -= 1;
        loss += ydiff;
      }
    }

    return loss;
  }

  getParamsAndGrads() {
    return [];
  }

  toJSON() {
    var json = {};
    json.out_depth = this.out_depth;
    json.out_sx = this.out_sx;
    json.out_sy = this.out_sy;
    json.layer_type = this.layer_type;
    json.num_inputs = this.num_inputs;
    return json;
  }

  fromJSON(json) {
    this.out_depth = json.out_depth;
    this.out_sx = json.out_sx;
    this.out_sy = json.out_sy;
    this.layer_type = json.layer_type;
    this.num_inputs = json.num_inputs;
  }
}) || _class);


/* unused harmony default export */ var _unused_webpack_default_export = SVMLayer;

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__layer_factory__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_core_decorators___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_core_decorators__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__vol__ = __webpack_require__(0);
var _dec, _class;





// a helper function, since tanh is not yet part of ECMAScript. Will be in v6.
function tanh(x) {
  var y = Math.exp(2 * x);
  return (y - 1) / (y + 1);
}

// Implements Tanh nnonlinearity elementwise
// x -> tanh(x) 
// so the output is between -1 and 1.
let TanhLayer = (_dec = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_core_decorators__["decorate"])(__WEBPACK_IMPORTED_MODULE_0__layer_factory__["a" /* register */]), _dec(_class = class TanhLayer {
  constructor(opt) {
    var opt = opt || {};

    // computed
    this.out_sx = opt.in_sx;
    this.out_sy = opt.in_sy;
    this.out_depth = opt.in_depth;
    this.layer_type = 'tanh';
  }

  forward(V, is_training) {
    this.in_act = V;
    var V2 = V.cloneAndZero();
    var N = V.w.length;
    for (var i = 0; i < N; i++) {
      V2.w[i] = tanh(V.w[i]);
    }
    this.out_act = V2;
    return this.out_act;
  }

  backward() {
    var V = this.in_act; // we need to set dw of this
    var V2 = this.out_act;
    var N = V.w.length;
    V.dw = global.zeros(N); // zero out gradient wrt data
    for (var i = 0; i < N; i++) {
      var v2wi = V2.w[i];
      V.dw[i] = (1.0 - v2wi * v2wi) * V2.dw[i];
    }
  }

  getParamsAndGrads() {
    return [];
  }

  toJSON() {
    var json = {};
    json.out_depth = this.out_depth;
    json.out_sx = this.out_sx;
    json.out_sy = this.out_sy;
    json.layer_type = this.layer_type;
    return json;
  }

  fromJSON(json) {
    this.out_depth = json.out_depth;
    this.out_sx = json.out_sx;
    this.out_sy = json.out_sy;
    this.layer_type = json.layer_type;
  }
}) || _class);


/* unused harmony default export */ var _unused_webpack_default_export = TanhLayer;

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__vol__ = __webpack_require__(0);
/* empty harmony namespace reexport */
Object.defineProperty(exports, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__net__ = __webpack_require__(5);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__magicnet__ = __webpack_require__(7);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__trainer__ = __webpack_require__(8);
/* empty harmony namespace reexport */





const SGDTrainer = Trainer;
/* harmony export (immutable) */ exports["SGDTrainer"] = SGDTrainer;


/***/ }
/******/ ]);
//# sourceMappingURL=convnet.js.map