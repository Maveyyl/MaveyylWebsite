(function(app) {

	app.graphUtils = {
		scalableGeneric2DGraph: scalableGeneric2DGraph,
		generic2DGraph: generic2DGraph,
		neuralNetworkGraph: neuralNetworkGraph
	};

	
	function neuralNetworkGraph(element_id, structure, weights, height, width){

		// select id and empty it
		var graph = d3.select("#"+element_id);
		graph.html("");		

		var minHeight = 100;
		var minWidth = 100;
		var fixedRatio = 1;

		// handling displayed dimensions
		var dimensions = handleDimensions(graph.node(), height, width, minHeight, minWidth, fixedRatio);
		width = dimensions.width;
		height = dimensions.height;

		var padding={
			top: 0,
			bottom: 0,
			left: 10,
			right: 10
		}

		var innerWidth = width - padding.right - padding.left;
		var innerHeight = height -padding.top - padding.bottom;

		// set real dimensions and viewbox dimensions
		graph
			.attr("width", width)
			.attr("height", height);
			// .attr("viewBox", "0 0 "+ width +" "+ height) ;

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
		// for every layer -1
		for(var l=0;l<layerCount-1;l++){
			// for every units in the next layer, minus the bias unit
			for(var nu=0;nu<structure[l+1];nu++){
				if( l+1 !== layerCount -1 && nu ===0)
					continue;
				// compute scale function of links coming to nu unit
				var previous_units = weights.slice(linkIndex, linkIndex+structure[l]);
				var scale = d3.scale.linear()
					.domain( [ 0,  d3.max( [Math.abs(d3.min(previous_units)), d3.max(previous_units) ] ) ] )
					.range( [0, linkMaxSize ])

				// for every units in the previous layer
				for(var u=0;u<structure[l];u++){
					linkData.push(
						{
							id: linkIndex,
							layerStart: l,
							layerStop: l+1,
							unitStart: u,
							unitStop: nu,
							weight: weights[linkIndex],
							scale: scale
						}
					);
					linkIndex++;
				}
			}
		}
		graph.linkData = linkData;
		graph.layerCount = layerCount;
		graph.structure = structure;


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

		// var linkSizeScale = d3.scale.linear()
		// 	.domain( [ 0,  d3.max( [Math.abs(d3.min(weights)), d3.max(weights) ] ) ] )
		// 	.range( [0, linkMaxSize ]);


		mainContainer.selectAll(".graph-line")
			.data(linkData)
		.enter().append("line")
			.attr("class", "graph-line")
			.attr("x1", function(d){ return xScale(d.layerStart); })
			.attr("y1", function(d){ return yScales[d.layerStart](d.unitStart+1); })
			.attr("x2", function(d){ return xScale(d.layerStop); })
			.attr("y2", function(d){ return yScales[d.layerStop](d.unitStop+1); })
			.style("stroke", function(d){ return d.weight > 0 ? "blue":"red"; } )
			.style("stroke-width",  function(d){ return d.scale(Math.abs(d.weight)); } );


		mainContainer.selectAll(".graph-dot")
			.data(unitData)
		.enter().append("circle")
			.attr("class", "graph-dot")
			.attr("cx", function(d) { return xScale( d.layer ); })
			.attr("cy", function(d) { return yScales[d.layer](d.id+1); })
			.attr("r", unitSize);


		graph.update = function(weights){
			// for every layer -1
			var linkIndex = 0;
			for(var l=0;l< this.layerCount-1;l++){
				// for every units in the next layer, minus the bias unit
				for(var nu=0;nu<this.structure[l+1];nu++){
					if( l+1 !== this.layerCount -1 && nu ===0)
						continue;
					// compute scale function of links coming to nu unit
					var previous_units = weights.slice(linkIndex, linkIndex+this.structure[l]);
					var scale = d3.scale.linear()
						.domain( [ 0,  d3.max( [Math.abs(d3.min(previous_units)), d3.max(previous_units) ] ) ] )
						.range( [0, linkMaxSize ])

					// for every units in the previous layer
					for(var u=0;u<this.structure[l];u++){
						this.linkData[linkIndex].weight = weights[linkIndex];
						this.linkData[linkIndex].scale = scale;

						linkIndex++;
					}
				}
			}

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
				.style("stroke-width",  function(d){ return d.scale(Math.abs(d.weight)); } );

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


	function scalableGeneric2DGraph(element_id, point_count_max, starting_step_size, height, width){
		var r = {};
		r.graph = generic2DGraph(element_id, [], [], height, width);

		r.point_count_max = point_count_max;
		r.step_size = starting_step_size;
		r.data_x = [];
		r.data_y = [];
		r.cumul_data_x = 0;
		r.cumul_data_y = 0;
		r.pending_data_count = 0;

		r.update = function(x, y){
			// adds new data to the cumulatives
			this.cumul_data_x+= x;
			this.cumul_data_y+= y;
			this.pending_data_count++;

			// if we reached enough samples data in our cumulatives
			if( this.pending_data_count === this.step_size ){
				// we compute the average of it and reset the cumulatives
				this.data_x.push( this.cumul_data_x/this.step_size );
				this.data_y.push( this.cumul_data_y/this.step_size );
				this.cumul_data_x = 0;
				this.cumul_data_y = 0;
				this.pending_data_count = 0;

				// if the graph contains too much points
				if( this.data_x.length === this.point_count_max ){
					var I = this.data_x.length/2;
					var new_data_x = new Array(I);
					var new_data_y = new Array(I);
					// compute the average of pairs of two points, dividing the count of points by 2
					for(var i=0;i<I;i++){
						new_data_x[i] = (this.data_x[i*2] + this.data_x[i*2+1]) / 2;
						new_data_y[i] = (this.data_y[i*2] + this.data_y[i*2+1]) / 2;
					}
					this.data_x = new_data_x;
					this.data_y = new_data_y;

					// increase the number of data necessary before computing new points
					this.step_size = this.step_size *2;
				}


				// update graph
				this.graph.update( this.data_x, this.data_y);
			}
		}

		return r;
	}

	function generic2DGraph(element_id, x, y, height, width){
		var data = x.map(function(d,i){
			return [x[i], y[i]];
		});

		// select id and empty it
		var graph = d3.select("#"+element_id);
		graph.html("");

		// handling displayed dimensions
		var minWidth = 200;
		var minHeight = 75;
		var fixedRatio = minWidth/minHeight;
		var dimensions = handleDimensions(graph.node(), height,width, minHeight, minWidth, fixedRatio);
		width = dimensions.width;
		height = dimensions.height;

		var padding={
			top: 10,
			bottom: 20,
			left: 60,
			right: 15
		}

		var innerWidth = width - padding.right - padding.left;
		var innerHeight = height -padding.top - padding.bottom;

		// Fonts
		var xAxisFont = "1em sans-serif";
		var yAxisFont = "1em sans-serif";

		// Axises parameters
		var xAxisTicks = 5 * Math.round(width/400);
		var yAxisTicks = 5;

		// set real dimensions and viewbox dimensions
		graph
			.attr("width", width)
			.attr("height", height);
			// .attr("viewBox", "0 0 "+ fixedWidth +" "+ fixedHeight) ;

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

	function handleDimensions(el, height, width, minHeight, minWidth, fixed_ratio){
		// if no dimensions given, take the maximum
		width = width || getElementMaxWidth(el) ;
		height = height || getElementMaxHeight(el);
		
		// if min dimensions given, make sure the minimums are respected
		if( minWidth && width < minWidth )
			width = minWidth;
		if( minHeight && width < minHeight )
			height = minHeight;

		// var ratio = width / height;
		// if( ratio < fixed_ratio ) // width is limited
		// 	height = width / fixed_ratio;
		// else // height is limited
		// 	width = height * fixed_ratio;
		height = width / fixed_ratio;


		return { width: width, height: height };
	}
	function getElementMaxWidth(el){
		var parentStyle = window.getComputedStyle(el.parentNode);
		return parseInt(parentStyle.width) - parseInt(parentStyle.borderWidth || 0)*2 - parseInt(parentStyle.paddingLeft || 0) - parseInt(parentStyle.paddingRight || 0);
	}
	function getElementMaxHeight(el){
		var parentStyle = window.getComputedStyle(el.parentNode);
		return parseInt(parentStyle.height) - parseInt(parentStyle.borderWidth || 0)*2 - parseInt(parentStyle.paddingTop || 0) - parseInt(parentStyle.paddingBottom || 0);
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