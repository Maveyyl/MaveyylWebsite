var polynomial_regression = (function(){ 
	// m for the X sambles count
	// n number of features

	// iterators
	// i for the X rows
	// j for the features (X columns)


	function run( X, y, options ){
		options = options || {};
		options.alpha = options.alpha || 0.1;
		options.stop_condition = options.stop_condition || 0.001;
		options.max_iter = options.max_iter || 1000;

		var context = {
			X: X,
			X_norm: X,
			y: y,
			options: options,

			theta: [],
			iter_count: 0,
			J: [],
			divergence:false,

			execution_time: 0,
			iteration_time: 0
		};

		var start_time = new Date().getTime();

		// copying X
		var tmp = X.slice(0);
		for(var i=0;i<tmp.length;i++)
			tmp[i] = X[i].slice(0);
		X = tmp;

		// normalize X's data
		if( options.feature_scalling)
			normalize_data(X);
		// we save them into context because we probably want to display them instead of non normalized data 
		context.X_norm = X;

		// add the constant feature to X, basically adding column filled of 1 at the beginning
		for( var i=0;i<X.length;i++){
			X[i].unshift(1);
		}

		// creating theta
		var theta = new Array(X[0].length);
		theta.fill(0);

		var iteration_start_time = new Date().getTime();
		// during our gradient descent we will compare the previous cost and the current cost, so we need to create two temporary variables and initialize one of them
		var previous_cost;
		var current_cost =  cost(X,y,theta);
		// we save the values of the cost measured
		context.J.push(current_cost);

		var i = 1;
		do{
			previous_cost = current_cost ;
			// compute a gradient step!
			theta = gradient_step(X,y,theta, options.alpha);
			current_cost = cost(X,y,theta);
			context.J.push(current_cost);

			i++;

			if( previous_cost-current_cost < 0 ){
				context.divergence = true;
				break;
			}
		// continue until cost difference is smaller than stop_condition or max_iter is reached
		} while( Math.abs(previous_cost-current_cost) > options.stop_condition && i < options.max_iter );

		var iteration_stop_time = new Date().getTime();

		context.theta = theta;
		context.iter_count = i;

		// we cut the first feature because it's useless information
		for( var i=0;i<X.length;i++ )
			X[i].splice(0,1);

		var stop_time = new Date().getTime();
		context.execution_time = stop_time - start_time;
		context.iteration_time = Math.round((iteration_start_time - iteration_stop_time)/i);


		return context;
	}


	function gradient_step(X, y, theta, alpha){
		var m = X.length;
		var n = theta.length;
		var theta_r = new Array(n);

		// compute error vector
		var error_vector = new Array(m);
		for (var i=0;i<m;i++){
			error_vector[i] = hypothesis(X[i],theta) -y[i];
		}

		var derivative;
		for(var j=0;j<n;j++){
			derivative = 0;
			for (var i=0;i<m;i++){
				// compute the sum of the derivative
				derivative += error_vector[i]*X[i][j];
			}
			derivative = derivative*alpha / m;
			theta_r[j] = theta[j] - derivative;
		}

		return theta_r;
	}

	function hypothesis(x, theta){
		var y = 0;

		var n = x.length;
		for(var j=0;j<n;j++){
			y += x[j] * theta[j];
		}

		return y;
	}
	function cost(X, y, theta){
		var square_error = 0;
		var error;

		var m = X.length;
		for(var i=0;i<m;i++){
			error = hypothesis(X[i], theta) - y[i];
			square_error += Math.pow(error,2);
		}

		square_error = square_error / (2*m);

		return square_error;
	}



	function normalize_data(X){
		var m = X.length;
		var n = X[0].length;

		var mean = new Array(n);
		var std = new Array(n);

		// compute the mean of each column
		for(var j=0;j<n;j++){
			mean[j] = 0;
			for (var i=1;i<m;i++){
				mean[j] += X[i][j];
			}
			mean[j] = mean[j]/m;
		}

		// compute the standard deviation of each column
		for(var j=0;j<n;j++){
			std[j] = 0;
			for (var i=0;i<m;i++){
				std[j] += X[i][j] * X[i][j];
			}
			std[j] = std[j]/m;
			std[j] = std[j] - (mean[j]*mean[j]);
			std[j] = Math.sqrt(std[j]);
		}
		// applies the normalization

		for (var i=0;i<m;i++){
			for(var j=0;j<n;j++){
				X[i][j] = (X[i][j] - mean[j]) / std[j];
			}
		}

	}


	var polynomial_regression = {
			"run": run,
			"hypothesis": hypothesis,
			"cost": cost
	};
	if( typeof module !== 'undefined' && module.exports ){
		module.exports = polynomial_regression;
	}
	return polynomial_regression;
})();