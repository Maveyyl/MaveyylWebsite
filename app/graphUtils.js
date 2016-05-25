(function(app) {

	app.graphUtils = {
		generic2DGraph: generic2DGraph
	};

	function generic2DGraph(element_id, x, y, width, height){
		var data = x.map(function(d,i){
			return [x[i], y[i]];
		});

		// select id and empty it
		var chart = d3.select("#"+element_id);
		chart.html("");

		// handling displayed dimensions
		var dimensions = handleDimensions(chart.node(), width, height);
		width = dimensions.width;
		height = dimensions.height;

		// handling logical dimensions
		var ratio = width/height;
		var fixedHeight = 300;
		var fixedWidth = fixedHeight * ratio;

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
		var yAxisFont = "1.2em sans-serif";

		// Axises parameters
		var xAxisTicks = 5 * Math.round(fixedWidth/400);
		var yAxisTicks = 5;

		// set real dimensions and viewbox dimensions
		chart
			.attr("width", width)
			.attr("height", height)
			.attr("viewBox", "0 0 "+ fixedWidth +" "+ fixedHeight) ;

		// main container of the graph
		var mainContainer = chart.append("g")
			.attr("transform","translate("+ padding.left+","+padding.top+")");


		// CSS
		var style = document.createElement("style");
		document.head.appendChild(style);
		var sheet = style.sheet;

		sheet.insertRule("\
			svg .x-axis text { \
				fill: black;\
				font: "+ xAxisFont +";\
			}\
		", 0);		
		sheet.insertRule("\
			svg .y-axis text { \
				fill: black;\
				font: "+ yAxisFont +";\
			}\
		", 0);

		sheet.insertRule("\
			svg .x-axis line, svg .x-axis path {\
				fill: none;\
				stroke: black;\
			}\
		", 0);
		sheet.insertRule("\
			svg .y-axis line, svg .y-axis path {\
				fill: none;\
				stroke: black;\
			}\
		", 0);


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
			.attr("transform", "translate(0," + (innerHeight) + ")")
			.call(xAxis);


		// y scale
		var yScale = d3.scale.linear()
			.domain( d3.extent(y).reverse() )
			.range([0, innerHeight]);
		// y axis
		var yAxis = d3.svg.axis()
			.scale(yScale)
			.orient("left")
			.ticks(yAxisTicks);;
		// putting the axis in the container
		mainContainer.append("g")
			.attr("class", "y-axis")
			.attr("transform", "translate(0,0)")
			.call(yAxis);

		mainContainer.selectAll(".dot")
			.data(data)
		.enter().append("circle")
			.attr("class", "graph-dot")
			.attr("cx", function(d) { return xScale(d[0]); })
			.attr("cy", function(d) { return yScale(d[1]); })
			.attr("r", 5);

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