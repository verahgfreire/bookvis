
  var r_labels= ['1 to 2.49','2.5 to 2.99','3 to 3.49','3.5 to 3.99','4 to 4.49','4.5 to 5'];

class FilterInfo extends Chart {

	clean(){

		d3.select("body").select("#cluster-name").html("");
		d3.select("#"+this.id).select("svg").selectAll("*").remove();
		d3.select("#"+this.id).select("svg")
		.append("g")
		.attr("transform", "translate("+ this.margin.left + ","+ this.margin.top+")");

	}


	drawEmpty(){


  var svg = d3.select("#"+this.id).select("svg").select("g");

  // average rating
  svg.selectAll("rect")
      .data(rating_group_colors)
      .enter()
      .append("text")
      .attr("x", 40)
      .attr("y",function(d,i){
          return -5+i*25;
      })
      .style("opacity", 1)
      .style("fill","black")
      .text(function(d,i){
          return r_labels[i];
      });

  svg.selectAll("rect")
      .data(rating_group_colors)
      .enter()
      .insert("rect")
      .attr("class", "avg_rating")
      .attr("id", function(d,i){return "avg_rating_"+(i+1);})
      .attr("x", 10)
      .attr("width",25)
      .attr("height",22)
      .attr("y",function(d,i){
          return -20+i*25;
      })
      .style("opacity",1)
      .style("stroke","black")
      .style("stroke-width","0")
      .style("fill", function(d,i){
          return d;
      })
      .on('mouseover', function (d){
        var color = d3.color(d3.select(this).style("fill")).darker(0.8);
        d3.select(this).style("fill", color);
      })
      .on('mouseout', function(d){
          var color = d3.color(d3.select(this).style("fill")).brighter(0.8);
          d3.select(this).style("fill", color);
      })
      .on("click", function(d,i) { //TODO
        if(typeof selectedCluster !== 'undefined'){
          var avg_r = i+1;
          filterByAvgRating(avg_r);
          filterByShelf();
          //shows dataset after all filters are applied
          var current_cluster_id = selectedCluster.datum().cluster_id;
            currentSelection = []
            for (index = 0; index < selectedCircles.length; index++) {
                if(selectedCircles[index].circle.datum().cluster_id == current_cluster_id) 
                  currentSelection.push(selectedCircles[index]);
            }
            bubbleChart.drawChart(dataset, selectedCluster.datum().title, currentSelection);
            bubbleEvents();
          }
      })

  svg.append("text")
      .attr("transform", "translate(-" + 0 + " ,100)rotate(-90)")
      .text("Rating Colors");

  svg.append("text")
      .attr("transform", "translate(-" + 0 + " ,230)rotate(-90)")
      .text("Selected Books");

  svg.append("text")
      .attr("transform", "translate(-" + 0 + " ,310)rotate(-90)")
      .text("# Pages");

  var page_number_sizes = [{size:1,label:"<300", group:0},
      {size:2,label:"300-400", group:1},{size:3,label:">400", group:2}]
  svg.selectAll("circle")
      .data(page_number_sizes)
      .enter()
      .append("text")
      .attr("class", "page_number")
      .attr("x", 40)
      .attr("y",function(d,i){
          return 255+i*30;
      })
      .style("opacity", 1)
      .style("fill","black")
      .text(function(d){
          return d.label;
      });

  svg.selectAll("circle")
      .data(page_number_sizes)
      .enter()
      .insert("circle")
      .attr("id", d=>"page_number_"+d.group)
      .attr("cx", 22)
      .attr("r",function(d){
        return 5*d.size;
    })
      .attr("cy",function(d,i){
          return 250+i*30;
      })
      .style("opacity",1)
      .style("fill","white")
      .style("stroke","black")
      .on('mouseover', function (d){
        var color = d3.color(d3.select(this).style("fill")).darker(0.8);
        d3.select(this).style("fill", color);
      })
      .on('mouseout', function(d){
          var color = d3.color(d3.select(this).style("fill")).brighter(0.8);
          d3.select(this).style("fill", color);
      })
      .on("click", function(d,i) { //TODO
        if(typeof selectedCluster !== 'undefined'){

          if(selectedPageRange !== 0){
            selectedPageRange = 0;
            dataset = unfilteredDataset;
            d3.select("#page_number_"+d.group).style("stroke-width",1)
          }
          else{
            filterByPageNumber(d.group);
            selectedPageRange = d.group;
            d3.select("#page_number_"+d.group).style("stroke-width",2)
          }
          //shows dataset after all filters are applied
          var current_cluster_id = selectedCluster.datum().cluster_id;
            currentSelection = []
            for (index = 0; index < selectedCircles.length; index++) {
                if(selectedCircles[index].circle.datum().cluster_id == current_cluster_id) 
                  currentSelection.push(selectedCircles[index]);
            }
            bubbleChart.drawChart(dataset, selectedCluster.datum().title, currentSelection);
            bubbleEvents();
        }
      })

	}

	drawSelectedBooks(){
	  //Book Selected label TODO
      d3.select("#filter-info").select("svg").selectAll(".selLabel").remove();
      // legenda cores
      d3.select("#filter-info").select("svg").selectAll("rect2")
          .data(selectedColors)
          .enter()
          .insert("rect").attr("class","selLabel")
          .attr("width",25)
          .attr("height",22)
          .attr("x",30)
          .attr("y",function(d,i){
              return 175+i*25;
          })
          .style("fill",function(d,i){
              return i<selectedCircles.length ? selectedCircles[i].color : "none";
          });
          


      d3.select("#filter-info").select("svg").selectAll("rect2")
          .data(selectedColors)
          .enter()
          .append("g").attr("class","selLabel")
          .append("text").attr("class","selLabel")
          .attr("x",60)
          .attr("y",function(d,i){return 195+i*25;})
          .style("opacity", 1)
          .style("fill","black")
          .text(function(d,i){
              var title = (i<selectedCircles.length ? selectedCircles[i].circle.datum().title : '');
              return title.length > 38? title.substring(0,35)+"..." : title;
          })
          .on('mouseover', function (d,i){
            var color = selectedCircles[i].color;

            var div_tooltip = d3.select("body").select("#tooltip-filter");
		    div_tooltip.transition()
		    .duration(200)
		    .style("opacity", 1)
		    .style("background-color", color);
		    div_tooltip.html((i<selectedCircles.length ? selectedCircles[i].circle.datum().title : ''))
		    .style("left", (d3.event.pageX) + "px")
		    .style("top", (d3.event.pageY - 28) + "px");
          })
          .on('mouseout', function(d){

              d3.select("body").select("#tooltip-filter").transition()
		      .duration(500)
		      .style("opacity", 0);
          });

	}

	constructor(){

		super(300, 400, "filter-info", 35 , 20, 20, 20);

		d3.select("body").append("div")
		.attr("class", "tooltip")
		.attr("id", "tooltip-filter")
		.style("opacity", 0);

  		this.drawEmpty();
	}
}
