var colors = ["#E46C34", "#F59B50", "#E4D648", "#AED367", "#6CBE78", "#168873"];

function cscale(r) {
	return colors[r-1];
}

class ClusterChart extends Chart {

	draw(dataset){
		var rscale = d3.scaleLinear()
					 .range([this.bubble_size.min,this.bubble_size.max])
		             .domain([d3.min(dataset, function(d) { return d.freq;}),
		                    d3.max(dataset,  function(d) { return d.freq;})]);

		var simulation = d3.forceSimulation(dataset)
		  .force('charge', d3.forceManyBody().strength(5))
		  .force('center', d3.forceCenter(this.w / 2, this.h / 2))
		  .force('collision', d3.forceCollide().radius(function(d) {
		    return rscale(d.freq)
		  }))
		  .force("x", d3.forceX())
		  .force("y", d3.forceY())
		  .on('tick', ticked);

		  function ticked(e) {
		      node.attr("transform",function(d) {
		        return "translate(" + [d.x, d.y] +")";
		      });
		  }

		var svg = d3.select("#"+this.id).select("svg").select("g");
  
		var node = svg.selectAll("circle")
			.data(dataset)
			.enter()
			.append("g")
			.attr("class", "node")
			.attr('transform', 'translate(' + [this.w / 2, this.h / 2] + ')')
			.style('opacity',1)
			.attr("title", function(d) {return d.cluster_id;});

		node
			.insert("circle")
			.attr('r', function(d){
			  return rscale(d.freq);
			})
			.attr("title", function(d) {return d.cluster_id;})
			.style("fill", function (d) { return cscale(d.rating_group);})
			.attr("stroke", "white")
			.attr("stroke-width", 3);


		node.append("text")
			.attr("dy", ".3em")
			.style("text-anchor", "middle")
			.text(function(d) { return d.title;})
			.style("opacity", 1)
			.style("fill","black");

	}

	getNodes(){
		return d3.select("#"+this.id).selectAll(".node");
	}

	constructor(dataset){
		super(400, 400, "cluster-chart", 30 , 50, 50, 65);
		this.bubble_size = {max: 80, min: 25};
  		this.draw(dataset);

  		d3.select("body").append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip-cluster")
        .style("opacity", 0);
	}
}