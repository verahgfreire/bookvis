class GroupedBarChart extends Chart {

	drawLabels(){
		var svg = d3.select("#"+this.id).select("svg").select("g");
		// text label for the x axis
		svg.append("text")
		.attr("transform", "translate(" + this.w + " ," + 15 + ")")
		.style("text-anchor", "end")
		.text("Count");

		//text label for the y axis
		svg.append("text")
		.attr("transform", "translate(-" + 5 + " ," + (this.h+5) + ")rotate(-90)")
		.style("text-anchor", "end")
		.text("Rating");
	}

	clean(){

		d3.select("#"+this.id).select("svg").selectAll("*").remove();
		d3.select("#"+this.id).select("svg")
		.append("g")
		.attr("transform", "translate("+ this.margin.left + ","+ this.margin.top+")");

	}

	drawEmpty(){

		this.clean();

		var padding = 0.1;

		var yrange_base = d3.scaleBand()
    				.rangeRound([0, this.h])
    				.padding(padding);


		var xrange = d3.scaleLinear()
		        	.range([this.w, 0]);

		var xaxis = d3.axisTop().scale(xrange).tickValues([]);
		var yaxis = d3.axisLeft().scale(yrange_base).tickValues([]).tickSizeOuter(0);


		var svg = d3.select("#"+this.id).select("svg").select("g");
		svg.append("svg:g").call(xaxis);
		svg.append("svg:g").call(yaxis);

		this.drawLabels();

	}

	drawCharts(selectedCircles){

		if(selectedCircles.length > 0){

			// clean data and create dataset
			var dataset = selectedCircles.map(
				function(d, i) {
					var bookSelected = d.circle.datum();

	   				bookSelected = [{rating: 1,
	                     count: +(bookSelected.ratings_1),
	                 	 group: i},
	                    {rating: 2,
	                     count: +(bookSelected.ratings_2),
	                	 group: i},
	                    {rating: 3,
	                     count: +(bookSelected.ratings_3),
	                 	 group: i},
	                    {rating: 4,
	                     count: +(bookSelected.ratings_4),
	                 	 group: i},
	                    {rating: 5,
	                     count: +(bookSelected.ratings_5),
	                 	 group: i}];

					return bookSelected; })

			var colors = selectedCircles.map( function(d) { return d.color;})
			var titles = selectedCircles.map( function(d) { return d.circle.datum().title;})
			var max_rating_count = d3.max(dataset,
										function(d) {
                         					return d3.max(d, function(d) {return d.count});
                         				;}
                         			);
			//console.log("MAX");
			//console.log(max_rating_count);
			this.draw(dataset, colors, titles, max_rating_count);
		} else{
			this.drawEmpty();
		}

	}

	draw(dataset, colors, titles, max_rating_count){
		this.clean();

		var keys = dataset;

		var padding = 0.1;

		var yrange_base = d3.scaleBand()
    				.rangeRound([0, this.h])
    				.padding(padding)
    				.domain([0,1,2,3]);

		var yrange = d3.scaleBand().padding(0.05).rangeRound([0, yrange_base.bandwidth()]).domain([1,2,3,4,5]);

		var xrange = d3.scaleLinear()
		        	.range([0, this.w])
		        	.domain([0, max_rating_count]).nice();

		var xaxis = d3.axisTop().scale(xrange).tickFormat(d3.format(".2s")).ticks(10);
		var yaxis = d3.axisLeft().scale(yrange_base).tickSize(0).tickFormat(function(d,i){ return titles[i] });;
		var yaxis2= d3.axisLeft().scale(yrange).tickSizeOuter(0);

		var svg = d3.select("#"+this.id).select("svg").select("g");

		svg.append("svg:g").call(xaxis)
		.selectAll("text")
		.style("text-anchor", "start")
        .attr("dx", "-.6em")
        .attr("dy", ".15em")
        .attr("transform", "translate(10,-15)rotate(-65)");

		svg.append("svg:g").call(yaxis).selectAll("text").attr("class", "booktitle")
		.text(function(d, i){
			return (d3.select(this).text().length > 15)? d3.select(this).text().substring(0, 15)+"...": d3.select(this).text();})
		.on("mouseover", function(d,i) {

      		var div_tooltip = d3.select("body").select("#tooltip-book-title");
		    div_tooltip.transition()
		    .duration(200)
		    .style("opacity", 1)
		    .style("background-color", colors[i]);

		    div_tooltip.html(titles[i])
		    .style("left", (d3.event.pageX) + "px")
		    .style("top", (d3.event.pageY - 28) + "px");
    	})
	    .on("mouseout", function(d){
	      d3.select("body").select("#tooltip-book-title").transition()
      		.duration(500)
      		.style("opacity", 0);
	    })
		.style("text-anchor", "start")
		.style("fill", function(d,i){ return colors[i] })
        .attr("transform", "translate(-100,0)rotate(-20)");

        // x-grid
    	svg.append("g")
        .attr("class", "grid")
        .transition()
		.duration(500)
        .call(xaxis
            .tickSize(-this.h, 0, 0)
            .tickFormat("")
        );

      	var w = this.w;

		svg.append("g").selectAll("g")
		.data(dataset)
		.enter()
		.append("g")
		.attr("transform", function(d,i) {
			return "translate(0,"+yrange_base(i)+")"; })
		.attr("id", function(d,i){return "bar-chart-"+i})
		.call(yaxis2);

      	for (var i = 0; i < dataset.length; i++) {
      		//console.log(dataset[i]);
      		svg.select("#bar-chart-"+i).selectAll("rect")
	    	.data(dataset[i])
	    	.enter()
	    	.insert("rect")
	    	.attr("id", function(d){return d.group+"_"+d.rating})
	        .attr("title", function(d) {return d.group+"_"+d.rating;})
	        .attr("x", 1)
	        .attr("width",function(d) {
	            return xrange(0);
	        })
	        .attr("height",10)
	        .attr("y",function(d) {
	            return yrange(d.rating);
	        })
	        .style("fill", colors[i]);

	        svg.select("#bar-chart-"+i).selectAll("rect")
	        .transition()
      		.delay(function (d) {return Math.random()*1000;})
      		.duration(1000)
      		.attr("width", function(d) {
	            return xrange(d.count);
	        });

      	}

      	this.drawLabels();

	}

	getBars(){
		return d3.select("#"+this.id).select("svg").selectAll("rect");
	}

	constructor(max_rating_count){

		super(300, 400, "grouped-bar-chart", 50 , 30, 50, 120);

		d3.select("body").append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip-bar")
        .style("opacity", 0);
        d3.select("body").append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip-book-title")
        .style("opacity", 0);
  		this.drawEmpty();
	}
}
