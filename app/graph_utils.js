(function(app) {

	app.graph_utils = {
		generic_2D_graph: generic_2D_graph
	};

	function generic_2D_graph(element_id, x, curves, width, height){
		// x looks like [0,1,2,....]

		// select id and empty it
		var chart = d3.select("#"+element_id);
		chart.html("");

		// handling displayed dimensions
		var dimensions = handleDimensions(chart.node(), width, height);
		width = dimensions.width;
		height = dimensions.height;

		// handling logical dimensions
		var fixedWidth = 400;
		var fixedHeight = 300;

		var padding={
			top: fixedHeight/10,
			bottom: fixedHeight/10,
			left: fixedWidth/10,
			right: fixedWidth/10
		}

		var innerWidth = fixedWidth - padding.right - padding.left;
		var innerHeight = fixedHeight -padding.left - padding.right;

		// Fonts
		var xAxisFont = "1.2em sans-serif";

		// Axises
		var xAxisTicks = 5;

		// set real dimensions and viewbox dimensions
		chart
			.attr("width", width)
			.attr("height", height)
			.attr("viewBox", "0 0 "+ fixedWidth +" "+ fixedHeight) ;

		// main container of the graph
		var mainContainer = chart.append("g")
			.attr("transform","translate("+ padding.left+","+padding.top+")");


		var style = document.createElement("style");
		document.head.appendChild(style);
		var sheet = style.sheet;

		sheet.insertRule("\
			svg .x-axis text { \
				fill: black;\
				font: "+ xAxisFont +"\
			}\
		",0);

		sheet.insertRule("\
			svg .x-axis line, svg .x-axis path {\
				fill: none,\
				stroke: black,\
			}\
		",1);
		console.log(sheet);


		// x scale
		var xScale = d3.scale.linear()
			.domain( d3.extent(x) )
			.range( [0, innerWidth] );
		// x axis
		var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient("bottom")
			.ticks(xAxisTicks);
		// putting the axis in the container
		mainContainer.append("g")
			.attr("class", "x-axis")
			// .attr("fill", "none")
			// .attr("stroke", "black")
			.attr("transform", "translate(0," + (innerHeight) + ")")
			.call(xAxis);


	}

	function handleDimensions(el, width, height, minWidth, minHeight){
		// if no dimensions given, take the maximum
		width = width || getElementMaxWidth(el) ;
		height = height || getElementMaxHeight(el);

		// if min dimensions given, make sure the minimums are respected
		if( minWidth && width < minWidth )
			width = minWidth;
		if( minHeight && width < minHeight )
			height = minHeight;

		return { width: width, height: height };
	}
	function getElementMaxWidth(el){
		var parentStyle = window.getComputedStyle(el.parentNode);
		
		return parseInt(parentStyle.width) - parseInt(parentStyle.borderWidth)*2 - parseInt(parentStyle.paddingLeft) - parseInt(parentStyle.paddingRight);
	}
	function getElementMaxHeight(el){
		var parentStyle = window.getComputedStyle(el.parentNode);
		return parseInt(parentStyle.height) - parseInt(parentStyle.borderWidth)*2 - parseInt(parentStyle.paddingTop) - parseInt(parentStyle.paddingBottom);
	}

	function generic_2D_graph2(element_id, x_data, y_data, width, height){

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