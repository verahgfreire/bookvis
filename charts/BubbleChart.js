var colors = ["#E46C34", "#F59B50", "#E4D648", "#AED367", "#6CBE78", "#168873"];

function cscale(r) {
	return colors[r-1];
}

class BubbleChart extends Chart {

	drawLabels(){
		var svg = d3.select("#"+this.id).select("svg").select("g");
		// text label for the x axis
		svg.append("text")
		.attr("transform", "translate(" + (this.w/2) + " ," +(this.h + 40) + ")")
		.style("text-anchor", "middle")
		.text("Publication year");

		//text label for the y axis
		svg.append("text")
		.attr("transform", "translate(-" + 40 + " ," +(this.h/2) + ")rotate(-90)")
		.style("text-anchor", "middle")
		.text("Number of readings");
	}

	drawReferenceLines(){
		var svg = d3.select("#"+this.id).select("svg").select("g");
		// line to point to x-axis on hover
		svg.append("line")//making a line for legend
		.attr("id", "line-x-axis")
		.attr("x1", 0)
		.attr("x2", 0)
		.attr("y1", 0)
		.attr("y2", 0)
		.style("stroke-dasharray","5,5") //dashed array for line
		.attr("stroke-width", 1);

		// line to point to y-axis on hover
		svg.append("line")//making a line for legend
		.attr("id", "line-y-axis")
		.attr("x1", this.h)
		.attr("x2", this.h)
		.attr("y1", this.h)
		.attr("y2", this.h)
		.style("stroke-dasharray","5,5") //dashed array for line
		.attr("stroke-width", 1);

	}

	clean(){

		d3.select("body").select("#cluster-name").html("");
		d3.select("#"+this.id).select("svg").selectAll("*").remove();
		d3.select("#"+this.id).select("svg")
		.append("g")
		.attr("transform", "translate("+ this.margin.left + ","+ this.margin.top+")");

	}


	drawEmpty(){

		this.clean();

		var xrange = d3.scaleLinear()
		              .range([0, this.w]);

		var yrange = d3.scaleLinear()
		              .range([this.h, 0]);

		var xaxis = d3.axisBottom().scale(xrange).tickValues([]);
		var yaxis = d3.axisLeft().scale(yrange).tickValues([]);

		var svg = d3.select("#"+this.id).select("svg").select("g");
		svg.append("svg:g").call(xaxis).attr("transform", "translate(0,"+this.h+")");
		svg.append("svg:g").call(yaxis);

		this.drawLabels();

	}

	drawSelected(selectedCircles){
		if(selectedCircles.length > 0){
			var dataset = [];
			var colors = {}
			for (index = 0; index < selectedCircles.length; index++) {
	      		dataset.push(selectedCircles[index].circle.datum());
	      		colors[selectedCircles[index].circle.datum().goodreads_book_id] = selectedCircles[index].color;
		    }

		    this.draw(dataset, "Selected Books", true, colors);
		} else{
			this.drawEmpty();
		}
	}

	drawChart(dataset, cluster_title, selectedCircles){
		var selectedColors = {}
		if(selectedCircles.length != 0){

			for (index = 0; index < selectedCircles.length; index++) {
	      		selectedColors[selectedCircles[index].circle.datum().goodreads_book_id] = selectedCircles[index].color;
	    	}

		}
		//console.log(selectedColors);
		//console.log(5 in selectedColors);
		this.draw(dataset, cluster_title, false, selectedColors);

	}

	draw(dataset, cluster_title, onlySelected, selectedColors){

		this.clean();

		// sort circles so the bigger circles are at the back
		dataset.sort(function (x, y) {
  			return x.original_publication_year - y.original_publication_year || y.num_pages - x.num_pages;
		});

		d3.select("body").select("#cluster-name").html(" - "+ cluster_title);

		var rscale = d3.scaleLinear()
   			.range([this.bubble_size.min,this.bubble_size.max])
         	.domain([d3.min(dataset, function(d) { return d.num_pages;}),
                  	 d3.max(dataset,  function(d) { return d.num_pages;})]);


        if(!onlySelected){
			var xrange = d3.scaleLinear()
			            .range([0, this.w])
			            .domain([d3.min(dataset, function(d) {
			              return (d.original_publication_year);
			            }), d3.max(dataset, function(d) {
			              return d.original_publication_year;
			            })]);
		}
		else{
			var xrange = d3.scalePoint()
						.domain(dataset.map(function(d) {return d.original_publication_year}))
						.range([0, this.w]).padding(0.25);
		}
		var yrange = d3.scaleLinear()
		            .range([this.h, 0])
		            .domain([0, d3.max(dataset, function(d) {
		              return d.number_readings;
		            })])
		            .nice();

		var xaxis = d3.axisBottom().scale(xrange).tickFormat(d3.format("d"));
		var yaxis = d3.axisLeft().scale(yrange).tickFormat(d3.format(".2s"));

		var svg = d3.select("#"+this.id).select("svg").select("g");

		svg.append("svg:g").call(xaxis).attr("transform", "translate(0,"+this.h+")");
		svg.append("svg:g").call(yaxis);

		// y-grid
    	svg.append("g")
        .attr("class", "grid")
        .transition()
		.duration(500)
        .call(yaxis
            .tickSize(-this.w, 0, 0)
            .tickFormat("")
        );

		this.drawLabels();

		this.drawReferenceLines();

		var circles = svg.selectAll("circle").data(dataset);

		circles
		.data(dataset)
		.enter()
		.insert("circle")
		.attr("cx", function(d) { return xrange (d.original_publication_year); })
		.attr("cy", function(d) { return yrange (d.number_readings); })
		.transition()
		.duration(500)
		.attr('r', function(d){ return rscale(d.num_pages); })
		.attr("title", function(d) { return d.goodreads_book_id;})
		.style("fill", function (d) { return cscale(d.rating_group);})
		.attr("opacity", (onlySelected ? 1 : function (d) { return (Object.keys(selectedColors).length == 0 || d.goodreads_book_id in selectedColors) ? 1 : 0.5}))
		.attr("stroke", (onlySelected ? function (d) { return selectedColors[d.goodreads_book_id]; } : function (d) {return d.goodreads_book_id in selectedColors? selectedColors[d.goodreads_book_id] : "white"}))
		.attr("stroke-width",  (onlySelected  ? 3 : function (d){ return d.goodreads_book_id in selectedColors? 3 : 1}));

	}

	getBubbles(){
		return d3.select("#"+this.id).select("svg").selectAll("circle");
	}

	constructor(){

		super(600, 400, "bubble-chart", 30 , 40, 50, 70);
		this.bubble_size = {max: 25, min:4};

		d3.select("body").append("div")
		.attr("class", "tooltip")
		.attr("id", "tooltip-bubble")
		.style("opacity", 0);

  		this.drawEmpty();
	}
}
