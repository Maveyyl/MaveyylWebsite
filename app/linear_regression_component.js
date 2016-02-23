(function(app) {


	
	function make_graph(element_id, x_data, y_data, curve_parameters, curve_function, width, height){

		var minWidth = 300;
		var minHeight = 200;

		var x_data0 = x_data.map(function(d,i){return d[0];});
		var data = x_data.map(function(d,i){
			return [x_data[i][0],y_data[i]];
		})




		var chart = d3.select("#"+element_id);
		chart.html("");

		function getMaxWidth(el){
			var parentStyle = window.getComputedStyle(el.parentNode);
			return parseInt(parentStyle.width) - parseInt(parentStyle.borderWidth)*2 - parseInt(parentStyle.paddingLeft) - parseInt(parentStyle.paddingRight);
		}

		// if width is undefined
		var maxWidth = getMaxWidth(chart.node());
		if( !width || width > maxWidth )
			width = maxWidth;
		if( !height )
			height = width;
		

		// set minimums if sizes are too small
		if( width < minWidth )
			width = minWidth;
		if( height < minHeight )
			height = minHeight;

		var padding={
			top:15+height*0.01,
			bottom: 15+height*0.01,
			left: 35+width*0.01,
			right: 15+width*0.01
		}

		var innerWidth = width -padding.right - padding.left;
		var innerHeight = height -padding.left - padding.right;

		chart
			.attr("width", width)
			.attr("height", height);


		var mainContainer = chart.append("g")
			.attr("transform","translate("+ padding.left+","+padding.top+")");


		var x = d3.scale.linear()
			.domain( d3.extent(x_data0) )
			.range([0, innerWidth]);
		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");
		mainContainer.append("g")
			.attr("class", "x axis")
			.attr("fill", "none")
			.attr("stroke", "black")
			.style("font", "10px sans-serif")
			.attr("transform", "translate(0," + (innerHeight) + ")")
			.call(xAxis);

		var y = d3.scale.linear()
			.domain( d3.extent(y_data).reverse() )
    		.range([0, innerHeight]);
		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left");
		mainContainer.append("g")
			.attr("class", "y axis")
			.attr("fill", "none")
			.attr("stroke", "black")
			.style("font", "10px sans-serif")
			.attr("transform", "translate(0,0)")
			.call(yAxis);

		mainContainer.selectAll(".dot")
			.data(data)
		.enter().append("circle")
			.attr("class", ".dot")
			.attr("cx", function(d) { return x(d[0]); })
			.attr("cy", function(d) { return y(d[1]); })
			.attr("r", 5);

		var line = d3.svg.line()
			.interpolate("monotone")
			.x(function(d,i) { return x(d[0]); })
			.y(function(d,i) { 
				return y( curve_function( [1].concat(x_data[i]), curve_parameters) ); 
			});

		mainContainer.append("path")
			.attr("fill","none")
			.attr("stroke-width", 1)
			.attr("stroke", "black")
			.datum(data)
			.attr("d", line);
	}




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
				make_graph("linear-regression-graph", _this.data, _this.y, _this.theta, linear_regression.hypothesis, 300,300);
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