
var allAxis = ["Average Rating", "Number of readings", "Publication Year", "Number of Pages"];
var total = allAxis.length;
var z;

function calcPolygonArea(vertices) {
    var total = 0;

    for (var i = 0, l = vertices.length; i < l; i++) {
      var addX = vertices[i][0];
      var addY = vertices[i == vertices.length - 1 ? 0 : i + 1][1];
      var subX = vertices[i == vertices.length - 1 ? 0 : i + 1][0];
      var subY = vertices[i][1];

      total += (addX * addY * 0.5);
      total -= (subX * subY * 0.5);
    }

    return Math.abs(total);
}

class StarPlot extends Chart {

	drawLabels(){

		var g = d3.select("#"+this.id).select("svg").select("g");

		var axis = g.selectAll(".axis")
		        .data(allAxis)
		        .enter()
		        .append("g")
		        .attr("class", "axis");

		var w =this.cfg.w;
		var h =this.cfg.h;
		var factor = this.cfg.factor;
		var factorLegend = this.cfg.factorLegend;
    	var radians = this.cfg.radians;


		// lines
	    axis.append("line")
	        .attr("x1", w/2)
	        .attr("y1", h/2)
	        .attr("x2", function(d, i){return w/2*(1-factor*Math.sin(i*radians/total));})
	        .attr("y2", function(d, i){return h/2*(1-factor*Math.cos(i*radians/total));})
	        .attr("class", "line")
	        .style("stroke", "grey")
	        .style("stroke-width", "1px");


		var g = d3.select("#"+this.id).select("svg").select("g");
	    // text labels
		g.append("text")
		.attr("transform", "translate(" + this.w/2 + " ,-" + 15 + ")")
		.style("text-anchor", "middle")
		.text(allAxis[0]);

		// text labels
		g.append("text")
		.attr("transform", "translate(" + this.w/2 + " ," + (this.h+25) + ")")
		.style("text-anchor", "middle")
		.text(allAxis[2]);

		g.append("text")
		.attr("transform", "translate(-" + 15 + " ," + h/2 + ")rotate(-90)")
		.style("text-anchor", "middle")
		.text(allAxis[1]);

		// text labels
		g.append("text")
		.attr("transform", "translate(" + (this.w+25) + " ," + h/2 + ")rotate(-90)")
		.style("text-anchor", "middle")
		.text(allAxis[3]);

	}


	clean(){

		d3.select("#"+this.id).select("svg").selectAll("*").remove();
		d3.select("#"+this.id).select("svg")
		.append("g")
		.attr("transform", "translate("+ this.margin.left + ","+ this.margin.top+")");
		
	}


	drawEmpty(){
		
		this.clean();



	  var radius = this.cfg.factor*Math.min(this.cfg.w/2, this.cfg.h/2);
	  var Format = d3.format('d');

	var factor = this.cfg.factor;
    var radians = this.cfg.radians;
	var g = d3.select("#"+this.id).select("svg").select("g");

      for(var j=0; j < this.cfg.levels-1; j++){

        var levelFactor = factor*radius*((j+1)/this.cfg.levels);

        g.selectAll(".levels")
         .data(allAxis)
         .enter()
         .append("svg:line")
         .attr("x1", function(d, i){return levelFactor*(1-factor*Math.sin(i*radians/total));})
         .attr("y1", function(d, i){return levelFactor*(1-factor*Math.cos(i*radians/total));})
         .attr("x2", function(d, i){return levelFactor*(1-factor*Math.sin((i+1)*radians/total));})
         .attr("y2", function(d, i){return levelFactor*(1-factor*Math.cos((i+1)*radians/total));})
         .attr("class", "line")
         .style("stroke", "grey")
         .style("stroke-opacity", "0.75")
         .style("stroke-width", "0.3px")
         .attr("transform", "translate(" + (this.cfg.w/2-levelFactor) + ", " + (this.cfg.h/2-levelFactor) + ")");
     }

     this.drawLabels();

	}


	drawChart(selectedCircles){
		if(selectedCircles.length != 0){

			var colors = selectedCircles.map( function(d) { return d.color;})

			var max_pub =  d3.max(selectedCircles, function(i){
		        return i.circle.datum().original_publication_year;
		    })

		    var max_reads =  d3.max(selectedCircles, function(i){
		        return i.circle.datum().number_readings;
		    })

		    var max_pages =  d3.max(selectedCircles, function(i){
		        return i.circle.datum().num_pages;
		    });

		   var books = [];
		   for (var i = 0; i < selectedCircles.length; i++) {
		       var book = selectedCircles[i].circle.datum();
		       //console.log(book);
		       //if value of book.original_publication_year < 0 book other values will become zero
		       var pubyear_scale = (book.original_publication_year<0?1:book.original_publication_year);
		       books.push([
		           {axis:"Average Rating",value:book.average_rating*(pubyear_scale/5.),truevalue:book.average_rating},
		           {axis:"Number of readings",value:book.number_readings*(pubyear_scale/max_reads),truevalue:book.number_readings},
		           {axis:"Publication Year",value:book.original_publication_year*(pubyear_scale/max_pub),truevalue:book.original_publication_year},
		           {axis:"Number of Pages",value:book.num_pages*(pubyear_scale/max_pages),truevalue:book.num_pages}
		       ]);
		  	}


			this.draw(books, colors);
		}

	}

