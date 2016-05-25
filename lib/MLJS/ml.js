/*! ml 1.2.0 2016-05-25 */
var ml = (function(){ 
	var ml = {};


	var utils = (function(){
	
		return {
			// test: test
		};
	
		// function test(){
		// 	var assert = require("assert");
	
		// }
	
	})();
	ml.utils = utils;

	var math_utils = (function(){
	
		return {
			sigmoid: sigmoid,
			sigmoid_gradient:sigmoid_gradient,
			log: log,
			test:test
		};
	
	
		function sigmoid(x){
			return 1/( 1 + Math.exp(-x));
		}
		function sigmoid_gradient(x){
			var g = sigmoid(x);
			return g * (1-g);
		}
	
	
		function log(x) {
			// return Math.log(x) / Math.log(10);
			var r= Math.log(x);
			if( r === -Infinity )
				r = -Number.MAX_VALUE;
			return r;
		}
	
	
		function test(){
	
		}
	
	})();
	ml.math_utils = math_utils;

	var array_utils = (function(){
	
		return {
			array_shuffle: array_shuffle,
			test: test
		};
	
	
		function array_shuffle( array, no_copy ){
			if( !no_copy )
				array = array_copy(array);
			var length = array.length;
	
			var r;
			var tmp;
	
			while(length){
				r = Math.random() * length | 0 ;
				length--;
				tmp = array[length];
				array[length] = array[r];
				array[r] = tmp;
			}
	
			return array;
		}
	
		function test(){
	
		}
	
	})();
	ml.array_utils = array_utils;

	var multi_array_utils = (function(){
	
		return {
			multi_array_copy: multi_array_copy,
			multi_array_random_init: multi_array_random_init,
			// test: test
		};
	
		function multi_array_copy(array){
			if( array === undefined )
				return array;	
	
			var I = array.length;
	
			if( I === undefined )
				return array;
	
			var r_array = new Array(I); 
			for(var i=0;i<I;i++){
				if( array[i].length !== undefined )
					r_array[i] = multi_array_copy( array[i] );
				else
					r_array[i] = array[i];
			}
	
			return r_array;
	
		}
	
		function multi_array_random_init(array, no_copy){
			if( !no_copy )
				array = multi_array_copy( array );
	
			var to_read = [];
			if( array.length !== undefined )
				to_read.push(array);
	
			var el,i,l;
			while(to_read.length > 0){
				el = to_read.pop();
				l = el.length;
				for(i=0;i<l;i++){
					if( el[i].length !== undefined )
						to_read.push(el[i]);
					else
						el[i] = Math.random();
				}
			}
	
			return array;
		}
	
	
	
	
	
		// function test(){
		// 	var assert = require("assert");
			
	
		// 	var array = [[[0,0],[0,0]],[[0,0],[0,0]]];
		// 	array = multi_array_random_init(array, true);
		// 	assert( array[0][0][0] !== 0 );
		// 	assert( array[0][0][1] !== 0 );
		// 	assert( array[0][1][0] !== 0 );
		// 	assert( array[0][1][1] !== 0 );
		// 	assert( array[1][0][0] !== 0 );
		// 	assert( array[1][0][1] !== 0 );
		// 	assert( array[1][1][0] !== 0 );
		// 	assert( array[1][1][1] !== 0 );
	
	
	
	
		// 	var array2 = multi_array_copy(array);
		// 	assert( array[0][0][0] === array2[0][0][0] );
		// 	assert( array[0][0][1] === array2[0][0][1] );
		// 	assert( array[0][1][0] === array2[0][1][0] );
		// 	assert( array[0][1][1] === array2[0][1][1] );
		// 	assert( array[1][0][0] === array2[1][0][0] );
		// 	assert( array[1][0][1] === array2[1][0][1] );
		// 	assert( array[1][1][0] === array2[1][1][0] );
		// 	assert( array[1][1][1] === array2[1][1][1] );
		// }
	
	})();
	ml.multi_array_utils = multi_array_utils;

	var matrix_utils = (function(){
	
		return {
			matrix_size: matrix_size,
			matrix_array_size: matrix_array_size,
			matrix_sum: matrix_sum,
			matrix_equals: matrix_equals,
			matrix_copy: matrix_copy,
			matrix_sigmoid: matrix_sigmoid,
			unroll_matrix_array: unroll_matrix_array,
			reroll_matrix_array: reroll_matrix_array,
			matrix_slice: matrix_slice,
			// test:test
		};
	
		function matrix_size(matrix){
			var R,C;
	
			R = matrix.length;
			C = 0;
			if ( R > 0)
				C = matrix[0].length;
	
			return [R,C];
		}
		function matrix_array_size(matrix_array){
			var sizes = new Array(matrix_array.length);
			for(var i=0;i<matrix_array.length;i++)
				sizes[i] = matrix_size(matrix_array[i]);
	
			return sizes;
		}
	
		function matrix_sum(matrix, dim){
			var m_size = matrix_size(matrix);
			var R = m_size[0];
			var C = m_size[1];
	
			if( !dim ){
				// by default sum columns
				dim = 0;
				// if only one column, default is sum by row
				if ( C === 1 )
					dim = 1;
			}
	
			var summed_matrix;
			var r,c;
	
			// sum column
			if( dim === 0 ){
				summed_matrix = new Array(C).fill(0);
				for(c=0;c<C;c++)
					for(r=0;r<R;r++)
						summed_matrix[c] += matrix[r][c];
			}
			// sum rows
			else {
				summed_matrix = new Array(R).fill(0);
				for(r=0;r<R;r++)
					for(c=0;c<C;c++)
						summed_matrix[r] += matrix[r][c];
			}
	
			return summed_matrix;
		}
	
		function matrix_equals(m1, m2){
			var s1 = matrix_size(m1);
			var s2 = matrix_size(m2);
			if( s1[0] !== s2[0] || s1[1] !== s2[1] )
				return false;
	
			var r,c;
			for(r=0;r<s1[0];r++)
				for(c=0;c<s1[1];c++)
					if( m1[r][c] !== m2[r][c] )
						return false;
			return true;
		}
	
		function matrix_copy(matrix){
			var r;
			var R = matrix.length;
			if( R === undefined || R === 0 )
				return matrix;
	
			var copy = new Array(R);
	
	
			if( Array.isArray(matrix[0]) )
				for(r=0;r<R;r++)
					copy[r] = matrix[r].slice();
			else
				for(r=0;r<R;r++)
					copy[r] = matrix[r];
	
			
			return copy;
		}
	
	
		
	
		function matrix_sigmoid(matrix, no_copy){
			if( !no_copy )
				matrix = matrix_copy(matrix);
			var m_size = matrix_size(matrix);
			var R = m_size[0];
			var C = m_size[1];
			var r,c;
	
	
			for(r=0;r<R;r++){
				for(c=0;c<C;c++){
					matrix[r][c] = math_utils.sigmoid(matrix[r][c]);
				}
			}
	
			return matrix;
		}
	
		function unroll_matrix_array(matrix){
			var i,j,k;
			var unrolled_matrix = [];
	
			for(i=0;i<matrix.length;i++){
				for(j=0;j<matrix[i].length;j++){
					for(k=0;k<matrix[i][j].length;k++){
						unrolled_matrix.push( matrix[i][j][k] );
					}
				}
			}
	
			return unrolled_matrix;
		}
		function reroll_matrix_array( unrolled_matrix, sizes ){
			var matrix;
			var l,L,r,R,c,C,i;
	
			L = sizes.length;
			i=0;
	
			matrix = new Array(L);
			for(l=0;l<L;l++){
				R = sizes[l][0];
				C = sizes[l][1];
	
				matrix[l] = new Array(R);
				for(r=0;r<R;r++){
					matrix[l][r] = new Array(C);
					for(c=0;c<C;c++){
						matrix[l][r][c] = unrolled_matrix[i];
						i++;
					}
				}
			}
	
			return matrix;
		}
	
		function matrix_slice( matrix, begin, end ){
			begin = begin || 0;
			end = end || matrix.length;
	
			var i;
			var I = end-begin;
			var r_matrix = new Array(I);
			for(i=0;i<I;i++){
				r_matrix[i] = matrix[begin+i].slice();
			}
	
			return r_matrix;
		}
	
	
	
	
	
		// function test(){
		// 	var i,j,k;
		// 	var assert = require("assert");
	
		// 	var matrix = [
		// 		[
		// 			[1,2],
		// 			[1,2]
		// 		],
		// 		[
		// 			[1,2,3],
		// 			[1,2,3],
		// 			[1,2,3]
		// 		],
		// 	];
		// 	var sizes = [
		// 		[2,2],
		// 		[3,3]
		// 	];
		// 	var unrolled_matrix = unroll_matrix_array(matrix);
		// 	var rerolled_matrix = reroll_matrix_array(unrolled_matrix, sizes);
	
		// 	for(i=0;i<matrix.length;i++){
		// 		for(j=0;j<matrix[i].length;j++){
		// 			for(k=0;k<matrix[i][j].length;k++){
		// 				assert( matrix[i][j][k] === rerolled_matrix[i][j][k]);
		// 			}
		// 		}
		// 	}
	
		// 	var matrix_sizes = matrix_array_size(matrix);
		// 	for(i=0;i<sizes.length;i++){
		// 		assert( sizes[i][0] === matrix_sizes[i][0]);
		// 		assert( sizes[i][1] === matrix_sizes[i][1]);
		// 	}
	
		// 	assert( matrix_equals(matrix, matrix) );
	
	
		// 	matrix = [
		// 		[1,2],
		// 		[3,4],
		// 		[5,6]
		// 	];
		// 	matrix2 = matrix_slice(matrix);
		// 	assert( matrix_equals(matrix,matrix2));
	
		// 	var matrix3 = [
		// 		[3,4],
		// 		[5,6]
		// 	];
		// 	matrix2 = matrix_slice(matrix, 1 );
		// 	assert( matrix_equals(matrix3,matrix2));
	
		// 	matrix3 = [
		// 		[3,4]
		// 	];
		// 	matrix2 = matrix_slice(matrix, 1, 2 );
		// 	assert( matrix_equals(matrix3,matrix2) );
	
		// }
	
	})();
	ml.matrix_utils = matrix_utils;

	var ml_utils = (function(){
	
		return {
			add_bias_feature: add_bias_feature,
			feature_polynomial_combine: feature_polynomial_combine,
			feature_scalling: feature_scalling,
			scale_features: scale_features,
			compute_stats: compute_stats,
			data_shuffle: data_shuffle,
			nn_theta_create: nn_theta_create,
			nn_theta_random_init: nn_theta_random_init,
			// test: test
		};
	
	
		function add_bias_feature(matrix, no_copy){
			if( ! no_copy )
				matrix = matrix_utils.matrix_copy(matrix);
	
			var I = matrix.length;
			for( var i=0;i<I;i++)
				matrix[i].unshift(1);
	
			return matrix;
		}
	
	
	
		function feature_polynomial_combine(matrix, D, no_copy){
			if( ! no_copy )
				matrix = matrix_utils.matrix_copy(matrix);
			var m_size = matrix_utils.matrix_size(matrix);
			var R = m_size[0];
			var C = m_size[1];
	
			var r,c,d;
			for(r=0;r<R;r++){
				for(c=0;c<C;c++){
					for(d=2;d<D+1;d++){ 
						matrix[r].push( Math.pow( matrix[r][c] , d) );
					}
				}
			}
	
			return matrix;
		}
	
	
	
		function feature_scalling(matrix, no_copy){
			if( ! no_copy )
				matrix = matrix_utils.matrix_copy(matrix);
			var m_size = matrix_size(matrix);
			var R = m_size[0];
			var C = m_size[1];
	
	
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
	
			for (r=0;r<R;r++)
				for(c=0;c<C;c++)
					matrix[r][c] = (matrix[r][c] - mean[c]) / std[c];
	
			return {
				matrix: matrix,
				feature_scalling_parameters: {
					mean:mean,
					std:std
				}
			};
		}
		function scale_features(matrix, mean, std, no_copy){
			if( !no_copy )
				matrix = matrix_utils.matrix_copy(matrix);
			var m_size = matrix_size(matrix);
			var R = m_size[0];
			var C = m_size[1];
	
	
			for (r=0;r<R;r++)
				for(c=0;c<C;c++)
					matrix[r][c] = (matrix[r][c] - mean[c]) / std[c];
	
			return matrix;
		}
	
	
	
		function compute_stats( TP, FP, TN, FN ){
			var accuracy, precision, recall, f1_score;
	
			accuracy = (TP + TN) / (TP+FP+TN+FN);
			precision = TP / (TP+FP);
			recall = TP / (TP+FN);
			f1_score = 2 * precision * recall / ( precision + recall );
	
			return {
				TP: TP,
				FP: FP,
				TN: TN,
				FN: FN,
				accuracy: accuracy,
				precision: precision,
				recall: recall,
				f1_score: f1_score
			};
		}
	
		function data_shuffle( matrix_x, matrix_y, no_copy){
			if( !no_copy ){
				matrix_x = matrix_utils.matrix_copy(matrix_x);
				matrix_y = matrix_utils.matrix_copy(matrix_y);
			}
	
			var length = matrix_x.length;
	
			var r;
			var tmp;
	
			while(length){
				r = Math.random() * length | 0;
				length--;
	
				tmp = matrix_x[length];
				matrix_x[length] = matrix_x[r];
				matrix_x[r] = tmp;
	
				tmp = matrix_y[length];
				matrix_y[length] = matrix_y[r];
				matrix_y[r] = tmp;
			}
	
			return {X: matrix_x, y: matrix_y};
	
		}
	
	
		function nn_theta_create( units_per_layer ){
			var l,L,r,R,c,C;
			var theta;
	
			L = units_per_layer.length;
			theta = new Array(L-1);
	
			for(l=0;l<L-1;l++){
				R = units_per_layer[l+1];
				theta[l] = new Array( units_per_layer[l+1] );
				for(r=0;r<R;r++){
					C = units_per_layer[l]+1;
					theta[l][r] = new Array(C).fill(0);
				}
			}
			
			return theta;
		}
		function nn_theta_random_init( theta, min, max, no_copy){
			if( !no_copy ){
				theta = multi_array_utils.multi_array_copy(theta);
			}
	
			min = min || 0;
			max = max || 1;
			extents = max-min;
	
			var l,L,r,R,c,C;
			L = theta.length;
			for(l=0;l<L;l++){
				R = theta[l].length;
				for(r=0;r<R;r++){
					C = theta[l][r].length;
					for(c=0;c<C;c++)
						theta[l][r][c] = Math.random()*extents + min;	
				}
			}
	
			return theta;
		}
	
	
		// function test(){
		// 	var assert = require("assert");
	
		// 	var matrix = [
		// 		[1,2],
		// 		[2,3],
		// 		[3,4]
		// 	];
		// 	var d_matrix1 = [
		// 		[1,2,1,1,4,8],
		// 		[2,3,4,8,9,27],
		// 		[3,4,9,27,16,64]
		// 	];
		// 	var d_matrix2 = feature_polynomial_combine(matrix, 3);
		// 	assert(matrix_utils.matrix_equals(d_matrix1, d_matrix2));
		// }
	
	})();
	ml.ml_utils = ml_utils;

	
	function init_config( config ){
		/* waited structure:
		config = {
			learning_rate: float or undefined,
			stop_criteria: float or undefined,
			min_iter: integer or undefined,
			max_iter: integer or undefined,
			regularization_parameter: float or undefined,
			gradient_check_parameter: float or undefined,
	
			hypothesis_function: function,
			cost_function: function,
			test_function: function,	
	
			feature_scalling: boolean or undefined,
			gradient_check: boolean or undefined,
			perform_test: boolean or undefined,
	
			add_bias: boolean or undefined,
		}
		*/
		config = config || {};  // config is at least an empty object
		var r_config = {}; // the return config
	
	
		// copy the config parameter if defined, set the default value else
		r_config.learning_rate = 				config.learning_rate || 					0;
		r_config.stop_criteria = 				config.stop_criteria || 					0.001;
		r_config.min_iter = 					config.min_iter || 							100;
		r_config.max_iter = 					config.max_iter || 							1000;
		r_config.regularization_parameter = 	config.regularization_parameter || 			0;
		r_config.gradient_check_parameter = 	config.gradient_check_parameter || 			0.0001;
	
		r_config.hypothesis_function = 			config.hypothesis_function;
		r_config.cost_function = 				config.cost_function;
		r_config.test_function = 				config.test_function;
	
	
		r_config.feature_scalling = config.feature_scalling;
		if( config.feature_scalling === undefined ) 
			r_config.feature_scalling = false;
		r_config.gradient_check = config.gradient_check;
		if( config.gradient_check === undefined ) 
			r_config.gradient_check = false;
		r_config.perform_test = config.perform_test;
		if( config.perform_test === undefined ) 
			r_config.perform_test = false;
	
	
		r_config.add_bias = config.add_bias;
		if( config.add_bias === undefined ) 
			r_config.add_bias = true;
	
		// aliases
		r_config.alpha = 					r_config.learning_rate;
		r_config.lambda =					r_config.regularization_parameter;
		r_config.epsilon =					r_config.gradient_check_parameter;
	
		return r_config;
	}
	
	function GradientDescentRegressionContext(X, y, theta, config){
		var r;
		this.config = init_config(config);
	
		this.training_size = X.length;
		this.feature_count = theta.length;
	
		// aliases
		this.M = 								this.training_size;
		this.M_test = 							undefined;
		this.N = 								this.feature_count;
	
	
		// copying X
		this.X = matrix_utils.matrix_copy(X); 
		this.X_test = undefined;
	
	
		// scale X values if asked
		if( this.config.feature_scalling ){
			r = ml_utils.feature_scalling(this.X, true);
			this.X = r.matrix;
			this.feature_scalling_parameters = r.feature_scalling_parameters;
		}
	
		// adding bias feature
		if( this.config.add_bias )
			this.X = ml_utils.add_bias_feature(this.X, true);
	
		// copying y and theta
		// if logistic regression, y and theta are arrays, if is neural network, y and theta are bidimensional arrays
		this.y = multi_array_utils.multi_array_copy(y);
		this.y_test = undefined;
		this.theta = multi_array_utils.multi_array_copy(theta);
	
	
		// shuffle the data
		r = ml_utils.data_shuffle( this.X, this.y, true );
		this.X = r.X;
		this.y = r.y;
	
		// if the parameters are going to be tested, shuffle the training set  (X and y rows)
		if( this.config.perform_test ){
			// The test set will be equal to 30% of the given set
			this.M_test = Math.round(0.3*this.M);
			this.M = this.M - this.M_test;
	
			// separate the sets accordingly
			this.X_test = matrix_utils.matrix_slice( this.X, this.M);
			this.X = matrix_utils.matrix_slice(this.X, 0, this.M);
	
			if( Array.isArray(y[0]) ){
				this.y_test = matrix_utils.matrix_slice( this.y, this.M);
				this.y = matrix_utils.matrix_slice(this.y, 0, this.M);
			}
			else{
				this.y_test =  this.y.slice( this.M);
				this.y = this.y.slice( 0, this.M);
			}
	
		}
	
		// will contain history of J
		this.J = [];
		this.iter_count = 0;
	
	
		// true if a divergence has been detected during a classic gradient descent (does not apply for stochastic and mini-batched gradient descent)
		this.divergence = false;
		// true if an error has happened
		this.error = false;
		// contains a message describing the error
		this.message = "";
	
		// time in millisecond for gradient descent
		this.execution_time = 0;
	
	
	
	}
	
	
	
	
	/*
	 *
	 */
	GradientDescentRegressionContext.prototype.predict = function (x){
		x = x.slice();
		x.unshift(1);
		
		return this.config.hypothesis_function(x, this.theta);
	};
	
	
	
	/*
	 * gradient_descent
	 * NOT FUNCTIONAL PURE
	 * modifies
	 * 		this.error
	 *		this.message
	 *		this.config.learning_rate
	 *		this.config.alpha
	 *		this.J
	 *		this.iter_count
	 * 		this.theta
	 *		this.execution_time
	 */
	GradientDescentRegressionContext.prototype.gradient_descent = function( ){
		var start_time = new Date().getTime();
		var j,n;
	
		// if gradient check option is set, check gradient and return an error if gradient check fails
		if( this.config.gradient_check && !this.check_gradient(this.X, this.y, this.theta, this.config.epsilon, this.config.cost_function) ){
			this.error = true;
			this.message = "Gradient check failed, seems like the algorithm you're trying to use is broken, sorry.";
			return this;
		}
	
		if( this.config.alpha === 0 ){
			this.config.alpha = this.choose_learning_rate(this.X, this.y, this.theta, this.config);
			this.config.learning_rate = this.config.alpha;
		}
	
		// we need to compare two gradient together to determine if the program must stop
		// so we need to precompute 2 iterations before starting the loop
		var previous_cost = this.gradient_step(this.X, this.y);
		var current_cost = this.gradient_step(this.X, this.y);
	
	
		while( (Math.abs(previous_cost-current_cost) > this.config.stop_criteria || this.iter_count < this.config.min_iter) && this.iter_count < this.config.max_iter ){
			if( previous_cost-current_cost < 0 ){
				this.divergence = true;
				break;
			}
			previous_cost = current_cost;
			current_cost = this.gradient_step(this.X, this.y);
		}
	
	
		if( this.config.perform_test ){
			this.test_results = this.config.test_function( this.X_test, this.y_test, this.theta );
		}
	
	
		var stop_time = new Date().getTime();
		this.execution_time = stop_time - start_time;
	};
	
	GradientDescentRegressionContext.prototype.batched_gradient_descent = function( batch_size ){
		var start_time = new Date().getTime();
		var j,n;
	
		// if gradient check option is set, check gradient and return an error if gradient check fails
		if( this.config.gradient_check && !this.check_gradient(this.X, this.y, this.theta, this.config.epsilon, this.config.cost_function) ){
			this.error = true;
			this.message = "Gradient check failed, seems like the algorithm you're trying to use is broken, sorry.";
			return this;
		}
	
		for(var i=0;i<this.M;i=i+batch_size) {
			this.gradient_step( this.X.slice(i, i+batch_size), this.y.slice(i, i+batch_size));
		}
	
	
		if( this.config.perform_test ){
			this.test_results = this.config.test_function( this.X_test, this.y_test, this.theta );
		}
	
	
		var stop_time = new Date().getTime();
		this.execution_time = stop_time - start_time;
	};
	
	
	
	/*
	 * gradient_step
	 * NOT FUNCTIONAL PURE
	 * modifies
	 *		this.J
	 *		this.iter_count
	 * 		this.theta
	 */
	GradientDescentRegressionContext.prototype.gradient_step = function (X, y){
		// compute cost and gradient with current value of theta and substracts the gradient to theta
		var cost = this.config.cost_function(X, y, this.theta, this.config.lambda);
	
		// updates theta with the computed gradient
		for(j=0;j<this.N;j++)
			this.theta[j] -= this.config.alpha * cost.grad[j];
		// historizing J
		this.J.push(cost.J);
		this.iter_count++;
	
		return cost.J;
	};
	
	/*
	 * online_gradient_descent
	 * NOT FUNCTIONAL PURE
	 * modifies
	 *		this.J
	 *		this.iter_count
	 * 		this.theta
	 */
	GradientDescentRegressionContext.prototype.online_gradient_descent = function(x, y){
		x = x.slice();
		x.unshift(1);
		x = [x];
		y = [y];
	
		return this.gradient_step( x, y);
	};
	
	
	/*
	 *
	 */
	GradientDescentRegressionContext.prototype.check_gradient = function (X, y, theta, epsilon, cost_function){
		theta = multi_array_utils.multi_array_copy(theta);
		// here we're going to compute the numerical gradient and compare it with the algorithm's computed gradient
	
	
		// get the initial cost
		var cost = cost_function(X, y, theta, 0);
		var cost_p,cost_m,num_grad;
	
		// for each feature
		for(n=0;n<this.N;n++){
			// add epsilon to feature n
			theta[n] += epsilon;
			// get the cost with this perturbated theta
			cost_p = cost_function(X, y, theta, 0);
			// restore theta and substract epsilon to feature n
			theta[n] -= 2*epsilon;
			// get the cost with this perturbated theta
			cost_m = cost_function(X, y, theta, 0);
			// restore theta
			theta[n] += epsilon;
	
			// compute the numerical gradient of function J on feature n
			num_grad = (cost_p.J - cost_m.J) / ( 2 * epsilon );
	
			// if numerical gradient and real radient aren't close enough, return true
			// console.log(cost.grad[n] , num_grad, Math.abs(cost.grad[n] - num_grad) / (Math.abs(cost.grad[n])+Math.abs(num_grad)), 2* epsilon);
			if( cost.grad[n] === num_grad && num_grad === 0)
				return true;
			return Math.abs(cost.grad[n] - num_grad) / (Math.abs(cost.grad[n])+Math.abs(num_grad)) < 2* epsilon ;
			// return Math.abs(cost.grad[n] - num_grad)  < 2* epsilon ;
		}
	};
	
	
	/*
	 * choose_learning_rate
	 */
	GradientDescentRegressionContext.prototype.choose_learning_rate = function (X, y, theta, config){
		config = init_config(config);
		config.learning_rate = 1;
		config.add_bias = false; // bias has already been added
		config.feature_scalling = false; // features have already been scalled
	
		// creating a new ctx to not pollute this one
		ctx = new GradientDescentRegressionContext(X, y, theta, config);
	
		while( !ctx.divergence){
			config.learning_rate *= 3;
			ctx = new GradientDescentRegressionContext(X, y, theta, config);
			// ctx.max_iter = 25;
			ctx.gradient_descent();
		}
	
		while( ctx.divergence ){
			config.learning_rate /= 3;
			ctx = new GradientDescentRegressionContext(X, y, theta, config);
			// ctx.max_iter = 25;
			ctx.gradient_descent();
		}
	
		return config.learning_rate;
	};

	ml.polynomial_regression = function(X, y, theta, config){
	
		config.hypothesis_function = hypothesis;
		config.cost_function = cost_function;
		var ctx = new GradientDescentRegressionContext(X, y, theta, config);
	
		// ctx.gradient_descent();
	
	
	
		function hypothesis(x, theta){
			var y = 0;
			var N = theta.length;
			var n;
	
			// y = Sum(n=1:N)[ x[n] * theta[n] ]
			for(n=0;n<N;n++)
				y += x[n] * theta[n];
	
			return y;
		}
	
		function cost_function(X, y, theta, lambda){
			var m,n,M,N;
			M = X.length;
			N = theta.length;
			var r = {
				J:0,
				grad: new Array(N).fill(0)
			};
	
			// compute hypothesis vector h(x, theta) and error vector h(x,theta) - y
			// computed here because will be reused
			var h = new Array(M);
			var error_vector = new Array(M);
			for (m=0;m<M;m++){
				h[m] = hypothesis( X[m], theta);
				// h(x,theta) - y
				error_vector[m] = h[m] - y[m];
			}
	
			// J
			// J = (2/M) * Sum(m=1:M)[ (h(X[m], theta) - y[m])² ]
			for(m=0;m<M;m++)
				r.J += error_vector[m] * error_vector[m];
			r.J = r.J / (2*M);
	
			// grad
			for(n=0;n<N;n++){
				// grad[n] = (1/M) * Sum(m=0:M)[ (h(X[m], theta) - y[m]) * X[m][n] ]
				for (m=0;m<M;m++)
					r.grad[n] += error_vector[m]*X[m][n];
				r.grad[n] = r.grad[n]/M;
			}
	
			// regularization
			if( lambda !== 0 ){
				var J_reg = 0;
				for(n=1;n<N;n++){ // starts at 1! 
					// theta[n]²
					J_reg += theta[n] * theta[n];
					// grad[n] += (lambda/M) * theta[n] 
					r.grad[n] += lambda * theta[n] / M;
				}
				// J += lambda * Sum(n=2:N)[ theta[n]² ]
				r.J += lambda * J_reg;
			}
	
	
			return r;
		}
	
		return ctx;
	};
	

	ml.logistic_regression = function(X, y, theta, config){
	
		config.hypothesis_function = hypothesis;
		config.cost_function = cost_function;
		config.test_function = test;
		var ctx = new GradientDescentRegressionContext(X, y, theta, config);
	
		// ctx.gradient_descent();
	
	
		function hypothesis(x, theta){
			var y = 0;
			var N = theta.length;
			var n;
	
			// y = sigmoid( Sum(n=1:N)[ x[n] * theta[n] ] )
			for(n=0;n<N;n++)
				y += x[n] * theta[n];
			y = math_utils.sigmoid(y);
	
			return y;
		}
	
		function cost_function(X, y, theta, lambda){
			var m,n,M,N;
			M = X.length;
			N = theta.length;
			var r = {
				J:0,
				grad: new Array(N).fill(0)
			};
	
			// compute hypothesis vector h(x, theta) and error vector h(x,theta) - y
			// computed here because will be reused
			var h = new Array(M);
			var error_vector = new Array(M);
			for (m=0;m<M;m++){
				h[m] = hypothesis(X[m], theta);
				// h(x,theta) - y
				error_vector[m] = h[m] - y[m];
			}
	
	
			// J
			// J = - (1/M) * Sum(m=1:M)[ y[m] * log( h(Xm,theta) )  + (1-y[m]) * log( 1 - h(X[m],theta) ) ]
			for(m=0;m<M;m++)
				r.J += y[m] * math_utils.log( h[m] ) + (1-y[m]) * math_utils.log( 1-h[m] );
			r.J = -1*r.J / M;
	
			// grad
			for(n=0;n<N;n++){
				// grad[n] = (1/M) * Sum(m=0:M)[ (h(X[m], theta) - y[m]) * X[m][n] ]
				for (m=0;m<M;m++)
					r.grad[n] += error_vector[m]*X[m][n];
				r.grad[n] = r.grad[n]/M;
			}
	
			// regularization
			if( lambda !== 0 ){
				var J_reg = 0;
				for(n=1;n<N;n++){ // starts at 1! 
					// theta[n]²
					J_reg += theta[n] * theta[n];
					// grad[n] += (lambda/M) * theta[n] 
					r.grad[n] += lambda * theta[n] / M;
				}
				// J += (lambda/2M) * Sum(n=2:N)[ theta[n]² ]
				r.J += lambda * J_reg / (2*M);
			}
	
			return r;
		}
	
	
	
		function test(X, y, theta){
			// var cost = cost_function(X, y, theta, M, N, lambda);
			var TP=0,FP=0,TN=0,FN=0;
			var precision, recall, f1_score;
	
			var M = X.length;
			var m;
			var p;
			for(m=0;m<M;m++){
				p = Math.round( hypothesis(X[m], theta) );
				if( y[m] === 1){
					if( p === 1)
						TP++;
					else
						FN++;
				}
				else {
					if( p === 1)
						FP++;
					else
						TN++;
				}
			}
			return ml_utils.compute_stats( TP, FP, TN, FN );
		}
	
		return ctx;
	};
	

	ml.neural_network = function(X, y, theta, config){
	
		var l;
		var L = theta.length + 1;
	
	
		// useful for rerolling theta
		var theta_sizes = matrix_utils.matrix_array_size(theta);
		var unrolled_theta = matrix_utils.unroll_matrix_array(theta);
	
		config.hypothesis_function = hypothesis;
		config.cost_function = cost_function;
		config.test_function = test;
		var ctx = new GradientDescentRegressionContext(X, y, unrolled_theta, config);
	
		// ctx.gradient_descent();
	
		
	
		function hypothesis(x, theta){
			theta = matrix_utils.reroll_matrix_array(theta, theta_sizes);
			var r= forward_propagation(x, theta);
	
			return r.a[ r.a.length-1 ];
		}
	
		function forward_propagation(x, theta){
			var L = theta.length+1;
			var l;
			var n,N,np,Np; // N for number of features of current layer, Np for number of features of next layer
	
			// create tmp container for neurones network
			var a = new Array(L);
			var z = new Array(L-1);
			// first layer is x
			a[0] = x;
			// for each layer except the last one
			for(l=0;l<L-1;l++){
				// if not first layer, add bias unit
				if( l!==0)
					a[l].unshift(1);
	
				// number of rows of theta gives the number of units in the next layer
				Np = theta[l].length;
				// create the units of the next layer
				a[l+1]= new Array(Np);
				z[l] = new Array(Np).fill(0);
				// for each unit of the next layer
				for(np=0;np<Np;np++){
					// get the number of units (features) of the current layer
					N = theta[l][np].length;
					// for each units of current layer
					for(n=0;n<N;n++)
						// multiply with theta that links this units with the next layer unit and add the result to the next layer unit
						z[l][np] += a[l][n] * theta[l][np][n];
					// sigmoid of the next layer unit
					a[l+1][np] = math_utils.sigmoid(z[l][np]);
				}
			}
	
			// last layer is y
			return { a:a,z:z };
		}
		function back_propagation(y, theta, a, z){
			var n,np,l,N,Np,L;
	
			L = theta.length+1;
	
			// propagated error
			var d = new Array(L);
	
			// d[L-1] = a[L-1] - y;
			N = y.length;
			d[L-1] = new Array(N);
			for(n=0;n<N;n++)
				d[L-1][n] = a[L-1][n] - y[n];
	
	
			// for each layer starting from the second last one
			for(l=L-2;l>=0;l--){
				// number of feature of our current layer without the bias unit
				N = a[l].length-1;
	
				// number of feature of the next layer
				Np = d[l+1].length;
				// we want to compute the propagated error for layer l
				d[l] = new Array(N).fill(0);
	
				// we're creating a tmp theta without the bias terms (we remove first column)
				// tmp_theta is NpxN instead of Np x (N+1)
				var tmp_theta = matrix_utils.matrix_copy(theta[l]);
				for(n=0;n<tmp_theta.length;n++)
					tmp_theta[n].shift();
	
				// here we want to compute d[l] = ( theta[l]' * d[l+1] ) .* sigmoid_gradient( z(l-1) )
				// => Nx1 = (NpxN)' * Npx1  .* Nx1
	
				// first we compute theta[l]' * d[l+1]
				for(np=0;np<Np;np++)
					for(n=0;n<N;n++)
						d[l][n] += d[l+1][np] * tmp_theta[np][n];
				
				if( l > 0 ){ // if l equals 0 then there's no z0
					for(n=0;n<N;n++)
						// d[l][n] = d[l][n] * math_utils.sigmoid_gradient( z[l-1][n] );
						d[l][n] = d[l][n]* (a[l][n+1] * (1-a[l][n+1])); // doesn't compute unnecessary exp
				}
			}
	
			return d;
		}
	
	
	
		function cost_function(X, y, theta, lambda){
			var m,n,np,k,l,M,L,N,Np;
			var K = y[0].length;
			M = X.length;
			
			var r = {
				J:0,
				grad: new Array(theta.length).fill(0)
			};
	
			theta = matrix_utils.reroll_matrix_array(theta, theta_sizes);
	
	
			// compute hypothesis vector h(x, theta) and error vector h(x,theta) - y
			// computed here because will be reused
			var a = new Array(M);
			var z = new Array(M);
			var h = new Array(M);
			// var error_vector = new Array(M);
			for (m=0;m<M;m++){
				var fwd_prop_tmp = forward_propagation(X[m], theta);
				a[m] = fwd_prop_tmp.a;
				z[m] = fwd_prop_tmp.z;
				h[m] = a[m][  a[m].length-1  ];
			}
	
	
			// J = (1/M)* sum(sum(( -y .* log(h)  - (1-y).*log(1-h) )));
			for(m=0;m<M;m++)
				for(k=0;k<K;k++)
					r.J += y[m][k] * math_utils.log( h[m][k] ) + (1-y[m][k]) * math_utils.log( 1 - h[m][k]);
			r.J = -1 * r.J / M;
			
	
			// propagated error
			var d = new Array(M);
			for(m=0;m<M;m++){
				d[m] = back_propagation(y[m], theta, a[m], z[m]);
			}
	
	
			// computing the gradient
			L = theta.length+1;
			var grad = new Array(L-1);
			for(l=0;l<L-1;l++){
				Np = theta[l].length;
				grad[l] = new Array(Np);
				for(np=0;np<Np;np++){
					N = theta[l][np].length;
					grad[l][np] = new Array(N).fill(0);
					for(n=0;n<N;n++){
						for(m=0;m<M;m++){
							grad[l][np][n] += d[m][l+1][np] * a[m][l][n];
						}
						grad[l][np][n] = grad[l][np][n] / M;
					}
				}
			}
	
	
	
			// regularization
			if( lambda !== 0 ){
				var J_reg = 0;
	
				for(l=0;l<L-1;l++){
					Np = theta[l].length;
					for(np=0;np<Np;np++){
						N = theta[l][np].length;
						for(n=1;n<N;n++){ // start at 1 because we don't regularize with bias parameters
							// theta[n]²
							J_reg +=  theta[l][np][n] * theta[l][np][n];
							// grad[l][np][n] += (lambda/M) * theta[l][np][n]
							grad[l][np][n] += lambda * theta[l][np][n] / M;
						}
					}
				}
				// J += (lambda/2M) * Sum(n=2:N)[ theta[n]² ]
				r.J += lambda * J_reg / (2*M);
			}
	
			r.grad = matrix_utils.unroll_matrix_array( grad );
	
			return r;
		}
	
		function test(X, y, theta){
			// var cost = cost_function(X, y, theta, M, N, lambda);
			var TP=0,FP=0,TN=0,FN=0;
			var precision, recall, f1_score;
	
			var M = X.length;
			var m,n;
			var p;
			for(m=0;m<M;m++){
				p = hypothesis(X[m], theta) ;
				for(n=0;n<y[m].length;n++){
					p[n] = Math.round( p[n] );
					if( y[m][n] === 1){
						if( p[n] === 1)
							TP++;
						else
							FN++;
					}
					else {
						if( p[n] === 1)
							FP++;
						else
							TN++;
					}
				}
			}
			return ml_utils.compute_stats( TP, FP, TN, FN );
		}
	
		return ctx;
	};

	ml.linear_neural_network = function(X, y, theta, config){
	
		var l;
		var L = theta.length + 1;
	
	
		// useful for rerolling theta
		var theta_sizes = matrix_utils.matrix_array_size(theta);
		var unrolled_theta = matrix_utils.unroll_matrix_array(theta);
	
		config.hypothesis_function = hypothesis;
		config.cost_function = cost_function;
		var ctx = new GradientDescentRegressionContext(X, y, unrolled_theta, config);
	
		// ctx.gradient_descent();
		
	
		function hypothesis(x, theta){
			theta = matrix_utils.reroll_matrix_array(theta, theta_sizes);
			var r= forward_propagation(x, theta);
	
			return r.a[ r.a.length-1 ];
		}
	
		function forward_propagation(x, theta){
			var L = theta.length+1;
			var l;
			var n,N,np,Np; // N for number of features of current layer, Np for number of features of next layer
	
			// create tmp container for neurones network
			var a = new Array(L);
			var z = new Array(L-1);
			// first layer is x
			a[0] = x;
			// for each layer except the last one
			for(l=0;l<L-1;l++){
				// if not first layer, add bias unit
				if( l!==0)
					a[l].unshift(1);
	
				// number of rows of theta gives the number of units in the next layer
				Np = theta[l].length;
				// create the units of the next layer
				a[l+1]= new Array(Np);
				z[l] = new Array(Np).fill(0);
				// for each unit of the next layer
				for(np=0;np<Np;np++){
					// get the number of units (features) of the current layer
					N = theta[l][np].length;
					// for each units of current layer
					for(n=0;n<N;n++)
						// multiply with theta that links this units with the next layer unit and add the result to the next layer unit
						z[l][np] += a[l][n] * theta[l][np][n];
					// sigmoid of the next layer unit
					// a[l+1][np] = math_utils.sigmoid(z[l][np]);
					// max(0,a)
					a[l+1][np] = z[l][np] < 0 ? 0 : z[l][np];
				}
			}
	
			// last layer is y
			return { a:a,z:z };
		}
		function back_propagation(y, theta, a, z){
			var n,np,l,N,Np,L;
	
			L = theta.length+1;
	
			// propagated error
			var d = new Array(L);
	
			// d[L-1] = a[L-1] - y;
			N = y.length;
			d[L-1] = new Array(N);
			for(n=0;n<N;n++){
				// console.log(a[L-1][n], z[L-2][n]);
				d[L-1][n] = (a[L-1][n] - y[n]) * (z[L-2][n] < 0? 0:1);
			}
	
	
			// for each layer starting from the second last one
			for(l=L-2;l>=0;l--){
				// number of feature of our current layer without the bias unit
				N = a[l].length-1;
	
				// number of feature of the next layer
				Np = d[l+1].length;
				// we want to compute the propagated error for layer l
				d[l] = new Array(N).fill(0);
	
				// we're creating a tmp theta without the bias terms (we remove first column)
				// tmp_theta is NpxN instead of Np x (N+1)
				var tmp_theta = matrix_utils.matrix_copy(theta[l]);
				for(n=0;n<tmp_theta.length;n++)
					tmp_theta[n].shift();
	
				// here we want to compute d[l] = ( theta[l]' * d[l+1] ) .* sigmoid_gradient( z(l-1) )
				// => Nx1 = (NpxN)' * Npx1  .* Nx1
	
				// first we compute theta[l]' * d[l+1]
				for(np=0;np<Np;np++)
					for(n=0;n<N;n++)
						d[l][n] += d[l+1][np] * tmp_theta[np][n];
				
				if( l > 0 ){ // if l equals 0 then there's no z0
					for(n=0;n<N;n++){
						// d[l][n] = d[l][n] * math_utils.sigmoid_gradient( z[l-1][n] );
						// d[l][n] = d[l][n]* (a[l][n+1] * (1-a[l][n+1])); // doesn't compute unnecessary exp
	
						d[l][n] = d[l][n] * (z[l-1][n] < 0? 0:1) ;
					}
				}
			}
	
			return d;
		}
	
	
	
		function cost_function(X, y, theta, lambda){
			var m,n,np,k,l,M,L,N,Np;
			var K = y[0].length;
			M = X.length;
			
			var r = {
				J:0,
				grad: new Array(theta.length).fill(0)
			};
	
			theta = matrix_utils.reroll_matrix_array(theta, theta_sizes);
	
	
			// compute hypothesis vector h(x, theta) and error vector h(x,theta) - y
			// computed here because will be reused
			var a = new Array(M);
			var z = new Array(M);
			var h = new Array(M);
			// var error_vector = new Array(M);
			for (m=0;m<M;m++){
				var fwd_prop_tmp = forward_propagation(X[m], theta);
				a[m] = fwd_prop_tmp.a;
				z[m] = fwd_prop_tmp.z;
				h[m] = a[m][  a[m].length-1  ];
			}
	
	
			// J = (1/M)* sum(sum(( -y .* log(h)  - (1-y).*log(1-h) )));
			for(m=0;m<M;m++){
				for(k=0;k<K;k++){
					var error = h[m][k]  - y[m][k];
					r.J +=  error*error ;
				}
			}
			r.J =  r.J / (2* M);
			
	
			// propagated error
			var d = new Array(M);
			for(m=0;m<M;m++){
				d[m] = back_propagation(y[m], theta, a[m], z[m]);
			}
	
	
			// computing the gradient
			L = theta.length+1;
			var grad = new Array(L-1);
			for(l=0;l<L-1;l++){
				Np = theta[l].length;
				grad[l] = new Array(Np);
				for(np=0;np<Np;np++){
					N = theta[l][np].length;
					grad[l][np] = new Array(N).fill(0);
					for(n=0;n<N;n++){
						for(m=0;m<M;m++){
							grad[l][np][n] += d[m][l+1][np] * a[m][l][n];
						}
						grad[l][np][n] = grad[l][np][n] / M;
					}
				}
			}
	
	
	
			// regularization
			if( lambda !== 0 ){
				var J_reg = 0;
	
				for(l=0;l<L-1;l++){
					Np = theta[l].length;
					for(np=0;np<Np;np++){
						N = theta[l][np].length;
						for(n=1;n<N;n++){ // start at 1 because we don't regularize with bias parameters
							// theta[n]²
							J_reg +=  theta[l][np][n] * theta[l][np][n];
							// grad[l][np][n] += (lambda/M) * theta[l][np][n]
							grad[l][np][n] += lambda * theta[l][np][n] / M;
						}
					}
				}
				// J += (lambda/2M) * Sum(n=2:N)[ theta[n]² ]
				r.J += lambda * J_reg / (2*M);
			}
	
			r.grad = matrix_utils.unroll_matrix_array( grad );
	
			return r;
		}
	
	
		return ctx;
	};

	ml.q_learning = function(state_count, goal_states, learning_rate, learning_parameter, exact_result){
		var ctx = {};
	
		ctx.state_count = state_count;
	
		ctx.learning_rate = learning_rate;
		ctx.alpha = learning_rate;
		ctx.learning_parameter = learning_parameter;
		ctx.gamma = learning_parameter;
	
		ctx.exact_result = exact_result;
	
		ctx.R = new Array(state_count);
		ctx.Q = new Array(state_count);
	
		var s,a;
		for(s=0;s<state_count;s++){
			ctx.R[s] = new Array(state_count).fill(-1);
			ctx.Q[s] = new Array(state_count).fill(0);
		}
	
	
		ctx.update = function( state, action ){
			if( this.R[state][action] === -1){
				if( goal_states.indexOf(action) !== -1)
					this.R[state][action] = 100;
				else
					this.R[state][action] = 0;
	
			}
	
			if( !ctx.exact_result ){
				this.Q[state][action] = this.Q[state][action] + 
					ctx.alpha *  ( 
						this.R[state][action] + this.gamma * get_max_reward_of_state(this.R, this.Q, action)
					);
			}
			else{
				this.Q[state][action] =  
					Math.max(
						this.R[state][action] , 
						Math.round( this.gamma * get_max_reward_of_state(this.R, this.Q, action) )
					);
			}
		};
	
		function get_max_reward_of_state(R, Q, state){
			var max = Q[state].reduce(
				function(a,b,i){
					if( a<b) 
						return b;
					else 
						return a;
				}
			);
	
			return max;
		}
	
		ctx.get_action_with_best_reward = function( state){
			var max = get_max_reward_of_state(this.R, this.Q, state);
	
			return this.Q[state].indexOf(max);
		};
		
	
		return ctx;
	};

	if( typeof module !== 'undefined' && module.exports ){
		module.exports = ml;
	}
	
	return ml;
})();