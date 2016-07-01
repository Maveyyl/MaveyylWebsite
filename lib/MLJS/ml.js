/*! ml 2.0.0 2016-07-01 */
var ml = (function(){ 
	var ml = {};


	var nn_utils = (function(){
	
		return {
			matrix_size: matrix_size,
			log: log
		};
	
		function matrix_size( matrix ){
			var size = [];
	
			var el = matrix;
			while(el !== undefined && el.length !== undefined){
				size.push(el.length);
				el = el[0];
			}
	
			return size;
		}
	
	
		function log(x) {
			// return Math.log(x) / Math.log(10);
			var r= Math.log(x);
			if( r === -Infinity )
				r = -Number.MAX_VALUE;
			
			return r;
		}
	
	
	})();
	
	ml.utils = nn_utils;
	
	

	var nn_ml_utils = (function(){
	
		return {
			feature_scalling: feature_scalling,
			MSE: MSE,
			MSE_derivative: MSE_derivative,
			cross_entropy: cross_entropy,
			cross_entropy_derivative: cross_entropy_derivative,
			ReLU: ReLU,
			ReLU_derivative: ReLU_derivative,
			sigmoid: sigmoid,
			sigmoid_derivative: sigmoid_derivative
		};
	
	
		function feature_scalling(matrix){
			var r_matrix;
	
			var R = matrix.length;
			var C = matrix[0].length;
	
			var mean = new Array(C).fill(0);
			var std = new Array(C).fill(0);
			var r,c;
	
	
			// compute the mean of each column
			for(c=0;c<C;c++){
				for (r=1;r<R;r++)
					mean[c] += matrix[r][c];
				mean[c] = mean[c]/R;
			}
	
			// compute the standard deviation of each column
			for(c=0;c<C;c++){
				for (r=0;r<R;r++)
					std[c] += matrix[r][c] * matrix[r][c];
				
				std[c] = std[c]/R;
				std[c] = std[c] - (mean[c]*mean[c]);
				std[c] = Math.sqrt(std[c]);
			}
	
			// applies the normalization
			r_matrix = new Array(R);
			for (r=0;r<R;r++){
				r_matrix[r] = new Array(C);
				for(c=0;c<C;c++)
					r_matrix[r][c] = (matrix[r][c] - mean[c]) / std[c];
			}
	
			return {
				matrix: matrix,
				feature_scalling_parameters: {
					mean:mean,
					std: std
				}
			};
		}
	
	
	
	
		function MSE(H, Y){
			var m,u;
			var M = H.length;
			var U = H[0].length;
			var J = 0;
	
			var e;
	
			for(m=0;m<M;m++){
				for(u=0;u<U;u++){
					e = H[m][u] - Y[m][u];
					J += e * e;
				}
			}
			J = J /( 2* M );
	
			return J;
		}
		function MSE_derivative(H, Y, Z, activation_f_derivative){
			var m,u;
			var M = H.length;
			var U = H[0].length;
	
			var D = new Array(M);
			if( activation_f_derivative ){
				for(m=0;m<M;m++){
					D[m] = new Array(U);
					for(u=0;u<U;u++)
						D[m][u] = (H[m][u] - Y[m][u] ) * activation_f_derivative( Z[m][u] );
				}
			}
			else{
				for(m=0;m<M;m++){
					D[m] = new Array(U);
					for(u=0;u<U;u++)
						D[m][u] = (H[m][u] - Y[m][u] );
				}
			}
	
			return D;
		}
		function cross_entropy(H, Y){
			var m,u;
			var M = H.length;
			var U = H[0].length;
			var J = 0;
	
			for(m=0;m<M;m++){
				for(u=0;u<U;u++){
					J += Y[m][u] * ml.utils.log( H[m][u] ) + ( 1 - Y[m][u] ) * ml.utils.log( 1 - H[m][u] );
				}
			}
			J = -1*J /( M );
	
			return J;
		}	
		function cross_entropy_derivative(H, Y, Z, activation_f_derivative){
			var m,u;
			var M = H.length;
			var U = H[0].length;
	
			var D = new Array(M);
			for(m=0;m<M;m++){
				D[m] = new Array(U);
				for(u=0;u<U;u++)
					D[m][u] = ( H[m][u] - Y[m][u] );
			}
	
			return D;
		}
	
	
		function ReLU( z ){
			return z < 0 ? 0 : z;
		}
	
		function ReLU_derivative( z ){
			return z < 0 ? 0 : 1;
		}
	
		function sigmoid( z ){
			var r = 1.0/( 1.0 + Math.exp(-z));
			return r;
		}
		function sigmoid_derivative( z ){
			var g = sigmoid(z);
			return g * (1-g);
		}
	
	
	
	})();
	
	ml.ml_utils = nn_ml_utils;
	
	

	// float : weight_init_f( )
	// float : activation_f( z : float )
	// float : activation_f_derivative( z : float )
	
	ml.FullyConnectedLayer = FullyConnectedLayer;
	ml.fully_connected_layer_debug = false;
	
	function FullyConnectedLayer( input_unit_count, output_unit_count, weight_init_f, activation_f, activation_f_derivative ){
		this.has_weights = true;
		this.input_unit_count = input_unit_count + 1;
		this.output_unit_count = output_unit_count;
		this.weight_init_f = weight_init_f;
		this.activation_f = activation_f;
		this.activation_f_derivative = activation_f_derivative;
	
		this.weights = new Array(this.output_unit_count);
		this.weight_count = this.output_unit_count * this.input_unit_count;
	
		var i,o;
	
		for(o=0;o<this.output_unit_count;o++){
			this.weights[o] = new Array(this.input_unit_count);
			for(i=0;i<this.input_unit_count;i++){
				this.weights[o][i] = weight_init_f( this.input_unit_count , this.output_unit_count );
			}
		}
	}
	FullyConnectedLayer.prototype.forward_propagation = function( X ){
		var M = X.length;
		var m,i,o;
	
	
		var Z = new Array(M);
		var A = new Array(M);
	
		for(m=0;m<M;m++){
	
			Z[m] = new Array(this.output_unit_count).fill(0);
			A[m] = new Array(this.output_unit_count);
	
			for(o=0;o<this.output_unit_count;o++){
				Z[m][o] += this.weights[o][0]; // bias unit
				for(i=1;i<this.input_unit_count;i++)
					Z[m][o] += X[m][i-1] * this.weights[o][i];
	
				if( this.activation_f )
					A[m][o] = this.activation_f( Z[m][o] );
				else
					A[m][o] = Z[m][o];
			}
		}
	
		if( ml.fully_connected_layer_debug ){
			console.log("forward_propagation");
			// console.log("X:", X);
			console.log("A:", A);
			console.log("Z:", Z);
		}
	
		return { A: A, Z: Z} ;
	};
	FullyConnectedLayer.prototype.backward_propagation = function( D, ZP, Z, previous_layer_activation_f_derivative ){
		var M = D.length;
		var i,o,m;
	
	
		var DM = new Array(M);
		for(m=0;m<M;m++){
			DM[m] = new Array(this.input_unit_count-1).fill(0); // -1 because we don't compute D for bias unit
	
			for(i=1;i<this.input_unit_count;i++){
				for(o=0;o<this.output_unit_count;o++)
					DM[m][i-1] += D[m][o] * this.weights[o][i];
				// DM[m][i-1] *= this.activation_f_derivative( Z[m][i-1] );
	
				if( previous_layer_activation_f_derivative )
					DM[m][i-1] *= previous_layer_activation_f_derivative( Z[m][i-1] );
			}
		}
	
		if( ml.fully_connected_layer_debug ){
			console.log("backward_propagation");
			console.log("D:", D);
			console.log("Z:", Z);
			console.log("DM:", DM);
			// console.log("act:", previous_layer_activation_f_derivative, this.activation_f_derivative);
		}
	
		return DM;
	};
	FullyConnectedLayer.prototype.compute_gradient = function( D, A ){
		var M = D.length;
		var m,o,i;
	
		var grad = new Array(this.output_unit_count);
		for(o=0;o<this.output_unit_count;o++){
			grad[o] = new Array(this.input_unit_count).fill(0);
			// bias unit
			for(m=0;m<M;m++){
				grad[o][0] += D[m][o] ;
	
				for(i=1;i<this.input_unit_count;i++){
					grad[o][i] += D[m][o] * A[m][i-1];
				}
	
			}
	
			grad[o][0] /= M;
			for(i=1;i<this.input_unit_count;i++)
				grad[o][i] /= M;
		}
	
		// grad is O x I
		var unrolled_grad = this.unroll_weights( grad );
		// unrolled_grad is O*I
	
	
		if( ml.fully_connected_layer_debug ){
			console.log("compute_gradient");
			console.log("D:", D);
			console.log("A:", A);
			// console.log("grad:", unrolled_grad);
		}
	
	
		return unrolled_grad;
	};
	// FullyConnectedLayer.prototype.compute_gradient = function( D, A ){
	// 	var M = D.length;
	// 	var m,o,i;
	
	// 	var grad = new Array(this.output_unit_count);
	// 	for(o=0;o<this.output_unit_count;o++){
	// 		grad[o] = new Array(this.input_unit_count).fill(0);
	// 		// bias unit
	// 		for(m=0;m<M;m++)
	// 			grad[o][0] += D[m][o] ;
	// 		grad[o][0] /= M;
	
	// 		for(i=1;i<this.input_unit_count;i++){
	// 			for(m=0;m<M;m++)
	// 				grad[o][i] += D[m][o] * A[m][i-1];
	// 			grad[o][i] /= M;
	// 		}
	// 	}
	
	// 	// grad is O x I
	// 	var unrolled_grad = this.unroll_weights( grad );
	// 	// unrolled_grad is O*I
	
	
	// 	if( ml.fully_connected_layer_debug ){
	// 		console.log("compute_gradient");
	// 		console.log("D:", D);
	// 		console.log("A:", A);
	// 		// console.log("grad:", unrolled_grad);
	// 	}
	
	
	// 	return unrolled_grad;
	// };
	FullyConnectedLayer.prototype.weights_update = function( gradients, alpha ){
		// gradients is O*I
		var grad = this.roll_weights(gradients);
		// grad is O x I
	
		for(i=0;i<this.input_unit_count;i++){
			for(o=0;o<this.output_unit_count;o++){
				this.weights[o][i] -= alpha * grad[o][i];
			}
		}
	};
	
	
	
	
	
	
	FullyConnectedLayer.prototype.unroll_weights = function( weights ){
		var index, o, i;
	
		var unrolled_weights = new Array(this.weight_count);
	
		index = 0;
	
		for(o=0;o<this.output_unit_count;o++){
			for(i=0;i<this.input_unit_count;i++){
				unrolled_weights[index] = weights[o][i];
				index++;		
			}
		}
	
		return unrolled_weights;
	};
	FullyConnectedLayer.prototype.roll_weights = function( weights ){
		var index, o;
	
		index = 0;
		var rolled_weights = new Array(this.output_unit_count);
		for(o=0;o<this.output_unit_count;o++){
			rolled_weights[o] = weights.slice(index, index+this.input_unit_count);
			index += this.input_unit_count;
		}
	
		return rolled_weights;
	};
	
	
	
	
	
	
	
	
	
	
	
	FullyConnectedLayer.prototype.set_weight = function( weights, index, value ){
		var o,i;
		i = index % this.input_unit_count;
		o = Math.floor(index / this.input_unit_count);
	
		weights[o][i] = value;
	};
	FullyConnectedLayer.prototype.get_weight = function( weights, index ){
		var o,i;
		i = index % this.input_unit_count;
		o = Math.floor(index / this.input_unit_count);
	
		return weights[o][i];
	};
	FullyConnectedLayer.prototype.is_weight_bias = function( index ){
		var i = index % this.input_unit_count;
	
		return i === 0;
	};
	

	// float : weight_init_f( )
	// float : activation_f( z : float )
	// float : activation_f_derivative( z : float )
	
	ml.SoftmaxLayer = SoftmaxLayer;
	ml.softmax_layer_debug = false;
	
	function SoftmaxLayer( unit_count ){
		this.has_weights = false;
		this.unit_count = unit_count;
	}
	SoftmaxLayer.prototype.forward_propagation = function( X ){
		var M = X.length;
		var m,i,o;
	
		var Xe, sum_Xe = 0;
		var A = new Array(M);
	
		for(m=0;m<M;m++){
			sum_Xe = 0;
			Xe = new Array(this.unit_count);
			A[m] = new Array(this.unit_count);
	
			for(i=0;i<this.unit_count;i++){
				Xe[i] = Math.exp( X[m][i]);
				sum_Xe += Xe[i];
			}
	
			for(o=0;o<this.unit_count;o++)
				A[m][o] = Xe[o] / sum_Xe;
	
		}
	
		if( ml.softmax_layer_debug ){
			console.log("forward_propagation");
			console.log("X:", X);
			console.log("A:", A);
		}
	
		return { A: A, Z: X} ;
	};
	SoftmaxLayer.prototype.backward_propagation = function( D, ZP, Z, previous_layer_activation_f_derivative ){
		var M = D.length;
		var i,o,m;
	
	
		var DM = new Array(M);
		for(m=0;m<M;m++){
			DM[m] = new Array(this.unit_count).fill(0);
	
	
			for(i=0;i<this.unit_count;i++){
				for(o=0;o<this.unit_count;o++){
					if( i===o)
						DM[m][i] += D[m][i]  * ( 1 - D[m][o] );
					else
						DM[m][i] += - ( D[m][i] * D[m][o] );
	
				}
				// DM[m][i] = D[m][i];
	
				if( previous_layer_activation_f_derivative ){
					DM[m][i] *= previous_layer_activation_f_derivative( Z[m][i] );
				}
			}
		}
	
		if( ml.softmax_layer_debug ){
			console.log("backward_propagation");
			console.log("D:", D);
			console.log("Z:", Z);
			console.log("DM:", DM);
		}
	
		return DM;
	};
	

	// float : weight_init_f( )
	// float : activation_f( z : float )
	// float : activation_f_derivative( z : float )
	ml.ConvLayer = ConvLayer;
	ml.conv_layer_debug = false;
	
	
	/*
	Understanding Convolutional Layer
	
	A convolutional layer is a neural network layer that has the power to recognize patterns in 2D spatial data
	The same way other algorithm will use a sliding window to analyse each part of an image,
	the convolutional layer output unit is computed thanks to a sub rect of the input
	
	the output units are organized in 2D spatial data and have all shared weights,
	their role is to find the same feature in different parts of the input data
	They form a Feature Map.
	
	Since we have many feature to distinguish in an image, we will have many feature maps.
	So our output units form a 3D matrix.
	
	Since we can put convolutional layers on top of each other, the 3D output becomes the input of another conv layer.
	So the conv layer must be designed to take in input not a 2D matrix of data but a 3D matrix of data.
	Each output units is computed thanks to a sub rect of all feature map of the previous layer.
	
	Names:
	IZ : count of feature map of the input data
	IR : count of row of the input data
	IC : count of column of the input data
	
	WR : count of row of the sliding windows on our input data
	WC : count of column of the sliding windows on our input data
	
	OZ : count of feature map of the output data
	OR : count of row of the output data
	OC : count of column of the output data
	
	M : number of samples of data
	
	The input and output data will have an additional dimension of size M because we're dealing with many data at the same time.
	
	Dimensions:
	Input : 	M x IZ x IR x IC
	Output : 	M x OZ x OR x OC
	Window : 	IZ x WR x WC
	Weights : 	OZ x IZ x WR x WC
	
	Bias units aren't counted and are dealt on the fly in the algorithms
	
	*/
	
	function ConvLayer( conv_layer_config, weight_init_f, activation_f, activation_f_derivative ){
		this.has_weights = true;
		// array of 3 element containing the 3D dimensions of the input
		this.input_unit_count = conv_layer_config.input_unit_count; 
		// array of 3 element containing the 3D dimensions of the output
		this.output_unit_count = conv_layer_config.output_unit_count;
	
		// array of 2 element containing the 2D dimensions of sliding window for the feature maps
		this.window_unit_count = conv_layer_config.window_unit_count;
		// array of 2 element containing the 2D sliding range for the sliding window 
		this.window_slide_range = conv_layer_config.window_slide_range;
	
		this.IZ = this.input_unit_count[0];
		this.IR = this.input_unit_count[1];
		this.IC = this.input_unit_count[2];
	
		this.WR = this.window_unit_count[0];
		this.WC = this.window_unit_count[1];
	
		this.OZ = this.output_unit_count[0];
		this.OR = this.output_unit_count[1];
		this.OC = this.output_unit_count[2];
	
	
		this.weight_init_f = weight_init_f;
		this.activation_f = activation_f;
		this.activation_f_derivative = activation_f_derivative;
	
	
		// creating and initializing weights
		// weights are shared among a feature map
		// each unit of a feature map is computed thanks to a cube of input unit
		// => this.weights is a 4D array of size OZ x IZ x WR x WC
	
	
		var iz,wr,wc,oz;
		this.weight_count = this.OZ + this.OZ * this.IZ * this.WR * this.WC;
		this.weights = new Array(this.OZ);
		this.bias_weights = new Array(this.OZ);
		// for each ouput feature map
		for(oz=0;oz<this.OZ;oz++){
			this.bias_weights[oz] = weight_init_f(this.IZ * this.WR * this.WC ,  this.OZ * this.WR * this.WC); // only one bias weight link per output feature map, (which is shared amongst all units of the feature map)
			this.weights[oz] = new Array(this.IZ);
			// for each input feature map
			for(iz=0;iz<this.IZ;iz++){
				this.weights[oz][iz] = new Array(this.WR);
				// for each input window row
				for(wr=0;wr<this.WR;wr++){
					this.weights[oz][iz][wr] = new Array(this.WC); 
					// for each input window column
					for(wc=0;wc<this.WC;wc++){
						this.weights[oz][iz][wr][wc] = weight_init_f(this.IZ * this.WR * this.WC ,  this.OZ * this.WR * this.WC);
					}
				}
			}
		}
	}
	
	ConvLayer.prototype.forward_propagation = function( X ){ 
		var M = X.length;
	
		if( ml.conv_layer_debug ){
			console.log("forward_propagation");
			console.log("X:", X);
		}
	
	
		// X is M x IZ*IR*IC
		X = this.roll_matrix(X, [M, this.IZ, this.IR, this.IC]);
		// X is M x IZ x IR x IC
	
		var m;
		var iz, wr, wc, oz, or, oc;
		var row_offset, column_offset;
	
		Z = new Array(M);
		A = new Array(M);
	
		// for each input set
		for(m=0;m<M;m++){
			Z[m] = new Array(this.OZ);
			A[m] = new Array(this.OZ);
	
			// for each output feature map
			for(oz=0;oz<this.OZ;oz++){
				Z[m][oz] = new Array(this.OR);
				A[m][oz] = new Array(this.OR);
				// for each output row
				for(or=0;or<this.OR;or++){
					Z[m][oz][or] = new Array(this.OC).fill(0);
					A[m][oz][or] = new Array(this.OC);
					row_offset = or * this.window_slide_range[0];
					// for each output column
					for(oc=0;oc<this.OC;oc++){
						Z[m][oz][or][oc] += this.bias_weights[oz]; // handling bias
						column_offset = oc * this.window_slide_range[1];
						// for each input feature map
						for(iz=0;iz<this.IZ;iz++){
							// for each input window row
							for(wr=0;wr<this.WR;wr++){
								// for each input window column
								for(wc=0;wc<this.WC;wc++){
									// this z is fed with just a sub rect of the original 2D data
									// by consequence we transate wr and wc according to or and oc, the window size and the window sliding range
									Z[m][oz][or][oc] += X[m][iz][row_offset+wr][column_offset+wc] * this.weights[oz][iz][wr][wc];
								}
							}
						}
						if( this.activation_f )
							A[m][oz][or][oc] = this.activation_f( Z[m][oz][or][oc] );
						else
							A[m][oz][or][oc] = Z[m][oz][or][oc] ;
					}
				}
			}
		}
	
		// A is M x OZ*OR*OC
		A = this.unroll_matrix(A, [M, this.OZ, this.OR, this.OC]);
		// A is M x OZ x OR x OC
		// Z is M x OZ*OR*OC
		Z = this.unroll_matrix(Z, [M, this.OZ, this.OR, this.OC]);
		// Z is M x OZ x OR x OC
	
		if( ml.conv_layer_debug ){
			console.log("Z:", Z);
			console.log("A:", A);
		}
	
		return { A: A, Z: Z};
	};
	ConvLayer.prototype.backward_propagation = function( D, ZP, Z , previous_layer_activation_f_derivative){
		var M = D.length;	
		if( ml.conv_layer_debug ){
			console.log("backward_propagation");
			console.log("D:", D);
			console.log("Z:", Z);
		}
	
		// D is M x OZ*OR*OC
		D = this.roll_matrix(D, [M, this.OZ, this.OR, this.OC]);
		// D is M x OZ x OR x OC
		// Z is M x IZ*IR*IC
		Z = this.roll_matrix(Z, [M, this.IZ, this.IR, this.IC]);
		// Z is M x IZ x IR x IC
	
		var m;
		var iz, ir, ic, wr, wc, oz, or, oc;
		var column_offset, row_offset;
	
	
		var DM = new Array(M);
		// for each input set
		for(m=0;m<M;m++){
			DM[m] = new Array(this.IZ);
			for(iz=0;iz<this.IZ;iz++){
				DM[m][iz] = new Array(this.IR);
				for(ir=0;ir<this.IR;ir++)
					DM[m][iz][ir] = new Array(this.IC).fill(0);
			}
			
			// here we are simply going to select every unit of the WINDOW
			// and every unit of the output
			// and compute to which input unit we're going to propagate the error
			// this is some kind of weird way to iterate but it seems easier to perform than the contrary
	
			// for each input feature map
			for(iz=0;iz<this.IZ;iz++){
				// for each input window row
				for(wr=0;wr<this.WR;wr++){
					// for each input window column
					for(wc=0;wc<this.WC;wc++){
						// for each output feature map
						for(oz=0;oz<this.OZ;oz++){
							// for each output row
							for(or=0;or<this.OR;or++){
								row_offset = or * this.window_slide_range[0];
								// for each output column
								for(oc=0;oc<this.OC;oc++){
									column_offset = oc * this.window_slide_range[1];
									DM[m][iz][row_offset+wr][column_offset+wc] += D[m][oz][or][oc] * this.weights[oz][iz][wr][wc];
								}
							}
						}
					}
				}
			}
	
	
			if( previous_layer_activation_f_derivative ){
				for(iz=0;iz<this.IZ;iz++){
					for(ir=0;ir<this.IR;ir++){
						for(ic=1;ic<this.IC;ic++){
							// DM[m][iz][ir][ic] *= this.activation_f_derivative( Z[m][iz][ir][ic] );
							DM[m][iz][ir][ic] *= previous_layer_activation_f_derivative( Z[m][iz][ir][ic] );
						}
					}
				}
			}
		}
	
		// DM is M x IZ*IR*IC
		DM = this.unroll_matrix(DM, [M, this.IZ, this.IR, this.IC]);
		// DM is M x IZ x IR x IC
	
		if( ml.conv_layer_debug ){
			console.log("DM:", DM);
		}
	
		return DM;
	};
	ConvLayer.prototype.compute_gradient = function( D, A ){
		var M = D.length;	
		if( ml.conv_layer_debug ){
			console.log("compute_gradient");
			console.log("D:", D);
			console.log("A:", A);
		}
		// D is M x OZ*OR*OC
		D = this.roll_matrix(D, [M, this.OZ, this.OR, this.OC]);
		// D is M x OZ x OR x OC
		// A is M x IZ*IR*IC
		A = this.roll_matrix(A, [M, this.IZ, this.IR, this.IC]);
		// A is M x IZ x IR x IC
	
		var m;
		var iz, wr, wc, oz, or, oc; // input depth, input row, input column, output depth, output row, output column
		var column_offset, row_offset;
	
		var bias_grad = new Array(this.OZ).fill(0);
		var grad = new Array(this.OZ);
		for(oz=0;oz<this.OZ;oz++){
			// bias unit
			for(m=0;m<M;m++)
				for(or=0;or<this.OR;or++)
					for(oc=0;oc<this.OC;oc++)
						bias_grad[oz] += D[m][oz][or][oc] ;
			bias_grad[oz] /= M;
	
			grad[oz] = new Array(this.IZ);
			for(iz=0;iz<this.IZ;iz++){
				grad[oz][iz] = new Array(this.WR);
				for(wr=0;wr<this.WR;wr++){
					grad[oz][iz][wr] = new Array(this.WC).fill(0);
	
					for(wc=0;wc<this.WC;wc++){
	
						for(or=0;or<this.OR;or++){
							row_offset = or * this.window_slide_range[0];
							for(oc=0;oc<this.OC;oc++){
								column_offset = oc * this.window_slide_range[1];
	
								for(m=0;m<M;m++)
									grad[oz][iz][wr][wc] += D[m][oz][or][oc] * A[m][iz][row_offset+wr][column_offset+wc];
							}
						}
						grad[oz][iz][wr][wc] /= M;		
					}
				}
			}
		}
	
		// grad is OZ x IZ x IR x IC
		// bias_grad is OZ
		var unrolled_grad = this.unroll_weights( grad, bias_grad );
		// unrolled_grad is OZ + OZ * IZ * IR * IC
	
	
		if( ml.conv_layer_debug ){
			console.log("D:", D);
			console.log("A:", A);
		}
	
		return unrolled_grad;
	};
	ConvLayer.prototype.weights_update = function( gradients, alpha ){
		// gradients is OZ + OZ * IZ * IR * IC
		var grad = this.roll_weights(gradients);
		var bias_grad = this.roll_bias_weights(gradients);
		// grad is OZ x IZ x IR x IC
		// bias_grad is OZ
	
		var iz,wr,wc,oz; // input depth, input row, input column, ouput depth
		// for each ouput feature map
		for(oz=0;oz<this.OZ;oz++){
			this.bias_weights[oz] -= alpha * bias_grad[oz];
			// for each input feature map
			for(iz=0;iz<this.this;iz++){
				// for each input feature map row
				for(wr=0;wr<this.WR;wr++){
					// for each input feature map column
					for(wc=0;wc<this.WC;wc++){
						this.weights[oz][iz][wr][wc] -= alpha * gradients[oz][iz][wr][wc];
					}
				}
			}
		}
	};
	
	
	
	ConvLayer.prototype.unroll_matrix = function( matrix, sizes ){
		// matrix is sizes[0] x sizes[1] x sizes[2] * sizes[3]
	
		var unrolled_matrix = new Array( sizes[0] );
		var index = 0;
	
		for(var s0=0;s0<sizes[0];s0++){
			unrolled_matrix[s0] = new Array( sizes[1] * sizes[2] * sizes[3] );
			for(var s1=0;s1<sizes[1];s1++){
				for(var s2=0;s2<sizes[2];s2++){
					for(var s3=0;s3<sizes[3];s3++){
						unrolled_matrix[s0][index] = matrix[s0][s1][s2][s3];
						index++;
					}
				}
			}
			index = 0;
		}
	
		// unrolled_matrix is size[0] x sizes[1]*sizes[2]*sizes[3]
		return unrolled_matrix;
	};
	ConvLayer.prototype.roll_matrix = function( unrolled_matrix, sizes ){
		// unrolled_matrix is size[0] x sizes[1]*sizes[2]*sizes[3]
	
		var rolled_matrix = new Array( sizes[0] );
		var index = 0;
	
		for(var s0=0;s0<sizes[0];s0++){
			rolled_matrix[s0] = new Array( sizes[1]  );
			for(var s1=0;s1<sizes[1];s1++){
				rolled_matrix[s0][s1] = new Array( sizes[2]  );
				for(var s2=0;s2<sizes[2];s2++){
					rolled_matrix[s0][s1][s2] = unrolled_matrix[s0].slice(index, index+sizes[3]);
					index +=sizes[3];
				}
			}
			index = 0;
		}
	
		// rolled_matrix is sizes[0] x sizes[1] x sizes[2] * sizes[3]
		return rolled_matrix;
	};
	
	ConvLayer.prototype.unroll_weights = function( weights, bias_weights ){
		var index, oz, iz, wr, wc;
	
		var unrolled_weights = new Array(this.weight_count);
	
		index = 0;
		for(oz=0;oz<this.OZ;oz++){
			unrolled_weights[index] = bias_weights[oz];
			index++;
		}
	
		for(oz=0;oz<this.OZ;oz++){
			for(iz=0;iz<this.IZ;iz++){
				for(wr=0;wr<this.WR;wr++){
					for(wc=0;wc<this.WC;wc++){
						unrolled_weights[index] = weights[oz][iz][wr][wc];
						index++;
					}
				}
			}
		}
	
		return unrolled_weights;
	};
	ConvLayer.prototype.roll_weights = function( weights ){
		var index, oz, iz, wr;
	
		index = this.OZ;
		var rolled_weights = new Array(this.OZ);
		for(oz=0;oz<this.OZ;oz++){
			rolled_weights[oz] = new Array(this.IZ);
			for(iz=0;iz<this.IZ;iz++){
				rolled_weights[oz][iz] = new Array(this.WR);
				for(wr=0;wr<this.WR;wr++){
					rolled_weights[oz][iz][wr] = weights.slice(index, index+this.WC);
					index += this.WC;
				}
			}
		}
	
		return rolled_weights;
	};
	ConvLayer.prototype.roll_bias_weights = function( weights ){
		var rolled_bias_weights = weights.slice(0, this.OZ);
	
		return rolled_bias_weights;
	};
	
	
	ConvLayer.prototype.set_weight = function( weights, index, value ){
		if( this.is_weight_bias( index ) ){
			this.bias_weights[index] = value;
			return;
		}
		index -= this.OZ;
	
		var oz,iz,wr,wc;
		wc = index % this.WC;
		wr = Math.floor( index / this.WC ) % this.WR;
		iz = Math.floor( index / (this.WC * this.WR) ) % this.IZ;
		oz = Math.floor( index / (this.WC * this.WR * this.IZ) ) % this.OZ;
	
		weights[oz][iz][wr][wc] = value;
	};
	ConvLayer.prototype.get_weight = function( weights, index ){
		if( this.is_weight_bias( index ) )
			return this.bias_weights[index];
		index -= this.OZ;
	
		var oz,iz,wr,wc;
		wc = index % this.WC;
		wr = Math.floor( index / this.WC ) % this.WR;
		iz = Math.floor( index / (this.WC * this.WR) ) % this.IZ;
		oz = Math.floor( index / (this.WC * this.WR * this.IZ) ) % this.OZ;
	
		return weights[oz][iz][wr][wc];
	};
	ConvLayer.prototype.is_weight_bias = function( index ){
		return index < this.OZ;
	};
	

	// float : weight_init_f( )
	// float : activation_f( z : float )
	// float : activation_f_derivative( z : float )
	
	ml.MaxPoolingLayer = MaxPoolingLayer;
	ml.max_pooling_layer_debug = false;
	
	
	function MaxPoolingLayer( pooling_layer_config ){
		this.has_weights = false;
		// array of 3 element containing the 3D dimensions of the input
		this.input_unit_count = pooling_layer_config.input_unit_count; 
		// array of 3 element containing the 3D dimensions of the output
		this.output_unit_count = pooling_layer_config.output_unit_count;
	
		// array of 2 element containing the 2D dimensions of sliding window for the feature maps
		this.window_unit_count = pooling_layer_config.window_unit_count;
	
	
		this.IZ = this.input_unit_count[0];
		this.IR = this.input_unit_count[1];
		this.IC = this.input_unit_count[2];
	
		this.WR = this.window_unit_count[0];
		this.WC = this.window_unit_count[1];
	
		this.OZ = this.output_unit_count[0];
		this.OR = this.output_unit_count[1];
		this.OC = this.output_unit_count[2];
	
		// for pooling IZ === OZ
	
		// this.activation_f = activation_f;
		// this.activation_f_derivative = activation_f_derivative;
	
	
	}
	
	MaxPoolingLayer.prototype.forward_propagation = function( X ){ 
		var M = X.length;
	
		if( ml.max_pooling_layer_debug ){
			console.log("forward_propagation");
			console.log("X:", X);
		}	
	
		// X is M x IZ*IR*IC
		X = this.roll_matrix(X, [M, this.IZ, this.IR, this.IC]);
		// X is M x IZ x IR x IC
	
		var m;
		var oz, iz, wr, wc, or, oc;
		var row_offset, column_offset;
		var window_unit_count = this.WR * this.WC;
	
		Z = new Array(M);
		A = new Array(M);
	
	
		// for each input set
		for(m=0;m<M;m++){
			Z[m] = new Array(this.OZ);
			A[m] = new Array(this.OZ);
	
			// for each layer map
			for(iz=0;iz<this.IZ;iz++){
				oz = iz;
				Z[m][oz] = new Array(this.OR);
				A[m][oz] = new Array(this.OR);
				// for each output row
				for(or=0;or<this.OR;or++){
					Z[m][oz][or] = new Array(this.OC);
					A[m][oz][or] = new Array(this.OC);
					// compute input row offset
					row_offset = or * this.WR;
					// for each output column
					for(oc=0;oc<this.OC;oc++){
						// compute input row offset
						column_offset = oc * this.WC;
	
						Z[m][iz][or][oc] = new Array(window_unit_count);
						// for each window row
						for(wr=0;wr<this.WR;wr++){
							// for each window column
							for(wc=0;wc<this.WC;wc++){
								Z[m][oz][or][oc][wc + wr * this.WR] = X[m][iz][row_offset+wr][column_offset+wc];
							}
						}
						A[m][oz][or][oc] = Math.max.apply(Math, Z[m][oz][or][oc] );
						Z[m][oz][or][oc] = Z[m][oz][or][oc].indexOf(A[m][oz][or][oc] );
					}
				}
			}
		}
	
		// A is M x OZ*OR*OC
		A = this.unroll_matrix(A, [M, this.OZ, this.OR, this.OC]);
		// A is M x OZ x OR x OC
		// Z is M x OZ*OR*OC
		Z = this.unroll_matrix(Z, [M, this.OZ, this.OR, this.OC]);
		// Z is M x OZ x OR x OC
	
		if( ml.max_pooling_layer_debug ){
			console.log("Z:", Z);
			console.log("A:", A);
		}
	
		return { A: A, Z: Z};
	};
	
	MaxPoolingLayer.prototype.backward_propagation = function( D, ZP , Z, previous_layer_activation_f_derivative){
		var M = D.length;	
		if( ml.max_pooling_layer_debug ){
			console.log("backward_propagation");
			console.log("D:", D);
			console.log("ZP:", ZP);
			console.log("Z:", Z);
		}
	
	
		// D is M x OZ*OR*OC
		D = this.roll_matrix(D, [M, this.OZ, this.OR, this.OC]);
		// D is M x OZ x OR x OC
		// ZP is M x OZ*OR*OC
		ZP = this.roll_matrix(ZP, [M, this.OZ, this.OR, this.OC]);
		// ZP is M x OZ x OR x OC
		// Z is M x IZ*IR*IC
		Z = this.roll_matrix(Z, [M, this.IZ, this.IR, this.IC]);
		// Z is M x IZ x IR x IC
	
		var m;
		var iz, ir, ic, wr, wc, oz, or, oc;
		var column_offset, row_offset;
		var index_max, current_index;
	
		var DM = new Array(M);
		// for each input set
		for(m=0;m<M;m++){
			DM[m] = new Array(this.IZ);
			for(iz=0;iz<this.IZ;iz++){
				DM[m][iz] = new Array(this.IR);
				for(ir=0;ir<this.IR;ir++)
					DM[m][iz][ir] = new Array(this.IC).fill(0);
			}
	
	
			// for each input feature map
			for(iz=0;iz<this.IZ;iz++){
				oz = iz;
				// for each input window row
				for(wr=0;wr<this.WR;wr++){
					// for each input window column
					for(wc=0;wc<this.WC;wc++){
						// for each output row
						for(or=0;or<this.OR;or++){
							row_offset = or * this.WR;
							// for each output column
							for(oc=0;oc<this.OC;oc++){
								column_offset = oc * this.WC;
								// computing selected unit during forward propagation
								// index_max = ZP[m][oz][or][oc].indexOf( Math.max.apply( Math, ZP[m][oz][or][oc]));
								index_max = ZP[m][oz][or][oc];
								current_index = wc + wr * this.WR;
	
								if( index_max === current_index )
									DM[m][iz][row_offset+wr][column_offset+wc] = D[m][oz][or][oc] ;
								else
									DM[m][iz][row_offset+wr][column_offset+wc] = 0;
							}
						}
					}
				}
			}
	
			if( previous_layer_activation_f_derivative ){
				for(iz=0;iz<this.IZ;iz++){
					for(ir=0;ir<this.IR;ir++){
						for(ic=1;ic<this.IC;ic++){
							// DM[m][iz][ir][ic] *= this.activation_f_derivative( Z[m][iz][ir][ic] );
							DM[m][iz][ir][ic] *= previous_layer_activation_f_derivative( Z[m][iz][ir][ic] );
						}
					}
				}
			}
		}
	
	
		// DM is M x IZ*IR*IC
		DM = this.unroll_matrix(DM, [M, this.IZ, this.IR, this.IC]);
		// DM is M x IZ x IR x IC
	
		if( ml.max_pooling_layer_debug ){
			console.log("DM:", DM);
		}
	
		return DM;
	};
	
	
	
	MaxPoolingLayer.prototype.unroll_matrix = function( matrix, sizes ){
		// matrix is sizes[0] x sizes[1] x sizes[2] * sizes[3]
	
		var unrolled_matrix = new Array( sizes[0] );
		var index = 0;
	
		for(var s0=0;s0<sizes[0];s0++){
			unrolled_matrix[s0] = new Array( sizes[1] * sizes[2] * sizes[3] );
			for(var s1=0;s1<sizes[1];s1++){
				for(var s2=0;s2<sizes[2];s2++){
					for(var s3=0;s3<sizes[3];s3++){
						unrolled_matrix[s0][index] = matrix[s0][s1][s2][s3];
						index++;
					}
				}
			}
			index = 0;
		}
	
		// unrolled_matrix is size[0] x sizes[1]*sizes[2]*sizes[3]
		return unrolled_matrix;
	};
	MaxPoolingLayer.prototype.roll_matrix = function( unrolled_matrix, sizes ){
		// unrolled_matrix is size[0] x sizes[1]*sizes[2]*sizes[3]
	
		var rolled_matrix = new Array( sizes[0] );
		var index = 0;
	
		for(var s0=0;s0<sizes[0];s0++){
			rolled_matrix[s0] = new Array( sizes[1]  );
			for(var s1=0;s1<sizes[1];s1++){
				rolled_matrix[s0][s1] = new Array( sizes[2]  );
				for(var s2=0;s2<sizes[2];s2++){
					rolled_matrix[s0][s1][s2] = unrolled_matrix[s0].slice(index, index+sizes[3]);
					index +=sizes[3];
				}
			}
			index = 0;
		}
	
		// rolled_matrix is sizes[0] x sizes[1] x sizes[2] * sizes[3]
		return rolled_matrix;
	};

	// number : cost_f( hypothesis: [[]], Y: [[]] )
	
	ml.NeuralNetwork = NeuralNetwork;
	ml.neural_network_debug = false;
	
	function NeuralNetwork( cost_f, cost_f_derivative){
		this.cost_f = cost_f; 
		this.cost_f_derivative = cost_f_derivative;
		this.layers = [];
		this.layer_count = 0;
	}
	NeuralNetwork.prototype.add_layer = function( layer ){
		this.layers[this.layer_count] = layer;
		this.layer_count++;
	};
	NeuralNetwork.prototype.predict = function( x ){
		var Y = this.forward_propagation( [x] ).A[this.layer_count];
	
		return Y[0];
	};
	NeuralNetwork.prototype.compute_cost = function( X, Y, lambda){
		// X contains the input data, MxI
		// Y contains the output data, MxO
	
	
		var d,l;
		var r;
	
		var J; // will contain the cost
		var grad; // will contain the gradients LxOxI
	
		var H; // will contain the hypothesis for each example, MxO
		var A = new Array(this.layer_count+1); // will contain the activation value of each unit for each example, L+1xMxO
		var Z = new Array(this.layer_count); // will contain the afines value of each unit for each example, LxMxO
		var D = new Array(this.layer_count); // will contain the propagated error for each unit for each example LxMxO
	
		r = this.forward_propagation( X );
		A = r.A;
		Z = r.Z;
	
		H = A[this.layer_count];
	
		r = this.backward_propagation( A, Z, Y);
		D = r.D;
	
	
		// computes cost
		J = this.cost_f( H, Y );
		if( ml.neural_network_debug ){
			console.log("cost function");
			console.log("J:", J);
		}
	
		// computes gradients
		grad = this.compute_gradient(D, A);
	
		return this.regularize(J, grad, lambda, X.length);
	};
	NeuralNetwork.prototype.compute_gradient = function(D, A){
		var L = this.layer_count;
		var l;
	
		var grad = new Array(L);
		for(l=0;l<L;l++){
			// pooling layers don't have gradients
			if( this.layers[l].has_weights )
				grad[l] = this.layers[l].compute_gradient( D[l], A[l] );
		}
	
		return grad;
	};
	NeuralNetwork.prototype.check_gradient = function(X, Y, epsilon){
		var L = this.layer_count;
		var l,w,weight;
		var grad, cost_m, cost_p, num_grad;
	
		grad = this.compute_cost(X, Y, 0).grad;
	
		// for each weights of the network
		for(l=0;l<L;l++){
			if( this.layers[l].has_weights){
				for(w=0;w<this.layers[l].weight_count;w++){
					weight = this.layers[l].get_weight(this.layers[l].weights, w);
					
					this.layers[l].set_weight(this.layers[l].weights, w, weight-epsilon);
					cost_m = this.compute_cost( X, Y, 0).J;
	
					this.layers[l].set_weight(this.layers[l].weights,w, weight+epsilon);
					cost_p = this.compute_cost( X, Y, 0).J;
	
					this.layers[l].set_weight(this.layers[l].weights,w, weight);
	
					num_grad = (cost_p - cost_m) / ( 2* epsilon );
	
					real_grad = grad[l][w];
	
					// console.log( "real_grad:", real_grad, "num_grad:", num_grad);
					if (  
						!(real_grad === num_grad && num_grad === 0) &&
						// Math.abs(real_grad - num_grad) / (Math.abs(real_grad) + Math.abs(num_grad)) > 2* epsilon
						Math.abs(real_grad - num_grad)  > 2* epsilon
					){
						console.log( "l:", l, "w:", w, "real_grad:", real_grad, "num_grad:", num_grad);
						// return false;
					}
				}
			}
		}
		return true;
	};
	NeuralNetwork.prototype.regularize = function(J, grad, lambda, M){
		var l,w,weight,grad_r;
		var L = this.layers.length;
	
	
		var r = {J: J, grad: grad};
		var r2;
	
		// regularization
		if( lambda !== 0 ){
			var J_reg = 0;
			for(l=0;l<L;l++){
				if( this.layers[l].has_weights){
					for(w=0;w<this.layers[l].weight_count;w++){
						if( !this.layers[l].is_weight_bias(w) ){
							weight = this.layers[l].get_weight(this.layers[l].weights, w);
	
							J_reg += weight*weight;
	
							// grad_r = this.layers[l].get_weight(grad[l], w) + (lambda * weight / M);
							// this.layers[l].set_weight(grad[l], w, grad_r);
							grad[l][w] = grad[l][w] + (lambda * weight / M);
						}
					}
				}
			}
	
			r.J += lambda * J_reg / (2*M);
		}
	
		return r;
	};
	NeuralNetwork.prototype.forward_propagation = function( X ){
		var L = this.layer_count;
		var Z = new Array(L);
		var A = new Array(L+1);
		var l,r;
	
	
		A[0] = X;
	
	
		for(l=0;l<L;l++){
			r = this.layers[l].forward_propagation( A[l] );
	
			Z[l] = r.Z;
			A[l+1] = r.A;
		}
	
		// console.log("x", x, "a", a);
		return { A: A, Z: Z };
	};
	NeuralNetwork.prototype.backward_propagation = function( A, Z, Y){
		var L = this.layer_count;
		var l,r;
	
		D = new Array(L);
		
		for(l=L-1;l>=0;l--){ // we dont propagate error for the input units
			if( l === L-1){ // for the last layer we have to compute d direcly with y
				// D[l] = this.layers[l].last_layer_gradient_compute( A[l+1], Z[l], Y);
				D[l] = this.cost_f_derivative( A[l+1], Y, Z[l], this.layers[l].activation_f_derivative);
				if( ml.neural_network_debug ){
					console.log("backward_propagation last layer");
					console.log("A:", A[l+1]);
					console.log("Y:", Y);
					console.log("Z:", Z[l]);
					console.log("D:", D[l]);
				}
			}
			else
				// we compute d[l] according to d[l+1] and z[l], Z[l+1] is used for pooling layers only
				D[l] = this.layers[l+1].backward_propagation(D[l+1], Z[l+1], Z[l], this.layers[l].activation_f_derivative );
		}
	
		return { D: D };
	};
	NeuralNetwork.prototype.weights_update = function( gradients, alpha ){
		var L = this.layer_count;
		var l;
	
		for(l=0;l<L;l++){
			if( this.layers[l].has_weights )
				this.layers[l].weights_update( gradients[l], alpha);
		}
	};
	

	
	ml.GradientDescent = GradientDescent;
	
	
	function GradientDescent( config ){
		this.config = {};
	
		this.config.learning_rate = 				config.learning_rate || 					0;
		this.config.stop_criteria = 				config.stop_criteria || 					0.001;
		this.config.min_iter = 						config.min_iter || 							100;
		this.config.max_iter = 						config.max_iter || 							1000;
		this.config.regularization_parameter = 		config.regularization_parameter || 			0;
		this.config.gradient_check_parameter = 		config.gradient_check_parameter || 			0.0001;
	
	
		this.config.feature_scalling = 				config.feature_scalling !== undefined 	? config.feature_scalling 	: false;
	
		// aliases
		this.config.alpha = 						this.config.learning_rate;
		this.config.lambda =						this.config.regularization_parameter;
		this.config.epsilon =						this.config.gradient_check_parameter;
	
	}
	
	GradientDescent.prototype.init_gradient_descent_ctx = function(){
		return {
			J: [], // will contain history of J
			iter_count: 0,
	
			// true if a divergence has been detected during a full gradient descent (does not apply for stochastic and mini-batched gradient descent)
			divergence: false,
			error: false,
			message: "",
	
			execution_time: 0 
		};
	};
	GradientDescent.prototype.perform_gradient_descent = function(X, Y, caller, cost_f_name, parameters_update_f_name){
	
		var start_time = new Date().getTime();
	
		var r = this.init_gradient_descent_ctx();
	
		// scale X values if asked
		if( this.config.feature_scalling ){
			r = NN.ml_utils.feature_scalling( X );
			X = r.matrix;
			r.feature_scalling_parameters = r.feature_scalling_parameters;
		}
	
	
		// we need to compare two gradient together to determine if the program must stop
		// so we need to precompute 2 iterations before starting the loop
		var previous_cost = this.gradient_step(X, Y, this.config.alpha, this.config.lambda, caller, cost_f_name, parameters_update_f_name);
		r.J.push(previous_cost);
		r.iter_count++;
		var current_cost = this.gradient_step(X, Y, this.config.alpha, this.config.lambda, caller, cost_f_name, parameters_update_f_name);
		r.J.push(current_cost);
		r.iter_count++;
	
	
	
		while( 
			(Math.abs(previous_cost-current_cost) > this.config.stop_criteria || 
				r.iter_count < this.config.min_iter) && 
			r.iter_count < this.config.max_iter 
		){
			if( previous_cost-current_cost < 0 ){
				r.divergence = true;
				break;
			}
			previous_cost = current_cost;
	
			current_cost = this.gradient_step(X, Y, this.config.alpha, this.config.lambda, caller, cost_f_name, parameters_update_f_name);
			r.J.push(current_cost);
			r.iter_count++;
		}
	
	
		var stop_time = new Date().getTime();
		r.execution_time = stop_time - start_time;
	
		return r;
	};
	
	
	GradientDescent.prototype.batched_gradient_descent = function( gradient_descent_ctx, X, Y, caller, cost_f_name, parameters_update_f_name){
	
		var start_time = new Date().getTime();
	
		var r = gradient_descent_ctx || this.init_gradient_descent_ctx();
	
		var cost = this.gradient_step(X, Y, this.config.alpha, this.config.lambda, caller, cost_f_name, parameters_update_f_name);
		r.J.push(cost);
		r.iter_count++;
	
	
		var stop_time = new Date().getTime();
		r.execution_time += stop_time - start_time;
	
		return r;
	};
	
	
	GradientDescent.prototype.gradient_step = function (X, Y, alpha, lambda, caller, cost_f_name, parameters_update_f_name){
		// compute cost and gradient with current value of theta and substracts the gradient to theta
		var cost = caller[cost_f_name](X, Y, lambda);
	
		// updates theta with the computed gradient
		caller[parameters_update_f_name](cost.grad, alpha);
	
		return cost.J;
	};

	if( typeof module !== 'undefined' && module.exports ){
		module.exports = ml;
	}
	
	return ml;
})();