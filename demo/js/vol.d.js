const convnetjs = require('../../dist/convnet');

// create a Vol of size 32x32x3, and filled with random numbers
var v = new convnetjs.Vol(32, 32, 3);
var v = new convnetjs.Vol(32, 32, 3, 0.0); // same volume but init with zeros
var v = new convnetjs.Vol(1, 1, 3); // a 1x1x3 Vol with random numbers
 
// you can also initialize with a specific list. E.g. create a 1x1x3 Vol:
var v = new convnetjs.Vol([1.2, 3.5, 3.6]);
 
// the Vol is a wrapper around two lists: .w and .dw, which both have 
// sx * sy * depth number of elements. E.g:
v.w[0] // contains 1.2
v.dw[0] // contains 0, because gradients are initialized with zeros

// you can also access the 3-D Vols with getters and setters
// but these are subject to function call overhead
var vol3d = new convnetjs.Vol(10, 10, 5);
vol3d.set(2,0,1,5.0); // set coordinate (2,0,1) to 5.0
vol3d.get(2,0,1) // returns 5.0
