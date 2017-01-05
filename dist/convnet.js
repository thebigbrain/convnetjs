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
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(1);


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
          this.w[i] = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["j" /* randn */])(0.0, scale);
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
/* harmony export (immutable) */ exports["g"] = randf;


const randi = function (a, b) {
  return Math.floor(Math.random() * (b - a) + a);
};
/* harmony export (immutable) */ exports["f"] = randi;


const randn = function (mu, std) {
  return mu + gaussRandom() * std;
};
/* harmony export (immutable) */ exports["j"] = randn;


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
/* harmony export (immutable) */ exports["c"] = arrUnique;


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
/* harmony export (immutable) */ exports["h"] = maxmin;


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
/* harmony export (immutable) */ exports["d"] = randperm;


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
/* harmony export (immutable) */ exports["e"] = weightedSample;


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
/* harmony export (immutable) */ exports["b"] = getopt;


const assert = function (condition, message) {
  if (!condition) {
    message = message || "Assertion failed";
    if (typeof Error !== "undefined") {
      throw new Error(message);
    }
    throw message; // Fallback
  }
};
/* harmony export (immutable) */ exports["i"] = assert;


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
/* 2 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__vol__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__layer_factory__ = __webpack_require__(5);
 // convenience


//import * from './layers'

// Net manages a set of layers
// For now constraints: Simple linear order of layers, first layer input last layer a cost layer
let Net = class Net {
  constructor(options) {
    this.layers = [];
  }

  // takes a list of layer definitions and creates the network layer objects
  makeLayers(defs) {
    // few checks
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["i" /* assert */])(defs.length >= 2, 'Error! At least one input layer and one loss layer are required.');
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["i" /* assert */])(defs[0].type === 'input', 'Error! First layer must be the input layer, to declare size of inputs');

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
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["i" /* assert */])(S.layer_type === 'softmax', 'getPrediction function assumes softmax as last layer of the net!');

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
/* 3 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__net__ = __webpack_require__(2);



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
    this.train_ratio = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* getopt */])(opt, 'train_ratio', 0.7);
    this.num_folds = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* getopt */])(opt, 'num_folds', 10);
    this.num_candidates = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* getopt */])(opt, 'num_candidates', 50); // we evaluate several in parallel
    // how many epochs of data to train every network? for every fold?
    // higher values mean higher accuracy in final results, but more expensive
    this.num_epochs = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* getopt */])(opt, 'num_epochs', 50);
    // number of best models to average during prediction. Usually higher = better
    this.ensemble_size = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* getopt */])(opt, 'ensemble_size', 10);

    // candidate parameters
    this.batch_size_min = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* getopt */])(opt, 'batch_size_min', 10);
    this.batch_size_max = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* getopt */])(opt, 'batch_size_max', 300);
    this.l2_decay_min = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* getopt */])(opt, 'l2_decay_min', -4);
    this.l2_decay_max = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* getopt */])(opt, 'l2_decay_max', 2);
    this.learning_rate_min = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* getopt */])(opt, 'learning_rate_min', -4);
    this.learning_rate_max = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* getopt */])(opt, 'learning_rate_max', 0);
    this.momentum_min = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* getopt */])(opt, 'momentum_min', 0.9);
    this.momentum_max = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* getopt */])(opt, 'momentum_max', 0.9);
    this.neurons_min = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* getopt */])(opt, 'neurons_min', 5);
    this.neurons_max = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* getopt */])(opt, 'neurons_max', 30);

    // computed
    this.folds = []; // data fold indices, gets filled by sampleFolds()
    this.candidates = []; // candidate networks that are being currently evaluated
    this.evaluated_candidates = []; // history of all candidates that were fully evaluated on all folds
    this.unique_labels = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["c" /* arrUnique */])(labels);
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
      var p = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["d" /* randperm */])(N);
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
    var nl = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["e" /* weightedSample */])([0, 1, 2, 3], [0.2, 0.3, 0.3, 0.2]); // prefer nets with 1,2 hidden layers
    for (var q = 0; q < nl; q++) {
      var ni = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["f" /* randi */])(this.neurons_min, this.neurons_max);
      var act = ['tanh', 'maxout', 'relu'][__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["f" /* randi */])(0, 3)];
      if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["g" /* randf */])(0, 1) < 0.5) {
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
    var bs = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["f" /* randi */])(this.batch_size_min, this.batch_size_max); // batch size
    var l2 = Math.pow(10, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["g" /* randf */])(this.l2_decay_min, this.l2_decay_max)); // l2 weight decay
    var lr = Math.pow(10, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["g" /* randf */])(this.learning_rate_min, this.learning_rate_max)); // learning rate
    var mom = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["g" /* randf */])(this.momentum_min, this.momentum_max); // momentum. Lets just use 0.9, works okay usually ;p
    var tp = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["g" /* randf */])(0, 1); // trainer type
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
    var dataix = fold.train_ix[__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["f" /* randi */])(0, fold.train_ix.length)];
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
      var stats = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["h" /* maxmin */])(xout.w);
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


/* harmony default export */ exports["a"] = MagicNet;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__vol__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(1);



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


/* harmony default export */ exports["a"] = Trainer;

/***/ },
/* 5 */
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
/* unused harmony export register */


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__vol__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__net__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__magicnet__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__trainer__ = __webpack_require__(4);





/* harmony default export */ exports["default"] = {
	Vol: __WEBPACK_IMPORTED_MODULE_0__vol__["a" /* default */],
	Net: __WEBPACK_IMPORTED_MODULE_1__net__["a" /* default */],
	MagicNet: __WEBPACK_IMPORTED_MODULE_2__magicnet__["a" /* default */],
	Trainer: __WEBPACK_IMPORTED_MODULE_3__trainer__["a" /* default */],
	SGDTrainer: __WEBPACK_IMPORTED_MODULE_3__trainer__["a" /* default */]
};

/***/ }
/******/ ]);
//# sourceMappingURL=convnet.js.map