(function(app) {

	app.graph_utils = {
		generic_2D_graph: generic_2D_graph
	};

	function generic_2D_graph(element_id, x_data, y_data, width, height){

		var minWidth = 300;
		var minHeight = 200;

		var data = x_data.map(function(d,i){
			return [x_data[i],y_data[i]];
		});




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
			.domain( d3.extent(x_data) )
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
	}

	// handy function to compute width of a text
	function getTextWidth(text, font) {
		// if given, use cached canvas for better performance
		// else, create new canvas
		var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
		var context = canvas.getContext("2d");
		context.font = font;
		var metrics = context.measureText(text);

		return metrics.width;
	}


})(window.app || (window.app = {components:{}}));