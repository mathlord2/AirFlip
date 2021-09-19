import { Matrix } from "./matrix.js";

function sig(x) {
	return 1.0 / (1.0 + Math.exp(-x))
}

function dSig(x) {
	return x * (1 - x);
}

export class NeuralNetwork {
	constructor(numInput, numHidden, numOutput) {
		if (numInput instanceof NeuralNetwork) {
			var a = numInput;
			this.numInput = a.numInput;
			this.numHidden = a.numHidden;
			this.numOutput = a.numOutput;

			this.inputWeights = a.inputWeights.copy();
			this.hiddenWeights = a.hiddenWeights.copy();

			this.hiddenBias = a.hiddenBias.copy();
			this.outputBias = a.outputBias.copy();
		} else {
			this.numInput = numInput;
			this.numHidden = numHidden;
			this.numOutput = numOutput;

			// Initialize and randomize the weights for the input and hidden layer
			this.inputWeights = new Matrix(this.numHidden, this.numInput);
			this.hiddenWeights = new Matrix(this.numOutput, this.numHidden);
			// Randomize the weights from -1 to 1
			this.inputWeights.randomize();
			this.hiddenWeights.randomize();

			// Initialize and randomize the bias
			this.hiddenBias = new Matrix(this.numHidden, 1);
			this.outputBias = new Matrix(this.numOutput, 1);
			this.hiddenBias.randomize();
			this.outputBias.randomize();
		}

		this.lr = 0.1;
	}

	feedForward(input) {
		// Get the inputs in Matrix form
		var inputs = Matrix.fromArray(input)

		// Multiply the weights with the inputs
		var hidden = Matrix.multiply(this.inputWeights, inputs);
		// Add the bias
		hidden.add(this.hiddenBias);
		// Do the activation function
		hidden.map(sig);

		var outputs = Matrix.multiply(this.hiddenWeights, hidden);
		outputs.add(this.outputBias);
		outputs.map(sig);

		return outputs.toArray();
	}

	train(input_array, target_array) {

		// Get the inputs in Matrix form
		var inputs = Matrix.fromArray(input_array)

		// Multiply the weights with the inputs
		var hidden = Matrix.multiply(this.inputWeights, inputs);
		// Add the bias
		hidden.add(this.hiddenBias);
		// Do the activation function
		hidden.map(sig);

		var outputs = Matrix.multiply(this.hiddenWeights, hidden);
		outputs.add(this.outputBias);
		outputs.map(sig);


		// Convert target array to matrix
		var targets = Matrix.fromArray(target_array);

		var output_errors = Matrix.subtract(targets, outputs);

		// Get the gradient
		var gradients = Matrix.map(outputs, dSig);
		gradients.multiply(output_errors);
		gradients.multiply(this.lr)
		
		// Transpose the hidden and input weights
		var hiddenT = Matrix.transpose(hidden);

		// Get the deltas
		var hiddenWeightsD = Matrix.multiply(gradients, hiddenT);

		// Change the hidden weights now
		this.hiddenWeights.add(hiddenWeightsD);
		// Adjust hidden bias
		this.outputBias.add(gradients);

		// Calculate the hidden errors
		var hiddenWeightsT = Matrix.transpose(this.hiddenWeights);
		var hiddenErrors = Matrix.multiply(hiddenWeightsT, output_errors);

		var hiddenGrad = Matrix.map(hidden, dSig);

		hiddenGrad.multiply(hiddenErrors);
		hiddenGrad.multiply(this.lr);


		// Now, we calculate the deltas from input to hidden
		var inputsT = Matrix.transpose(inputs);
		var inputWeightsD = Matrix.multiply(hiddenGrad, inputsT);

		this.inputWeights.add(inputWeightsD)

		this.hiddenBias.add(hiddenGrad);
	}

	serialize() {
    	return JSON.stringify(this);
  	}

	static deserialize(data) {
	    if (typeof data == 'string') {
	      	data = JSON.parse(data);
	    }
	    let nn = new NeuralNetwork(data.input_nodes, data.hidden_nodes, data.output_nodes);
	    nn.inputWeights = Matrix.deserialize(data.inputWeights);
	    nn.hiddenWeights = Matrix.deserialize(data.hiddenWeights);
	    nn.hiddenBias = Matrix.deserialize(data.hiddenBias);
	    nn.outputBias = Matrix.deserialize(data.outputBias);
	    nn.lr = data.lr;
	    return nn;
	 }


	// Adding function for neuro-evolution
	copy() {
	    return new NeuralNetwork(this);
	}

	// Accept an arbitrary function for mutation
	mutate(rate) {
		function mutate(val) {
			if (Math.random() < rate) {
				return 2 * Math.random() - 1;
			} else {
				return val;
			}
		}
	    this.inputWeights.map(mutate);
	    this.hiddenWeights.map(mutate);
	    this.hiddenBias.map(mutate);
	    this.outputBias.map(mutate);
	}

}