	draw(books, selectedColors){

		this.drawEmpty();

		this.cfg.maxValue = Math.max(this.cfg.maxValue, d3.max(books, function(i){
      		return d3.max(i.map(function(o){return o.value;
      	}))}));

	  //var allAxis = (books[0].map(function(i, j){return i.axis}));
	  //var total = allAxis.length;
	  var radius = this.cfg.factor*Math.min(this.cfg.w/2, this.cfg.h/2);
	  var Format = d3.format('d');

	var w =this.cfg.w;
	var h =this.cfg.h;
	var factor = this.cfg.factor;
    var radius = this.cfg.radius;
    var radians = this.cfg.radians;
    var maxValue = this.cfg.maxValue;
    var opacityArea = this.cfg.opacityArea;
	var g = d3.select("#"+this.id).select("svg").select("g");

   var series = 0;

    var dataValues;
    books.forEach(function(y, x){
	    dataValues = [];
	    g.selectAll(".nodes")
	      .data(y, function(j, i){
	          dataValues.push([
	          w/2*(1-(parseFloat(Math.max(j.value, 0))/maxValue)*factor*Math.sin(i*radians/total)),
	          h/2*(1-(parseFloat(Math.max(j.value, 0))/maxValue)*factor*Math.cos(i*radians/total))
	        ]);
	      });
	    dataValues.push(dataValues[0]); 
	    
	    g.selectAll(".area")
	       .data([dataValues])
	       .enter()
	       .append("polygon")
	       .attr("class", "radar-chart-serie"+series)
	       .style("stroke-width", "2px")
	       .style("stroke", selectedColors[series])
	       .attr("points",function(d) {
	           var str="";
	           for(var pti=0;pti<d.length;pti++){
	               str=str+d[pti][0]+","+d[pti][1]+" ";
	           }
	           return str;
	        })
	       .style("fill", selectedColors[series])
	       .style("fill-opacity", 0)
	       .style("fill-opacity", opacityArea)
			 .on('mouseover', function (d){
								z= "polygon."+d3.select(this).attr("class");
								g.selectAll("polygon")
								 .transition(200)
								 .style("fill-opacity", 0.0001); 
								g.selectAll(z)
								 .transition(200)
								 .style("fill-opacity", .7);
							  })
			 .on('mouseout', function(){
								g.selectAll("polygon")
								 .transition(200)
	         .style("fill-opacity", opacityArea);
	        })
	    	series++;
    });
  
  series=0;

  books.forEach(function(y, x){
    g.selectAll(".nodes")
      .data(y).enter()
      .append("svg:circle")
      .attr("title", function(j){return series+"_"+j.axis})
      .attr("class", "radar-chart-serie"+series)
      .attr('r', radius)
      .attr("alt", function(j){return Math.max(j.value, 0)})
      .attr("cx", function(j, i){
        dataValues.push([
          w/2*(1-(parseFloat(Math.max(j.value, 0))/maxValue)*factor*Math.sin(i*radians/total)),
          h/2*(1-(parseFloat(Math.max(j.value, 0))/maxValue)*factor*Math.cos(i*radians/total))
      ]);
      return w/2*(1-(Math.max(j.value, 0)/maxValue)*factor*Math.sin(i*radians/total));
      })
      .attr("cy", function(j, i){
        return h/2*(1-(Math.max(j.value, 0)/maxValue)*factor*Math.cos(i*radians/total));
      })
      .attr("data-id", function(j){return j.axis})
      .style("fill", selectedColors[series])
      .style("fill-opacity", .9)
      .on('mouseover', function (d){
      	console.log(selectedColors);
          var div_tooltip = d3.select("body").select("#tooltip-star");
		    div_tooltip.transition()
		    .duration(200)
		    .style("opacity", 1)
		    .style("background-color", d3.select(this).style("fill"));
		    div_tooltip.html(d.axis +": "+d.truevalue)
		    .style("left", (d3.event.pageX) + "px")
		    .style("top", (d3.event.pageY - 28) + "px");

          z = "polygon."+d3.select(this).attr("class");
        })
      .on('mouseout', function(){
            d3.select("body").select("#tooltip-star").transition()
      .duration(500)
      .style("opacity", 0);
          g.selectAll("polygon")
              .transition(200)
        })

    series++;
  	});
	}

	getNodes(){
		console.log(d3.select("#"+this.id).select("svg").select("g").selectAll("circle"));
		return d3.select("#"+this.id).select("svg").select("g").selectAll("circle");
	}

	constructor(){
		
		super(400, 400, "star-plot", 50 , 50, 50, 50);
		
		d3.select("body").append("div")
		.attr("class", "tooltip")
		.attr("id", "tooltip-star")
		.style("opacity", 0);

	    this.cfg = {
	       radius: 5,
	       w: this.w,
	       h: this.h,
	       factor: 1,
	       factorLegend: .85,
	       levels: 6,
	       maxValue: 0.6,
	       radians: 2 * Math.PI,
	       opacityArea: 0.0001,
	   };

  		this.drawEmpty();
	}
}