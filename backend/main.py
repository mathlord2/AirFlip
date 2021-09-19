import math
import random
import json

# Matrix library

class Matrix:
  def __init__(self, rows, cols):
    self.rows = rows
    self.cols = cols
    self.data = []

    for x in range(0, rows):
      self.data.append([])
      for y in range(0, cols):
        self.data[x].append(2)

  def copy(self):
    m = Matrix(self.rows, self.cols)
    for i in range(0, self.rows):
      for j in range(0, self.cols):
        m.data[i][j] = self.data[i][j]
    return m;

  @staticmethod
  def mult(a, b):
    if a.cols != b.rows:
      print("Cols of A don't match Cols of B")
      return

    def mult(e, i, j):
      sum = 0
      for k in range(0, a.cols):
        sum += a.data[i][k] * b.data[k][j]
      return sum
    
    result = Matrix(a.rows, b.cols)
    result.map(mult)
    
    return result

  def multiply(self, n):
    if type(n) == Matrix:
      for i in range(0, self.rows):
        for j in range(0, self.cols):
          self.data[i][j] *= n.data[i][j]
    else:
      for i in range(0, self.rows):
        for j in range(0, self.cols):
          self.data[i][j] *= n

  def add(self, n):
    if type(n) == Matrix:
      for i in range(0, self.rows):
        for j in range(0, self.cols):
          self.data[i][j] += n.data[i][j]
    else:
      for i in range(0, self.rows):
        for j in range(0, self.cols):
          self.data[i][j] += n

  @staticmethod
  def sub(a, b):
    if a.cols != b.rows:
      print("Cols of A don't match Cols of B")
      return

    def sub(e, i, j):
      sum = a.data[i][j] - b.data[i][j]
      return sum

    result = Matrix(a.rows, b.cols)
    result.map(sub)

    return result

  def subtract(self, n):
    if type(n) == Matrix:
      for i in range(0, self.rows):
        for j in range(0, self.cols):
          self.data[i][j] -= n.data[i][j]
    else:
      for i in range(0, self.rows):
        for j in range(0, self.cols):
          self.data[i][j] -= n

  @staticmethod
  def fromArray(arr):
    m = Matrix(len(arr), 1)
    for i in range(0, len(arr)):
      m.data[i][0] = arr[i]
    return m

  def toArray(self):
    arr = []

    for i in range(0, self.rows):
      for j in range(0, self.cols):
        arr.append(self.data[i][j])

    return arr

  def randomize(self):
    for i in range(0, self.rows):
      for j in range(0, self.cols):
        self.data[i][j] = random.randint(-1, 1)

  @staticmethod
  def transpose(matrix):
    m = Matrix(matrix.cols, matrix.rows)

    for i in range(0, matrix.rows):
      for j in range(0, matrix.cols):
        m.data[j][i] = matrix.data[i][j]
    return m

  def map(self, func):
    for i in range(0, self.rows):
      for j in range(0, self.cols):
        self.data[i][j] = func(self.data[i][j], i, j)

  @staticmethod
  def mapS(matrix, func):
    result = Matrix(matrix.rows, matrix.cols)

    for i in range(0, matrix.rows):
      for j in range(0, matrix.cols):
        val = matrix.data[i][j]
        result.data[i][j] = func(val)

    return result

  def serialize(self):
    return json.dumps(self.__dict__)

  @staticmethod
  def deserialize(data):
    matrixData = json.loads(data)
    matrix = Matrix(matrixData.rows, matrixData.cols)
    matrix.data = matrixData.data

    return matrix

def sig(x, a, b):
  return 1 / (1 + math.exp(-x));

def dSig(x):
  return x * (1-x)

class NeuralNetwork:
  def __init__(self, numInput, numHidden, numOutput):
    if type(numInput) == NeuralNetwork:
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

    self.lr = 1

  def feedForward(self, input):
    # Get the inputs in Matrix form
    inputs = Matrix.fromArray(input)

    # Multiply the weights with the inputs
    hidden = Matrix.mult(self.inputWeights, inputs)
    # Add the bias
    hidden.add(self.hiddenBias)
    # Do the activation function
    hidden.map(sig)

    outputs = Matrix.mult(self.hiddenWeights, hidden)
    outputs.add(self.outputBias)
    outputs.map(sig)

    return outputs.toArray()

  def train(self, input_array, target_array):

    # Get the inputs in Matrix form
    inputs = Matrix.fromArray(input_array)

    # Multiply the weights with the inputs
    hidden = Matrix.mult(self.inputWeights, inputs)
    # Add the bias
    hidden.add(self.hiddenBias)
    # Do the activation function
    hidden.map(sig)

    outputs = Matrix.mult(self.hiddenWeights, hidden)
    outputs.add(self.outputBias)
    outputs.map(sig)
    
    # Convert target array to matrix
    targets = Matrix.fromArray(target_array)

    output_errors = Matrix.sub(targets, outputs)

    # Get the gradient
    gradients = Matrix.mapS(outputs, dSig)
    gradients.multiply(output_errors)
    gradients.multiply(self.lr)

    # Transpose the hidden and input weights
    hiddenT = Matrix.transpose(hidden)

    # Get the deltas
    hiddenWeightsD = Matrix.mult(gradients, hiddenT)

    # Change the hidden weights now
    self.hiddenWeights.add(hiddenWeightsD)
    # Adjust hidden bias
    self.outputBias.add(gradients)

    # Calculate the hidden errors
    hiddenWeightsT = Matrix.transpose(self.hiddenWeights)
    hiddenErrors = Matrix.mult(hiddenWeightsT, output_errors)

    hiddenGrad = Matrix.mapS(hidden, dSig)

    hiddenGrad.multiply(hiddenErrors)
    hiddenGrad.multiply(self.lr)

    # Now, we calculate the deltas from input to hidden
    inputsT = Matrix.transpose(inputs)
    inputWeightsD = Matrix.mult(hiddenGrad, inputsT)

    self.inputWeights.add(inputWeightsD)

    self.hiddenBias.add(hiddenGrad)

  # Adding function for neuro-evolution
  def copy(self):
    return NeuralNetwork(self)

  # Accept an arbitrary function for mutation
  def mutate(self, rate):
    def mutate(val):
      if random.randomint(0, 1) < rate:
        return 2 * random.randint(0, 1) - 1
      else:
        return val
    
    self.inputWeights.map(mutate)
    self.hiddenWeights.map(mutate)
    self.hiddenBias.map(mutate)
    self.outputBias.map(mutate)

# Initialize neural network

nn = NeuralNetwork(2, 8, 1)

# Training data for xor

trainingData = [
	{
		"inputs": [1, 0],
		"targets": [1]
	},
	{
		"inputs": [0, 1],
		"targets": [1]
	},
	{
		"inputs": [0, 0],
		"targets": [0]
	},
	{
		"inputs": [1, 1],
		"targets": [0]
	}
]

# Training Process

reps = 1000
for i in range(0, reps):
  for x in range(0, len(trainingData)):
    index = random.randint(0, 3)

    nn.train(trainingData[x].get("inputs"), trainingData[x].get("targets"))
    print(str(i / (reps / 100)) + " % complete")

# Testing

print(nn.feedForward([1, 0]))
print(nn.feedForward([0, 0]))
print(nn.feedForward([0, 1]))
print(nn.feedForward([1, 1]))