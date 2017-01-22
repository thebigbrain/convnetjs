import {
	FullyConnLayer,
	ConvLayer,
	SigmoidLayer,
	DropoutLayer,
	InputLayer,
	LocalResponseNormalizationLayer,
	MaxoutLayer,
	PoolLayer,
	RegressionLayer,
	ReluLayer,
	SVMLayer,
	TanhLayer,
	SoftmaxLayer
} from './layers';

let layers = {};

export const createLayer = (def) => {
	if(layers[def.type]) return new layers[def.type](def);
	throw new Error(`UNRECOGNIZED LAYER TYPE: ${def.type}`)
}

export const register = (type, Layer) => {
	if(layers[type]) throw new Error(`layer ${type} has been registered`);
	layers[type] = Layer
}

register('fc', FullyConnLayer)
register('conv', ConvLayer)
register('sigmoid', SigmoidLayer)
register('dropout', DropoutLayer)
register('input', InputLayer)
register('lrn', LocalResponseNormalizationLayer)
register('maxout', MaxoutLayer)
register('pool', PoolLayer)
register('regression', RegressionLayer)
register('relu', ReluLayer)
register('svm', SVMLayer)
register('tanh', TanhLayer)
register('softmax', SoftmaxLayer)
