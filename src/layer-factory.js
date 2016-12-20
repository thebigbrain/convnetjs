let layers = {}

export const createLayer = (def) => {
	if(layers(def.type)) return new layers(def.type)(def);
	throw new Error(`UNRECOGNIZED LAYER TYPE: ${def.type}`)
}

export const register = (type, Layer) => {
	if(layers[type]) throw new Error(`layer ${type} has been registered`)
	layers[type] = Layer
}
