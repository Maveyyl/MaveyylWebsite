(function(app) {




	function update(){
		polynomial_regression.run( data, y, options);
	}

	app.polynomialRegressionComponent = ng.core.Component({
		selector: 'polynomial-regression',
		templateUrl: 'templates/machine_learning/polynomial_regression.html'
	}).
	Class({
		constructor:function(){
			console.log("polynomial_regression_component");
		},
		ngOnInit: function(){
			var _this = this;
			this.options = {
				alpha: 0.1,
				stop_condition: 0.001,
				max_iter:1000,
				feature_scalling:true
			};
			_this.dimensions = [5,1];
			this.data = [
				[0],[1],[2],[3],[4]
			];
			this.y = [0,1,2,3,4];
			this.theta = [];

			this.update = function(){
				// parse inputs into numbers
				_this.options.alpha = parseFloat(_this.options.alpha);
				_this.options.stop_condition = parseFloat(_this.options.stop_condition);
				_this.options.max_iter = parseInt(_this.options.max_iter);
				for(var i=0;i<_this.data.length;i++){
					_this.y[i] = parseFloat(_this.y[i]);
					for( var y =0;y<_this.data[i].length;y++){
						_this.data[i][y] = parseFloat(_this.data[i][y]);
					}
				}

				// compute the polynomial regression
				_this.result = polynomial_regression.run(_this.data, _this.y,_this.options);
				console.log(_this.result);

				// print data dots and result curve
				graph_utils.polynomial_regression_graph("polynomial-regression-graph", _this.result.X_norm, _this.y, _this.result.theta, polynomial_regression.hypothesis);

				// create cost function x axis values
				var iterX = [];
				for(var i=1;i<=_this.result.iter_count;i++)
					iterX.push(i);
				// print cost function dots
				graph_utils.generic_2D_graph("cost-graph", iterX, _this.result.J);
			}
			this.addRow = function(){
				_this.data.push(new Array(_this.dimensions[1]).fill(0));
				_this.y.push(0);
				_this.dimensions[0]++;
			}
			this.removeRow = function(){
				_this.dimensions[0]--;
				_this.data.splice(_this.dimensions[0]);
				_this.y.splice(_this.dimensions[0]);
			}
			this.addColumn = function(){
				_this.data.forEach(function(d,i){
					d.push(0);
				});
				_this.dimensions[1]++;
			}
			this.removeColumn = function(){
				_this.dimensions[1]--;
				_this.data.forEach(function(d,i){
					d.splice(_this.dimensions[1]);
				});
			}


		}
	});

})(window.app || (window.app = {}));