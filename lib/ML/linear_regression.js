var linear_regression = (function(){ 
	// m for the data sambles count
	// f number of features

	// iterators
	// i for the data rows
	// k for theta rows
	// j for the features (data columns)

	function run( data, y, options ){
		options = options || {};
		options.alpha = options.alpha || 0.03;
		options.stop_condition = options.stop_condition || 0.001;
		options.max_iter = options.max_iter || 1000;

		// copying data
		var tmp = data.slice(0);
		for(var i=0;i<tmp.length;i++)
			tmp[i] = data[i].slice(0);
		data = tmp;

		// preparing the data
		for( var i=0;i<data.length;i++){
			data[i].unshift(1);
		}

		// creating theta
		var theta = new Array(data[0].length);
		theta.fill(0);

		var i = 0;
		var cost1 = cost(data,y,theta);
		theta = gradient_step(data,y,theta, options.alpha);
		while(1-cost(data,y,theta)/cost1  > options.stop_condition && i < options.max_iter){
			cost1 = cost(data,y,theta);
			theta = gradient_step(data,y,theta, options.alpha);
			i++;
		}

		return theta;
	}
	function gradient_step(data, y, theta, alpha){
		var m = data.length;
		var f = theta.length;
		var theta_r = new Array(f);

		// compute error vector
		var error_vector = new Array(m);
		for (var i=0;i<m;i++){
			error_vector[i] = hypothesis(data[i],theta) -y[i];
		}

		var derivative;
		for(var k=0;k<f;k++){
			derivative = 0;
			for (var i=0;i<m;i++){
				// compute the sum of the derivative
				derivative += error_vector[i]*data[i][k];
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
	function cost(data, y, theta){
		var square_error = 0;
		data.forEach(function(xi, i){
			var error = hypothesis(xi, theta) - y[i] ;
			square_error += Math.pow(error,2);
		});
		square_error = square_error / (2*data.length);
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