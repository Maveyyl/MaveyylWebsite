var linear_regression = (function(){ 
	// m for the X sambles count
	// f number of features

	// iterators
	// i for the X rows
	// k for theta rows
	// j for the features (X columns)

	function run( X, y, options ){
		options = options || {};
		options.alpha = options.alpha || 0.1;
		options.stop_condition = options.stop_condition || 0.001;
		options.max_iter = options.max_iter || 1000;

		var context = {
			X: X,
			y: y,
			alpha: options.alpha,
			stop_condition: options.stop_condition,
			max_iter: options.max_iter,
			J: [],
			divergence:false
		};

		// copying X
		var tmp = X.slice(0);
		for(var i=0;i<tmp.length;i++)
			tmp[i] = X[i].slice(0);
		X = tmp;

		// adding the constant feature to X, basically adding column filled of 1 at the beginning
		for( var i=0;i<X.length;i++){
			X[i].unshift(1);
		}

		// creating theta
		var theta = new Array(X[0].length);
		theta.fill(0);

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

		context.theta = theta;
		context.iter_count = i;

		return context;
	}
	function gradient_step(X, y, theta, alpha){
		var m = X.length;
		var f = theta.length;
		var theta_r = new Array(f);

		// compute error vector
		var error_vector = new Array(m);
		for (var i=0;i<m;i++){
			error_vector[i] = hypothesis(X[i],theta) -y[i];
		}

		var derivative;
		for(var k=0;k<f;k++){
			derivative = 0;
			for (var i=0;i<m;i++){
				// compute the sum of the derivative
				derivative += error_vector[i]*X[i][k];
			}
			derivative = derivative*alpha / m;
			theta_r[k] = theta[k] - derivative;
		}

		return theta_r;
	}

	function hypothesis(x, theta){
		var y = 0;
		x.forEach(function(xj, j){
			y+= xj * theta[j];
		});
		return y;
	}
	function cost(X, y, theta){
		var square_error = 0;
		X.forEach(function(xi, i){
			var error = hypothesis(xi, theta) - y[i] ;
			square_error += Math.pow(error,2);
		});
		square_error = square_error / (2*X.length);
		return square_error;
	}

	var linear_regression = {
			"run": run,
			"hypothesis": hypothesis,
			"cost": cost
	};
	if( typeof module !== 'undefined' && module.exports ){
		module.exports = linear_regression;
	}
	return linear_regression;
})();