import math
import numpy

class Matrix:
	def __init__(self, rows, cols):
		self.rows = rows
		self.cols = cols
		self.data = []

		for (i in range(0, len(self.rows))):
			self.data[i] = []
			for (j in range(0, len(self.cols))):
				self.data[i][j] = 0

    @staticmethod
	multiply(a, b):
		if (a.cols !== b.rows) {
			console.log("Cols of A don't match Rows of B")
			return
		}

		var result = new Matrix(a.rows, b.cols)
		result.map((e, i, j) => {
	        // Dot product of values in col
	        let sum = 0
	        for (let k = 0 k < a.cols k++) {
	          sum += a.data[i][k] * b.data[k][j]
	        }
	        return sum
      	})

		return result

	multiply(n) {
		// Check if argument is a matrix or a number and multiply accordingly
		if (n instanceof Matrix) {
			for (var i = 0 i < self.rows i++) {
				for (var j = 0 j < self.cols j++) {
					self.data[i][j] *= n.data[i][j]
				}
			}
		} else {
			for (var i = 0 i < self.rows i++) {
				for (var j = 0 j < self.cols j++) {
					self.data[i][j] *= n
				}
			}
		}
	}

	add(n) {
		// Check if argument is a matrix or a number and add accordingly
		if (n instanceof Matrix) {
			for (var i = 0 i < self.rows i++) {
				for (var j = 0 j < self.cols j++) {
					self.data[i][j] += n.data[i][j]
				}
			}
		} else {
			for (var i = 0 i < self.rows i++) {
				for (var j = 0 j < self.cols j++) {
					self.data[i][j] += n
				}
			}
		}
	}

	static subtract(a, b) {
		if (a.rows !== b.rows || a.cols !== b.cols) {
	      console.log('Columns and Rows of A must match Columns and Rows of B.')
	      return
	    }

	    var result = new Matrix(a.rows, a.cols)
	    result.map((_, i, j) => a.data[i][j] - b.data[i][j])
	    return result
	}

	subtract(n) {
		// Check if argument is a matrix or a number and add accordingly
		if (n instanceof Matrix) {
			for (var i = 0 i < self.rows i++) {
				for (var j = 0 j < self.cols j++) {
					self.data[i][j] -= n.data[i][j]
				}
			}
		} else {
			for (var i = 0 i < self.rows i++) {
				for (var j = 0 j < self.cols j++) {
					self.data[i][j] -= n
				}
			}
		}
	}

	// Turn an array into a matrix
	static fromArray(arr) {
		var m = new Matrix(arr.length, 1)
		for (var i = 0 i < arr.length i++) {
			m.data[i][0] = arr[i]
		}
		return m
	}

	static from2DArray(arr) {
		var m = new Matrix(arr.length, arr[0].length)
		for (var i = 0 i < arr.length i++) {
			for (var j = 0 j < arr[i].length j++) {
				m.data[i][j] = arr[i][j]
			}
		}
		return m
	}

	toArray() {
		var arr = []

		for (var i = 0 i < self.rows i++) {
			for (var j = 0 j < self.cols j++) {
				arr.push(self.data[i][j])
			}
		}

		return arr
	}

	randomize() {
		for (var i = 0 i < self.rows i++) {
			for (var j = 0 j < self.cols j++) {
				self.data[i][j] = Math.random() * 2 - 1
			}
		}
	}

	product(n) {
		if (n instanceof Matrix) {
			// Outputs a matrix
			if (self.cols !== n.rows) {
				// Number of columns in first matrix needs to be the same as the number of rows in the second matrix
				return undefined
			}
			let result = new Matrix(self.rows, n.cols)
			let a = self
			let b = n

			for (var i = 0 i < result.rows i++) {
				for (var j = 0 j < result.cols j++) {
					let sum = 0
					for (var k = 0  k < a.cols k++) {
						sum += a.data[i][k] * b.data[k][j]	
					}
					result.data[i][j] = sum	
				}
			}

			return result
		} else {
			// Outputs a scalar
		}
	}

	static transpose(matrix) {
		var result = new Matrix(matrix.cols, matrix.rows)

		for (var i = 0 i < matrix.rows i++) {
			for (var j = 0 j < matrix.cols j++) {
				result.data[j][i] = matrix.data[i][j]
			}
		}

		return result
	}

	map(func) {
		// Apply function to every element of matrix
		for (var i = 0 i < self.rows i++) {
			for (var j = 0 j < self.cols j++) {
				self.data[i][j] = func(self.data[i][j], i, j)
			}
		}
	}

	static map(matrix, func) {
		var result = new Matrix(matrix.rows, matrix.cols)

		// Apply function to every element of matrix
		for (var i = 0 i < matrix.rows i++) {
			for (var j = 0 j < matrix.cols j++) {
				var val = matrix.data[i][j]
				result.data[i][j] = func(val)
			}
		}

		return result
	}

	print() {
		console.table(self.data)
	}

	serialize() {
	    return JSON.stringify(self)
	}

	static deserialize(data) {
	    if (typeof data == 'string') {
	      	data = JSON.parse(data)
	    }
	    let matrix = new Matrix(data.rows, data.cols)
	    matrix.data = data.data
	    return matrix
	}

var Vector = function (x, y) {
	self.x = x || 0
	self.y = y || 0
}

Vector.prototype.getMag = function () {
	return Math.sqrt(self.x*self.x + self.y*self.y)
}

Vector.prototype.setMag = function (magnitude) {
	var direction = self.getDir()
	self.x = Math.cos(direction) * magnitude
	self.y = Math.sin(direction) * magnitude
}

Vector.prototype.getDir = function () {
  return Math.atan2(self.y, self.x)
}

Vector.prototype.add = function (a, b) {
	if (b) {
    return new Vector(a.x + b.x, a.y + b.y)
  } else {
    self.x = self.x + a.x
	  self.y = self.y -+ a.y
  }
}

Vector.prototype.sub = function (a, b) {
  if (b) {
    return new Vector(a.x - b.x, a.y - b.y)
  } else {
    self.x = self.x - a.x
	  self.y = self.y - a.y
  }
}

Vector.prototype.mult = function (scalar) {
	self.x = self.x * scalar
	self.y = self.y * scalar
}

Vector.prototype.div = function (scalar) {
	self.x = self.x / scalar
	self.y = self.y / scalar
}

Vector.prototype.getDot = function (b) {
	return self.x * b.x + self.y * b.y
}

Vector.prototype.dist = function (a, b) {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))
}

Vector.prototype.normalize = function () {
	if (self.getMag() != 0) {
		self.div(self.getMag())
	}
}

Vector.prototype.limit = function (max) {
	if (self.getMag() > max) {
		self.normalize()
		self.mult(max)
	}
}

Vector.prototype.copy = function () {
	return new Vector(self.x, self.y)
}

def sigmoid(x):
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
            self.inputWeights = new Matrix(self.numHidden, self.numInput)
            self.hiddenWeights = new Matrix(self.numOutput, self.numHidden)
            # Randomize the weights from -1 to 1
            self.inputWeights.randomize()
            self.hiddenWeights.randomize()

            # Initialize and randomize the bias
            self.hiddenBias = new Matrix(self.numHidden, 1)
            self.outputBias = new Matrix(self.numOutput, 1)
            self.hiddenBias.randomize()
            self.outputBias.randomize()
        


    def feedForward(input):
        return 0
        


