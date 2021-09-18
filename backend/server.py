import math
import numpy as np

class Matrix:
	def __init__(self, rows, cols):
		self.rows = rows
		self.cols = cols
		self.data = []

		for i in range(0, len(self.rows)):
			self.data[i] = []
			for j in range(0, len(self.cols)):
				self.data[i][j] = 0
				
	@staticmethod
	def multiply(a, b):
		if a.cols != b.rows:
			print("Cols of A don't match Rows of B")
			return

		result = Matrix(a.rows, b.cols)

		"""map():

		result.map((e, i, j) =>:
	        # Dot product of values in col
	        sum = 0
	        for k in range(len(a.cols)):
	          sum += a.data[i][k] * b.data[k][j]
	        return sum
      	)"""

		return result

	def multiply(self, n):
		# Check if argument is a matrix or a number and multiply accordingly
		if (isinstance(n, Matrix)):
			for i in range(len(self.rows)):
				for j in range(len(self.cols)):
					self.data[i][j] *= n.data[i][j]
		else:
			for i in range(len(self.rows)):
				for j in range(len(self.cols)):
					self.data[i][j] *= n

	def add(self, n):
		# Check if argument is a matrix or a number and add accordingly
		if (isinstance(n, Matrix)):
			for i in range(len(self.rows)):
				for j in range(len(self.cols)):
					self.data[i][j] += n.data[i][j]
		else:
			for i in range(len(self.rows)):
				for j in range(len(self.cols)):
					self.data[i][j] += n

	@staticmethod
	def subtract(a, b):
		if a.rows != b.rows or a.cols != b.cols:
			print('Columns and Rows of A must match Columns and Rows of B.')
	    	return
			
		result = Matrix(a.rows, a.cols)
		"""result.map((_, i, j) => a.data[i][j] - b.data[i][j])"""
		return result

	def subtract(self, n):
		# Check if argument is a matrix or a number and add accordingly
		if (isinstance(n, Matrix)):
			for i in range(len(self.rows)):
				for j in range(len(self.cols)):
					self.data[i][j] -= n.data[i][j]
		else:
			for i in range(len(self.rows)):
				for j in range(len(self.cols)):
					self.data[i][j] -= n

	# Turn an array into a matrix
	@staticmethod
	def fromArray(arr):
		m = Matrix(arr.length, 1)
		for i in range(len(arr)):
			m.data[i][0] = arr[i]
		return m

	@staticmethod
	def from2DArray(arr):
		m = Matrix(arr.length, arr[0].length)
		for i in range(len(arr)):
			for j in range(len(arr[i])):
				m.data[i][j] = arr[i][j]
		return m

	def toArray(self):
		arr = []

		for i in range(len(self.rows)):
			for j in range(len(self.cols)):
				arr.push(self.data[i][j])

		return arr

	def randomize(self):

		for i in range(len(self.rows)):
			for j in range(len(self.cols)):
				self.data[i][j] = math.random() * 2 - 1

	def product(self, n):
		if isinstance(n, Matrix):
			# Outputs a matrix
			if self.cols != n.rows:
				# Number of columns in first matrix needs to be the same as the number of rows in the second matrix
				return None
			result = Matrix(self.rows, n.cols)
			a = self
			b = n

			for i in range(len(result.rows)):
				for j in range(len(result.cols)):
					sum = 0
					for k in range(len(a.cols)):
						sum += a.data[i][k] * b.data[k][j]	
					result.data[i][j] = sum	

			return result

	@staticmethod
	def transpose(matrix):
		result = Matrix(matrix.cols, matrix.rows)

		for i in range(len(matrix.rows)):
			for j in range(len(matrix.cols)):
				result.data[j][i] = matrix.data[i][j]

		return result


	def map(self, func):
		# Apply function to every element of matrix
		for i in range(len(self.rows)):
			for j in range(len(self.cols)):
				self.data[i][j] = func(self.data[i][j], i, j)

	@staticmethod
	def map(matrix, func):
		result = Matrix(matrix.rows, matrix.cols)

		# Apply function to every element of matrix
		for i in range(len(matrix.rows)):
			for j in range(len(matrix.cols)):
				val = matrix.data[i][j]
				result.data[i][j] = func(val)

		return result

	"""serialize():
	    return JSON.stringify(self)
	

	static deserialize(data):
	    if (typeof data == 'string'):
	      	data = JSON.parse(data)
	    
	    let matrix = new Matrix(data.rows, data.cols)
	    matrix.data = data.data
	    return matrix
	"""

def sig(x):
    sig = 1 / (1 + math.exp(-x))
    return sig

