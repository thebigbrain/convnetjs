import Vol from '../vol'

class RegressionLayer {
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
}

