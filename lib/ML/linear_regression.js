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
			J: []
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

		var i = 0;

		var cost1 = cost(X,y,theta);
		theta = gradient_step(X,y,theta, options.alpha);
		context.J.push(cost1); // saving J progress

		while( cost1-cost(X,y,theta) > options.stop_condition && i < options.max_iter){ // stops when J decreased by less than stop_condition or if max_iter has been reached
			cost1 = cost(X,y,theta);
			theta = gradient_step(X,y,theta, options.alpha);
			context.J.push(cost1);

			i++;
		}

		context.theta = theta;

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