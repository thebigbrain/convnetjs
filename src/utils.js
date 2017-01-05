import Vol from './vol'

let return_v = false;
let v_val = 0.0;

export const gaussRandom = function () {
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
}

export const randf = function (a, b) {
  return Math.random() * (b - a) + a;
}

export const randi = function (a, b) {
  return Math.floor(Math.random() * (b - a) + a);
}

export const randn = function (mu, std) {
  return mu + gaussRandom() * std;
}

export const zeros = function (n) {
  if (typeof (n) === 'undefined' || isNaN(n)) {
    return [];
  }
  if (typeof ArrayBuffer === 'undefined') {
    // lacking browser support
    var arr = new Array(n);
    for (var i = 0; i < n; i++) { arr[i] = 0; }
    return arr;
  } else {
    return new Float64Array(n);
  }
}

export const arrContains = function (arr, elt) {
  for (var i = 0, n = arr.length; i < n; i++) {
    if (arr[i] === elt) return true;
  }
  return false;
}

export const arrUnique = function (arr) {
  var b = [];
  for (var i = 0, n = arr.length; i < n; i++) {
    if (!arrContains(b, arr[i])) {
      b.push(arr[i]);
    }
  }
  return b;
}

// return max and min of a given non-empty array.
export const maxmin = function (w) {
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
}

// create random permutation of numbers, in range [0...n-1]
export const randperm = function (n) {
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
}

// sample from list lst according to probabilities in list probs
// the two lists are of same size, and probs adds up to 1
export const weightedSample = function (lst, probs) {
  var p = randf(0, 1.0);
  var cumprob = 0.0;
  for (var k = 0, n = lst.length; k < n; k++) {
    cumprob += probs[k];
    if (p < cumprob) {
      return lst[k];
    }
  }
}

// syntactic sugar function for getting default parameter values
export const getopt = function (opt, field_name, default_value) {
  if (typeof field_name === 'string') {
    // case of single string
    return (typeof opt[field_name] !== 'undefined') ? opt[field_name] : default_value;
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
}

export const assert = function (condition, message) {
  if (!condition) {
    message = message || "Assertion failed";
    if (typeof Error !== "undefined") {
      throw new Error(message);
    }
    throw message; // Fallback
  }
}

// Volume utilities
// intended for use with data augmentation
// crop is the size of output
// dx,dy are offset wrt incoming volume, of the shift
// fliplr is boolean on whether we also want to flip left<->right
const augment = function (V, crop, dx, dy, fliplr) {
  // note assumes square outputs of size crop x crop
  if (typeof (fliplr) === 'undefined') var fliplr = false;
  if (typeof (dx) === 'undefined') var dx = global.randi(0, V.sx - crop);
  if (typeof (dy) === 'undefined') var dy = global.randi(0, V.sy - crop);

  // randomly sample a crop in the input volume
  var W;
  if (crop !== V.sx || dx !== 0 || dy !== 0) {
    W = new Vol(crop, crop, V.depth, 0.0);
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
}

// img is a DOM element that contains a loaded image
// returns a Vol of size (W, H, 4). 4 is for RGBA
const img_to_vol = function (img, convert_grayscale) {

  if (typeof (convert_grayscale) === 'undefined') var convert_grayscale = false;

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
  var pv = []
  for (var i = 0; i < p.length; i++) {
    pv.push(p[i] / 255.0 - 0.5); // normalize image pixels to [-0.5, 0.5]
  }
  var x = new Vol(W, H, 4, 0.0); //input volume (image)
  x.w = pv;

  if (convert_grayscale) {
    // flatten into depth=1 array
    var x1 = new Vol(W, H, 1, 0.0);
    for (var i = 0; i < W; i++) {
      for (var j = 0; j < H; j++) {
        x1.set(i, j, 0, x.get(i, j, 0));
      }
    }
    x = x1;
  }

  return x;
}
