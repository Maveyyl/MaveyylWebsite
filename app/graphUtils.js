(function(app) {

	app.graphUtils = {
		generic2DGraph: generic2DGraph,
		neuralNetworkGraph: neuralNetworkGraph
	};

	function neuralNetworkGraph(element_id, structure, weights, height, width){

		// select id and empty it
		var graph = d3.select("#"+element_id);
		graph.html("");		

		// handling displayed dimensions
		var dimensions = handleDimensions(graph.node(), width, height);
		width = dimensions.width;
		height = dimensions.height;

		// handling logical dimensions
		var ratio = width/height;
		var fixedHeight = 300;
		var fixedWidth = fixedHeight * ratio;

		var padding={
			top: 0,
			bottom: 0,
			left: 10,
			right: 10
		}

		var innerWidth = fixedWidth - padding.right - padding.left;
		var innerHeight = fixedHeight -padding.top - padding.bottom;

		// set real dimensions and viewbox dimensions
		graph
			.attr("width", width)
			.attr("height", height)
			.attr("viewBox", "0 0 "+ fixedWidth +" "+ fixedHeight) ;

		// main container of the graph
		var mainContainer = graph.append("g")
			.attr("transform","translate("+ padding.left+","+padding.top+")");


		var layerCount = structure.length;
		var structureCopy = new Array(layerCount);
		for(var l=0;l<layerCount-1;l++)
			structureCopy[l] = structure[l] + 1; // adding bias unit
		structureCopy[layerCount-1] = structure[layerCount-1];
		structure = structureCopy;

		var unitSize = 3;
		var linkMaxSize = 3;

		var unitData = [];
		for(var l=0;l<layerCount;l++){
			for(var u=0;u<structure[l];u++){
				unitData.push(
					{
						id: u,
						layer: l
					}
				);
			}
		}
		var linkData = [];
		var linkIndex = 0;
		for(var l=0;l<layerCount-1;l++){
			for(var u=0;u<structure[l];u++){
				for(var nu=0;nu<structure[l+1];nu++){
					if( l+1 !== layerCount -1 && nu ===0)
						continue;
					linkData.push(
						{
							id: linkIndex,
							layerStart: l,
							layerStop: l+1,
							unitStart: u,
							unitStop: nu,
							weight: weights[linkIndex]
						}
					);
					linkIndex++;
				}
			}
		}
		graph.linkData = linkData;


		// x scale for layers
		var xScale = d3.scale.linear()
			.domain( [0, layerCount-1] )
			.range( [0, innerWidth] );

		var yScales = new Array(layerCount);
		for(var l=0;l<layerCount;l++){
			yScales[l] = d3.scale.linear()
				.domain( [0, structure[l] +1 ] )
				.range( [0, innerHeight]);
		}

		var linkSizeScale = d3.scale.linear()
			.domain( [ 0,  d3.max( [Math.abs(d3.min(weights)), d3.max(weights) ] ) ] )
			.range( [0, linkMaxSize ]);


		mainContainer.selectAll(".graph-line")
			.data(linkData)
		.enter().append("line")
			.attr("class", "graph-line")
			.attr("x1", function(d){ return xScale(d.layerStart); })
			.attr("y1", function(d){ return yScales[d.layerStart](d.unitStart+1); })
			.attr("x2", function(d){ return xScale(d.layerStop); })
			.attr("y2", function(d){ return yScales[d.layerStop](d.unitStop+1); })
			.style("stroke", function(d){ return d.weight > 0 ? "blue":"red"; } )
			.style("stroke-width",  function(d){ return linkSizeScale(Math.abs(d.weight)); } );


		mainContainer.selectAll(".graph-dot")
			.data(unitData)
		.enter().append("circle")
			.attr("class", "graph-dot")
			.attr("cx", function(d) { return xScale( d.layer ); })
			.attr("cy", function(d) { return yScales[d.layer](d.id+1); })
			.attr("r", unitSize);


		graph.update = function(weights){		

			for(var w=0;w<weights.length;w++){
				this.linkData[w].weight = weights[w];
			}


			var linkSizeScale = d3.scale.linear()
			.domain( [ 0,  d3.max( [Math.abs(d3.min(weights)), d3.max(weights) ] ) ] )
			.range( [0, linkMaxSize ]);


			var selector = mainContainer.selectAll(".graph-line").data(this.linkData);
			selector
				.attr("class", "graph-line")
				.attr("x1", function(d){ return xScale(d.layerStart); })
				.attr("y1", function(d){ return yScales[d.layerStart](d.unitStart+1); })
				.attr("x2", function(d){ return xScale(d.layerStop); })
				.attr("y2", function(d){ return yScales[d.layerStop](d.unitStop+1); })
				.style("stroke", function(d){ return d.weight > 0 ? "blue":"red"; } )
				.style("stroke-width",  function(d){ return linkSizeScale(Math.abs(d.weight)); } );

			// // console.log(selector);
			// selector.enter().append("graph-line")
			// 	.attr("class", "graph-line")
			// 	.attr("x1", function(d){ return xScale(d.layerStart); })
			// 	.attr("y1", function(d){ return yScales[d.layerStart](d.unitStart+1); })
			// 	.attr("x2", function(d){ return xScale(d.layerStop); })
			// 	.attr("y2", function(d){ return yScales[d.layerStop](d.unitStop+1); })
			// 	.style("stroke", function(d){ return d.weight > 0 ? "blue":"red"; } )
			// 	.style("stroke-width",  function(d){ return linkSizeScale(Math.abs(d.weight)); } );

			// selector.exit().remove();
		};

		return graph;
	}


	function generic2DGraph(element_id, x, y, height, width){
		var data = x.map(function(d,i){
			return [x[i], y[i]];
		});

		// select id and empty it
		var graph = d3.select("#"+element_id);
		graph.html("");

		// handling displayed dimensions
		var dimensions = handleDimensions(graph.node(), width, height);
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
		var innerHeight = fixedHeight -padding.top - padding.bottom;

		// Fonts
		var xAxisFont = "1.2em sans-serif";
		var yAxisFont = "1.2em sans-serif";

		// Axises parameters
		var xAxisTicks = 5 * Math.round(fixedWidth/400);
		var yAxisTicks = 5;

		// set real dimensions and viewbox dimensions
		graph
			.attr("width", width)
			.attr("height", height)
			.attr("viewBox", "0 0 "+ fixedWidth +" "+ fixedHeight) ;

		// main container of the graph
		var mainContainer = graph.append("g")
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
		var xAxisContainer = mainContainer.append("g")
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
		var yAxisContainer = mainContainer.append("g")
			.attr("class", "y-axis")
			.attr("transform", "translate(0,0)")
			.call(yAxis);


		mainContainer.selectAll(".graph-dot")
			.data(data)
		.enter().append("circle")
			.attr("class", "graph-dot")
			.attr("cx", function(d) { return xScale(d[0]); })
			.attr("cy", function(d) { return yScale(d[1]); })
			.attr("r", 2);


		graph.update = function(x, y){		
			var data = x.map(function(d,i){
				return [x[i], y[i]];
			});

			xScale.domain( d3.extent(x) );		
			xAxis.scale(xScale);
			xAxisContainer.call(xAxis);

			yScale.domain( d3.extent(y).reverse() );
			yAxisContainer.call(yAxis);

			var selector = mainContainer.selectAll(".graph-dot").data(data);
			selector
				.attr("cx", function(d) { return xScale(d[0]); })
				.attr("cy", function(d) { return yScale(d[1]); })
				.attr("r", 2);

			// console.log(selector);
			selector.enter().append("circle")
				.attr("class", "graph-dot")
				.attr("cx", function(d) { return xScale(d[0]); })
				.attr("cy", function(d) { return yScale(d[1]); })
				.attr("r", 2);

			selector.exit().remove();
		};


		return graph;
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