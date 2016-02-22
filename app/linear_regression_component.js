(function(app) {


	var options = 

	function update(){
		linear_regression.run( data, y, options);
	}

	app.LinearRegressionComponent = ng.core.Component({
		selector: 'linear-regression',
		templateUrl: 'templates/linear_regression_specific.html'
	}).
	Class({
		constructor:function(){
			console.log("linear_regression_component");
		},
		ngOnInit: function(){
			var _this = this;
			this.options = {
				alpha: 0.003,
				stop_condition: 0.001,
				max_iter:1000
			};
			_this.dimensions = [5,1];
			this.data = [
				[0],[1],[2],[3],[4]
			];
			this.y = [0,1,2,3,4];
			this.theta = [];

			this.update = function(){
				console.log(_this.theta = linear_regression.run(_this.data, _this.y,_this.options));
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