def dSig(x):
    return x * (1 - x)

class NeuralNetwork:
	def __init__(self, numInput, numHidden, numOutput):
		if (isinstance(numInput, NeuralNetwork)):
			a = numInput
			self.numInput = a.numInput
			self.numHidden = a.numHidden
			self.numOutput = a.numOutput

			self.inputWeights = a.inputWeights.copy()
			self.hiddenWeights = a.hiddenWeights.copy()

			self.hiddenBias = a.hiddenBias.copy()
			self.outputBias = a.outputBias.copy()

		else:

			self.numInput = numInput
			self.numHidden = numHidden
			self.numOutput = numOutput

			# Initialize and randomize the weights for the input and hidden layer
			self.inputWeights = Matrix(self.numHidden, self.numInput)
			self.hiddenWeights = Matrix(self.numOutput, self.numHidden)
			# Randomize the weights from -1 to 1
			self.inputWeights.randomize()
			self.hiddenWeights.randomize()

			# Initialize and randomize the bias
			self.hiddenBias = Matrix(self.numHidden, 1)
			self.outputBias = Matrix(self.numOutput, 1)
			self.hiddenBias.randomize()
			self.outputBias.randomize()
			
	def feedForward(self, input):
		# Get the inputs in Matrix form
		inputs = Matrix.fromArray(input)

		# Multiply the weights with the inputs
		hidden = Matrix.multiply(self.inputWeights, inputs)
		# Add the bias
		hidden.add(self.hiddenBias)
		# Do the activation function
		hidden.map(sig)

		outputs = Matrix.multiply(self.hiddenWeights, hidden)
		outputs.add(self.outputBias)
		outputs.map(sig)

		return outputs.toArray()

	def train(self, input_array, target_array):

		# Get the inputs in Matrix form
		inputs = Matrix.fromArray(input_array)

		# Multiply the weights with the inputs
		hidden = Matrix.multiply(self.inputWeights, inputs)
		# Add the bias
		hidden.add(self.hiddenBias)
		# Do the activation function
		hidden.map(sig)

		outputs = Matrix.multiply(self.hiddenWeights, hidden)
		outputs.add(self.outputBias)
		outputs.map(sig)


		# Convert target array to matrix
		targets = Matrix.fromArray(target_array)

		output_errors = Matrix.subtract(targets, outputs)

		# Get the gradient
		gradients = Matrix.map(outputs, dSig)
		gradients.multiply(output_errors)
		gradients.multiply(self.lr)
		
		# Transpose the hidden and input weights
		hiddenT = Matrix.transpose(hidden)

		# Get the deltas
		hiddenWeightsD = Matrix.multiply(gradients, hiddenT)

		# Change the hidden weights now
		self.hiddenWeights.add(hiddenWeightsD)
		# Adjust hidden bias
		self.outputBias.add(gradients)

		# Calculate the hidden errors
		hiddenWeightsT = Matrix.transpose(self.hiddenWeights)
		hiddenErrors = Matrix.multiply(hiddenWeightsT, output_errors)

		hiddenGrad = Matrix.map(hidden, dSig)

		hiddenGrad.multiply(hiddenErrors)
		hiddenGrad.multiply(self.lr)


		# Now, we calculate the deltas from input to hidden
		inputsT = Matrix.transpose(inputs)
		inputWeightsD = Matrix.multiply(hiddenGrad, inputsT)

		self.inputWeights.add(inputWeightsD)

		self.hiddenBias.add(hiddenGrad)

	def serialize(self):
		return JSON.stringify(self)


	@staticmethod
	def deserialize(data):
		if isinstance(data, str):
			data = JSON.parse(data)
		
		nn = NeuralNetwork(data.input_nodes, data.hidden_nodes, data.output_nodes)
		nn.inputWeights = Matrix.deserialize(data.inputWeights)
		nn.hiddenWeights = Matrix.deserialize(data.hiddenWeights)
		nn.hiddenBias = Matrix.deserialize(data.hiddenBias)
		nn.outputBias = Matrix.deserialize(data.outputBias)
		nn.lr = data.lr
		return nn


	# Adding function for neuro-evolution
	def copy(self):
		return NeuralNetwork(self)

	# Accept an arbitrary function for mutation
	def mutate(self, rate):
		def mutate(val):
			if math.random() < rate:
				return 2 * math.random() - 1
			else:
				return val
			
		
		self.inputWeights.map(mutate)
		self.hiddenWeights.map(mutate)
		self.hiddenBias.map(mutate)
		self.outputBias.map(mutate)