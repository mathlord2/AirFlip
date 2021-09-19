export class Matrix {
	constructor(rows, cols) {
		this.rows = rows;
		this.cols = cols;
		this.data = [];

		for (var i = 0; i < this.rows; i++) {
			this.data[i] = [];
			for (var j = 0; j < this.cols; j++) {
				this.data[i][j] = 0;
			}
		}
	}

	static multiply(a, b) {
		if (a.cols !== b.rows) {
			console.log("Cols of A don't match Rows of B")
			return;
		}

		var result = new Matrix(a.rows, b.cols);
		result.map((e, i, j) => {
	        // Dot product of values in col
	        let sum = 0;
	        for (let k = 0; k < a.cols; k++) {
	          sum += a.data[i][k] * b.data[k][j];
	        }
	        return sum;
      	});

		return result;
	}

	multiply(n) {
		// Check if argument is a matrix or a number and multiply accordingly
		if (n instanceof Matrix) {
			for (var i = 0; i < this.rows; i++) {
				for (var j = 0; j < this.cols; j++) {
					this.data[i][j] *= n.data[i][j];
				}
			}
		} else {
			for (var i = 0; i < this.rows; i++) {
				for (var j = 0; j < this.cols; j++) {
					this.data[i][j] *= n;
				}
			}
		}
	}

	add(n) {
		// Check if argument is a matrix or a number and add accordingly
		if (n instanceof Matrix) {
			for (var i = 0; i < this.rows; i++) {
				for (var j = 0; j < this.cols; j++) {
					this.data[i][j] += n.data[i][j];
				}
			}
		} else {
			for (var i = 0; i < this.rows; i++) {
				for (var j = 0; j < this.cols; j++) {
					this.data[i][j] += n;
				}
			}
		}
	}

	static subtract(a, b) {
		if (a.rows !== b.rows || a.cols !== b.cols) {
	      console.log('Columns and Rows of A must match Columns and Rows of B.');
	      return;
	    }

	    var result = new Matrix(a.rows, a.cols)
	    result.map((_, i, j) => a.data[i][j] - b.data[i][j]);
	    return result;
	}

	subtract(n) {
		// Check if argument is a matrix or a number and add accordingly
		if (n instanceof Matrix) {
			for (var i = 0; i < this.rows; i++) {
				for (var j = 0; j < this.cols; j++) {
					this.data[i][j] -= n.data[i][j];
				}
			}
		} else {
			for (var i = 0; i < this.rows; i++) {
				for (var j = 0; j < this.cols; j++) {
					this.data[i][j] -= n;
				}
			}
		}
	}

	// Turn an array into a matrix
	static fromArray(arr) {
		var m = new Matrix(arr.length, 1);
		for (var i = 0; i < arr.length; i++) {
			m.data[i][0] = arr[i];
		}
		return m;
	}

	static from2DArray(arr) {
		var m = new Matrix(arr.length, arr[0].length);
		for (var i = 0; i < arr.length; i++) {
			for (var j = 0; j < arr[i].length; j++) {
				m.data[i][j] = arr[i][j];
			}
		}
		return m;
	}

	toArray() {
		var arr = [];

		for (var i = 0; i < this.rows; i++) {
			for (var j = 0; j < this.cols; j++) {
				arr.push(this.data[i][j]);
			}
		}

		return arr;
	}

	randomize() {
		for (var i = 0; i < this.rows; i++) {
			for (var j = 0; j < this.cols; j++) {
				this.data[i][j] = Math.random() * 2 - 1;
			}
		}
	}

	product(n) {
		if (n instanceof Matrix) {
			// Outputs a matrix
			if (this.cols !== n.rows) {
				// Number of columns in first matrix needs to be the same as the number of rows in the second matrix
				return undefined;
			}
			let result = new Matrix(this.rows, n.cols);
			let a = this;
			let b = n;

			for (var i = 0; i < result.rows; i++) {
				for (var j = 0; j < result.cols; j++) {
					let sum = 0;
					for (var k = 0 ; k < a.cols; k++) {
						sum += a.data[i][k] * b.data[k][j];	
					}
					result.data[i][j] = sum;	
				}
			}

			return result;
		} else {
			// Outputs a scalar
		}
	}

	static transpose(matrix) {
		var result = new Matrix(matrix.cols, matrix.rows);

		for (var i = 0; i < matrix.rows; i++) {
			for (var j = 0; j < matrix.cols; j++) {
				result.data[j][i] = matrix.data[i][j];
			}
		}

		return result;
	}

	map(func) {
		// Apply function to every element of matrix
		for (var i = 0; i < this.rows; i++) {
			for (var j = 0; j < this.cols; j++) {
				this.data[i][j] = func(this.data[i][j], i, j);
			}
		}
	}

	static map(matrix, func) {
		var result = new Matrix(matrix.rows, matrix.cols);

		// Apply function to every element of matrix
		for (var i = 0; i < matrix.rows; i++) {
			for (var j = 0; j < matrix.cols; j++) {
				var val = matrix.data[i][j];
				result.data[i][j] = func(val);
			}
		}

		return result;
	}

	print() {
		console.table(this.data);
	}

	serialize() {
	    return JSON.stringify(this);
	}

	static deserialize(data) {
	    if (typeof data == 'string') {
	      	data = JSON.parse(data);
	    }
	    let matrix = new Matrix(data.rows, data.cols);
	    matrix.data = data.data;
	    return matrix;
	}
}