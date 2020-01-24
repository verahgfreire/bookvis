var gradient = [
    ["#33A7CC","#40ACCE", "#4DB2D1", "#5AB8D4", "#67BDD7", "#74C3DA", "#81C9DC", "#8ECEDF", "#9BD4E2", "#A8DAE5"],
    ["#6D61CF","#7267D0","#786DD2","#7D73D4","#8379D6","#887FD8","#8E85DA","#948BDB","#9991DD","#9F97DF"],
    ["#CE6293","#D16D9B","#D579A3","#D985AB","#DC91B3","#E09DBB","#E4A9C3","#E7B5CB","#EBC1D3","#EFCDDC"],
    ["#EF4149","#F05057","#F25F66","#F46F75","#F67E84","#F78E92","#F99DA1","#FBADB0","#FDBCBF","#FFCCCE"]
  ];

class GroupedTreeMap{

	clean(){
		for(var s=0; s<4;s++){
		  d3.select("#"+this.id+"-"+s).select("svg").selectAll("*").remove();

			  d3.select("#"+this.id+"-"+s).select("svg")
		    .append("g")
		    .attr("transform", "translate("+ this.margin.left + ","+ this.margin.top+")");
		}
	}



	drawChart(tags, num, c){


  var color_num = (gradient[0].indexOf(c) != -1 ? 0: 
  (gradient[1].indexOf(c) != -1 ? 1: 
  (gradient[2].indexOf(c) != -1 ? 2: 3)));
  

  	var svg = d3.select("#shelves-chart-"+num).select("svg").select("g");
    var width = this.w;
    var height = this.h;

  var fader = function(color) { return d3.interpolateRgb(color, "#fff")(0.2); },
      format = d3.format(",d");

  var treemap = d3.treemap()
      .tile(d3.treemapDice)
      .size([width, height])
      .round(false)
      .paddingInner(1);

  var data = {
    id : 'book_shelf',
    name : 'Book Shelf',
    children : tags.map(function(tag,i){
      return { id: tag.tag_id, name:tag.tag_name, size:tag.count }
    })
  }

  var root = d3.hierarchy(data)
      .eachBefore(function(d) { d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; })
      .sum(function(d) {  return Math.log(d.size/12) })
      .sort(function(a, b) { return b.height - a.height || b.value - a.value; })
      
  treemap(root);

  var cell = svg.selectAll("g")
    .data(root.leaves())
    .enter().append("g")
      .attr("transform", function(d) { return "translate(" + d.x0 + ","  +d.y0 + ")"; });

  cell.append("rect")
      .attr("id", function(d) { return d.data.id; })
      .attr("width", function(d) { return d.x1 - d.x0; })
      .attr("height", height)//function(d) { return d.y1 - d.y0; })
      .attr("fill", function(d,i) { return gradient[color_num][i]; })
      .on("click", function(d,i) {
        if(selectedShelf.length===1){
          selectedShelf = [];
          d3.select("#filter-info").select("svg").selectAll(".tag").remove();
          dataset = unfilteredDataset;
          filterByAvgRating(20);
          booksWithShelf = [];
        }
        selectedShelf.push({tag_id: tags[i].tag_id, tag_name: tags[i].tag_name});

        //draws in the label svg 
        selectedShelfLabel(tags[i].tag_name)
        // filters dataset by selected shelf
        booksWithShelf = tags_dataset.filter(tag=>tag.tag_id===tags[i].tag_id)
        .map(function(tag){ return  tag.goodreads_book_id;})

        filterByShelf();
        
        var current_cluster_id = selectedCluster.datum().cluster_id;
        currentSelection = []
        for (index = 0; index < selectedCircles.length; index++) {
            if(selectedCircles[index].circle.datum().cluster_id == current_cluster_id) 
              currentSelection.push(selectedCircles[index]);
        }
        bubbleChart.drawChart(dataset, selectedCluster.datum().title, currentSelection);
        bubbleEvents();
        
      })
      .on('mouseover', function (d){
          var color = d3.color(d3.select(this).style("fill")).darker(0.8);
          d3.select(this).style("fill", color);
          console.log(d);
          var div_tooltip = d3.select("body").select("#tooltip-shelves");
		    div_tooltip.transition()
		    .duration(200)
		    .style("opacity", 1)
		    .style("background-color", color);
		    div_tooltip.html("Shelved "+ d.data.size +" times")
		    .style("left", (d3.event.pageX) + "px")
		    .style("top", (d3.event.pageY - 28) + "px");
      })
      .on('mouseout', function(d){
          var color = d3.color(d3.select(this).style("fill")).brighter(0.8);
          d3.select(this).style("fill", color);

           d3.select("body").select("#tooltip-shelves").transition()
	      .duration(500)
	      .style("opacity", 0);
	      });

  cell.append("text")
      .attr('transform','translate(0,'+(height-5)+')rotate(-90)')
      .style("text-anchor", "start")
    .selectAll("tspan")
      .data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
    .enter().append("tspan")
    .attr("class", "shelf-name")
      .attr("x", 0)
      .attr("y", function(d, i) { return 13 + i * 10; })
      .text(function(d) { return d.length > 12? d.substring(0, 12)+"...": d;}); 
      

	}

	constructor(){

		this.div_w=600;
		this.div_h=100;
		this.id="shelves-chart";
  		this.margin = {top: 10, right: 10, bottom: 10, left: 10};
  		this.w = this.div_w - this.margin.left - this.margin.right;
  		this.h = this.div_h - this.margin.top - this.margin.bottom;
  		for(var s=0; s<4;s++){
			d3.select("#"+this.id+"-"+s)
	        .append("svg")
	        .attr("width", this.div_w)
	        .attr("height", this.div_h)
	        .append("g")
	        .attr("transform", "translate("+ this.margin.left + ","+this.margin.top+")");
    	}

		d3.select("body").append("div")
		.attr("class", "tooltip")
		.attr("id", "tooltip-shelves")
		.style("opacity", 0);

	}
}