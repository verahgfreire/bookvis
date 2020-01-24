var dataset, cluster_data, full_dataset, tags_dataset;
var bubbleChart, clusterChart, groupedBarChart, starPlot, groupedTreeMap;
d3.csv('csv/books_cluster.csv').row( function(d) {
  return {
    goodreads_book_id: +(d.goodreads_book_id),
    //isbn: d.isbn,
    authors: d.authors,
    original_publication_year: +(d.original_publication_year),
    title: d.title,
    average_rating: +(d.average_rating),
    number_readings: +(d.number_readings),
    ratings_1: +(d.ratings_1),
    ratings_2: +(d.ratings_2),
    ratings_3: +(d.ratings_3),
    ratings_4: +(d.ratings_4),
    ratings_5: +(d.ratings_5),
    //small_image_url: d.small_image_url,
    num_pages: +(d.num_pages),
    cluster_id: +(d.cluster_id),
    rating_group: +(d.rating_group),
    page_group: +(d.page_group)
    };
})
.get(function(data) {
      full_dataset = data;
      dataset = full_dataset;
      dataset.sort(function(a,b) {
        return a.number_readings < b.number_readings;
      });
      /*max_rating_count = d3.max(dataset, function(d) {
                         var book_ratings = [+(d.ratings_1),
                                            +(d.ratings_2),
                                            +(d.ratings_3),
                                            +(d.ratings_4),
                                            +(d.ratings_5)];
                         return +(d3.max(book_ratings));});*/
      d3.csv('csv/clusters.csv').row( function(d) {
        return {
          cluster_id: +(d.cluster_id),
          original_publication_year: +(d.original_publication_year),
          freq: +(d.freq),
          average_rating: +(d.average_rating),
          number_readings: +(d.number_readings),
          title: d.title,
          num_pages: +(d.num_pages),
          rating_group: +(d.rating_group)
          };
      })
      .get(function(data) {
          d3.csv('csv/book_tags.csv').row((d)=>{
            return {
              goodreads_book_id : +(d.goodreads_book_id),
              tag_id : +(d.tag_id),
              tag_name : d.tag_name,
              count : +(d.count)
            }
          }).get(function(tags){
            tags_dataset = tags
            cluster_data = data;
            bubbleChart = new BubbleChart();
            clusterChart = new ClusterChart(cluster_data);
            groupedBarChart = new GroupedBarChart();
            starPlot = new StarPlot();
            groupedTreeMap = new GroupedTreeMap();
            filterInfo = new FilterInfo();
            bubbleEvents();
            clusterEvents();
            groupedBarEvents();
            //gen_filterinfo();
          });
        });
});


var margin = {top:40, right:40, bottom:60, left:70};
var selectedCircles = [];
var currentSelection = [];
var selectedColors = [{color: "#33A7CC", used: false},
                      {color: "#6D61CF", used: false},
                      {color: "#CE6293", used: false},
                      {color: "#EF4149", used: false}];
var selectedCluster;
var selectedShelf = [];
var unfilteredDataset;
var filters = [];
var booksWithShelf;
var selectedPageRange;

// 1-2.4, 2.5-2.9, 3-3.4, 3.5-3.9, 4-4.4, 4.5-5
var rating_group_colors = ["#E46C34", "#F59B50", "#E4D648", "#AED367", "#6CBE78", "#168873"];
//var hoverCircle;

function opaqueSelectedCircles(){
  for (index = 0; index < selectedCircles.length; ++index){
      var goodreads_book_id = selectedCircles[index].circle.datum().goodreads_book_id;
      var color = selectedCircles[index].color;

      d3.select("#bubble-chart").select("circle[title=\'"+goodreads_book_id+"\']")
      .attr("stroke", color)
      .attr("stroke-width", 3)
      .attr("opacity", 1);
  }
}

var dispatchSelect = d3.dispatch("bookSelect");
var dispatchDeselect = d3.dispatch("bookDeselect");
var dispatchHover = d3.dispatch("bookHover");
var dispatchOut = d3.dispatch("bookOut");

var dispatchHoverBar = d3.dispatch("barHover");
var dispatchOutBar = d3.dispatch("barOut");

var dispatchSelectCluster = d3.dispatch("clusterSelect");
var dispatchDeselectCluster = d3.dispatch("clusterDeselect");
var dispatchHoverCluster = d3.dispatch("clusterHover");
var dispatchOutCluster = d3.dispatch("clusterOut");


dispatchHoverBar.on("barHover.bar-chart", function(bar){


    var hoverBar = d3.select("#grouped-bar-chart").select("svg").select("rect[title=\'"+(bar.group+"_"+bar.rating)+"\']");
    var color = d3.color(hoverBar.style("fill")).darker(0.8);
    hoverBar.style("fill", color);

    // show tooltip
    var div_tooltip = d3.select("body").select("#tooltip-bar");
    div_tooltip.transition()
    .duration(200)
    .style("opacity", .8)
    .style("background-color", color);
    div_tooltip.html(bar.count)
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY - 28) + "px");

});

dispatchOutBar.on("barOut.bar-chart", function(bar){
    var hoverBar = d3.select("#grouped-bar-chart").select("svg").select("rect[title=\'"+(bar.group+"_"+bar.rating)+"\']");
    var color = d3.color(hoverBar.style("fill")).brighter(0.8);
    hoverBar.style("fill", color);

    d3.select("body").select("#tooltip-bar").transition()
      .duration(500)
      .style("opacity", 0);
});


dispatchHoverCluster.on("clusterHover.cluster-chart", function(cluster){

  if(selectedCluster == null || (selectedCluster != null && cluster.cluster_id != selectedCluster.datum().cluster_id)){
    var hoverCluster = d3.select("#cluster-chart").select("circle[title=\'"+cluster.cluster_id+"\']");
    var hoverClusterParent = hoverCluster.select(function() { return this.parentNode; });
    hoverClusterParent.raise();
    d3.select("#cluster-chart").selectAll("circle").attr("opacity", 0.5);
    hoverCluster.attr("opacity", 1);
    if(selectedCluster) selectedCluster.attr("opacity", 1);
    var color = hoverCluster.style("fill");
  }
  var div_tooltip = d3.select("body").select("#tooltip-cluster");
        div_tooltip.transition()
        .duration(200)
        .style("opacity", 1)
        .style("background-color", color);
        div_tooltip.html(cluster.freq +" books")
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
});

dispatchSelectCluster.on("clusterSelect.cluster-chart", function(cluster){
    if(selectedCluster == null || (selectedCluster != null && cluster.cluster_id != selectedCluster.datum().cluster_id)){
      if(selectedCluster != null){
        selectedCluster.attr("stroke", "white").attr("stroke-width", 3);
      }

      selectedCluster = d3.select("#cluster-chart").select("circle[title=\'"+cluster.cluster_id+"\']");

      var color = d3.color(selectedCluster.style("fill")).darker(1);

      selectedCluster.attr("stroke", color)
                     .attr("stroke-width", 3);

      // affect bubble-chart
      dataset = full_dataset.filter(function(d) { return d.cluster_id == cluster.cluster_id; });

      var current_cluster_id = selectedCluster.datum().cluster_id;
      //console.log("cluster_id: " + current_cluster_id);
      currentSelection = []
      for (index = 0; index < selectedCircles.length; index++) {
          if(selectedCircles[index].circle.datum().cluster_id == current_cluster_id) currentSelection.push(selectedCircles[index]);
      }
      //console.log("currentSelection: " + currentSelection);
      bubbleChart.drawChart(dataset, selectedCluster.datum().title, currentSelection);
      bubbleEvents();

      //save dataset without filters to optimize vis
      unfilteredDataset = dataset;
      //Deselect Page Filter
      selectedPageRange = 0;
      // Deselect Shelf
      selectedShelf = [];
      d3.select("#filter-info").select("svg").selectAll(".tag").remove();
      // Deselect Avg Rating Filter
      filterAvgRating = 0;
      d3.selectAll(".avg_rating").style("stroke-width","0");
    }
});

dispatchDeselectCluster.on("clusterDeselect.cluster-chart", function(cluster){
    if(selectedCluster != null && cluster.cluster_id == selectedCluster.datum().cluster_id){
      selectedCluster.attr("stroke", "white")
                     .attr("stroke-width", 3);
      selectedCluster = null;

      // affect bubble-chart
      if(selectedCircles.length == 0){
        bubbleChart.drawEmpty(dataset);
      }
      else{ // draw only selected circles
        bubbleChart.drawSelected(selectedCircles);
        bubbleEvents();
      }
    }

    // Deselect Shelf
    selectedShelf = [];
    d3.select("#filter-info").select("svg").selectAll(".tag").remove();
    //Deselect Page Filter
    selectedPageRange = 0;
    // Deselect Avg Rating Filter
    filterAvgRating = 0;
    d3.selectAll(".avg_rating").style("stroke-width","0");
});

dispatchOutCluster.on("clusterOut.cluster-chart", function(cluster){
  if(selectedCluster != null && selectedCluster.datum().cluster_id != cluster.cluster_id){
    var selectedClusterParent = selectedCluster.select(function() { return this.parentNode; });
    selectedClusterParent.raise();
    var hoverCluster = d3.select("#cluster-chart").select("circle[title=\'"+cluster.cluster_id+"\']");
    hoverCluster.attr("opacity",0.5);
  }
  else if(!selectedCluster){
    // if no circles selected return all circles to opacity 1
    d3.select("#cluster-chart").selectAll("circle").attr("opacity", 1);
  }

  d3.select("body").select("#tooltip-cluster").transition()
          .duration(500)
          .style("opacity", 0);

});

dispatchSelect.on("bookSelect.bubble-chart", function(book){
  // find index of circle clicked, if not found it will be -1
  // to check if book is already selected
    var indexOf = -1;
    for (index = 0; index < selectedCircles.length; index++) {
      var circle = selectedCircles[index].circle;
      if(book.goodreads_book_id == circle.attr("title")) indexOf = index;
    }

    // if circle was not found -> new selection
    if(indexOf == -1 && selectedCircles.length < 4){

      var clicked = d3.select("#bubble-chart").select("circle[title=\'"+book.goodreads_book_id+"\']");

      var color_index = selectedColors.findIndex(x => x.used==false);
      var c = selectedColors[color_index].color;
      selectedColors[color_index].used  = true;

      clicked
      .attr("stroke", c)
      .attr("stroke-width", 3);

      selectedCircles.push({circle: clicked, color: c});
      currentSelection.push({circle: clicked, color: c});

      groupedBarChart.drawCharts(selectedCircles);
      groupedBarEvents();

      filterInfo.drawSelectedBooks();
    }
});

dispatchDeselect.on("bookDeselect.bubble-chart", function(book){
  // find index of circle clicked, if not found it will be -1
  var indexOf = -1;
  for (index = 0; index < selectedCircles.length; index++) {
    var circle = selectedCircles[index].circle;
    if(book.goodreads_book_id == circle.attr("title")) indexOf = index;
  }

  // if circle was found -> deselect
  if(indexOf != -1){

    var clicked = d3.select("#bubble-chart").select("circle[title=\'"+book.goodreads_book_id+"\']");
    //console.log("deselected: ", clicked);

    clicked
    .attr("stroke", "white")
    .attr("stroke-width", 1);

    var color = selectedCircles[indexOf].color;
    var color_index = selectedColors.findIndex(x => x.color==color);
    selectedColors[color_index].used = false;

    var circle_removed = selectedCircles.splice(indexOf, 1);
    currentSelection.splice(circle_removed, 1);

    if(selectedCluster == null){
      // remove tooltip
      d3.select("body").select("#tooltip-bubble").transition()
      .duration(500)
      .style("opacity", 0);
      bubbleChart.drawSelected(selectedCircles);
      bubbleEvents();
    }

    groupedBarChart.drawCharts(selectedCircles);
    groupedBarEvents();

    //Book Deselected label
    d3.select("#filter-info").select("svg").selectAll(".selLabel").remove();
    filterInfo.drawSelectedBooks();
  }
});

dispatchHover.on("bookHover.bubble-chart", function(book){

    var hoverCircle = d3.select("#bubble-chart").select("circle[title=\'"+book.goodreads_book_id+"\']");

    // get circle coordinates and color to draw lines to axis
    var cx = hoverCircle.attr("cx");
    var cy = hoverCircle.attr("cy");
    var color = hoverCircle.style("fill");

    // all circles with opacity 0.5, if there are selected circles they will have opacity 1
    d3.select("#bubble-chart").select("svg").selectAll("circle").attr("opacity", 0.5);
    if(currentSelection.length != 0) opaqueSelectedCircles();

    // make the hovered circle with opacity 1
    hoverCircle
    .attr("opacity", 1);

    // show tooltip
    var div_tooltip = d3.select("body").select("#tooltip-bubble");
    div_tooltip.transition()
    .duration(200)
    .style("opacity", .8)
    .style("background-color", color);
    div_tooltip.html(book.title)
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY - 28) + "px");

    // draw lines to axis and make them visible
    d3.select("#bubble-chart").select("svg").select("#line-x-axis")
      .attr("x2", cx)
      .attr("y1", cy)
      .attr("y2", cy)
      .style("stroke", color);
    d3.select("#bubble-chart").select("svg").select("#line-y-axis")
      .attr("x1", cx)
      .attr("x2", cx)
      .attr("y1", cy)
      .style("stroke", color);
});

dispatchOut.on("bookOut.bubble-chart", function(book){
    // remove tooltip
    d3.select("body").select("#tooltip-bubble").transition()
      .duration(500)
      .style("opacity", 0);

    // if no circles are selected, all circles return to opacity 1
    if((selectedCluster != null && currentSelection.length == 0) || (selectedCluster == null)) d3.select("#bubble-chart").select("svg").selectAll("circle").attr("opacity", 1);
    else{
        //console.log("RETURN TO OPACITY 1");
        //console.log(selectedCircles);
        d3.select("#bubble-chart").select("svg").selectAll("circle").attr("opacity", 0.5);
        opaqueSelectedCircles();
    }

    // remove lines to axis
    d3.select("#bubble-chart").select("svg").select("#line-y-axis")
      .style("stroke", null);
    d3.select("#bubble-chart").select("svg").select("#line-x-axis")
      .style("stroke", null);
});

function bubbleEvents() {
  bubbleChart.getBubbles()
    // left mouse click
    .on("click", function(d){
      dispatchSelect.call("bookSelect", d ,d);
    })
    // right mouse click
    .on("contextmenu", function (d, i) {
      d3.event.preventDefault();
      dispatchDeselect.call("bookDeselect", d ,d);
    })
    .on("mouseover", function(d) {
      dispatchHover.call("bookHover", d ,d);
    })
    .on("mouseout", function(d){
      dispatchOut.call("bookOut", d ,d);
    });

}

function clusterEvents(){

  clusterChart.getNodes()
    // left mouse click
    .on("click", function(d){
      dispatchSelectCluster.call("clusterSelect", d ,d);
    })
    // right mouse click
    .on("contextmenu", function (d) {
      d3.event.preventDefault();
      dispatchDeselectCluster.call("clusterDeselect", d ,d);
    })
    .on("mouseover", function(d) {
      dispatchHoverCluster.call("clusterHover", d ,d);
    })
    .on("mouseout", function(d){
      dispatchOutCluster.call("clusterOut", d ,d);
    })
}

function groupedBarEvents(){
  //console.log(groupedBarChart.getBars());

  groupedBarChart.getBars()
    .on("mouseover", function(d) {
      dispatchHoverBar.call("barHover", d, d);
    });

  groupedBarChart.getBars()
    .on("mouseout", function(d) {
      dispatchOutBar.call("barOut", d, d);
    });

}


dispatchSelect.on("bookSelect.star-plot", function(book){
      //drawStarPlot();
      starPlot.drawChart(selectedCircles);
});

dispatchDeselect.on("bookDeselect.star-plot", function(book){
    if(selectedCircles.length == 0){
        starPlot.drawEmpty();
    }
    else{
      starPlot.drawChart(selectedCircles);
    }
});

function filterByPageNumber(p){
  dataset = unfilteredDataset.filter(function(m) {
    return m.page_group === p; 
  });
}

function filterByAvgRating(avg_r){
  //if we click on a filter previously selected, deselects it!
  //if no more filters are selected, it shows all bubbles of cluster
  //if there are still filters applied, is shows bubbles of those filters
  if(filters.indexOf(avg_r)!=-1){
    filters.splice(filters.indexOf(avg_r),1);
    d3.select("#avg_rating_"+avg_r).style("stroke-width","0");
    console.log("filters",filters);
    if(filters.length ===0){
      filterAvgRating = 0;
      dataset = unfilteredDataset;
    }
    else{
      dataset = unfilteredDataset.filter(function(m) {
      return filters.indexOf(m.rating_group) !== -1;
    });
    }
  }
  //if filter is not selected, selects it and filters dataset
  else{
    filterAvgRating = 1;
    filters.push(avg_r);
    console.log(filters);

    d3.select("#avg_rating_"+avg_r).style("stroke-width","1");
    dataset = unfilteredDataset.filter(function(m) {
      return filters.indexOf(m.rating_group) !== -1;
    });
  }
}

dispatchSelect.on("bookSelect.shelves-chart", function(book){
    console.log("selectedCircles",selectedCircles);
    console.log("selected", selectedCircles[selectedCircles.length-1].circle.datum());
    console.log("length",selectedCircles.length-1);
    
    var book_id = selectedCircles[selectedCircles.length-1].circle.datum().goodreads_book_id;
    var c = selectedCircles[selectedCircles.length-1].color;
    var tags = tags_dataset.filter(tag=>tag.goodreads_book_id===book_id);//equivalente a function(tag){tag.goodreads_book_id===book_id}
    groupedTreeMap.drawChart(tags,selectedCircles.length-1,c);
});

dispatchDeselect.on("bookDeselect.shelves-chart", function(book){
  groupedTreeMap.clean();
  for(var s=0; s<selectedCircles.length;s++){
    var book_id = selectedCircles[s].circle.datum().goodreads_book_id;
    var c = selectedCircles[s].color;
    var tags = tags_dataset.filter(tag=>tag.goodreads_book_id===book_id);//equivalente a function(tag){tag.goodreads_book_id===book_id}
    groupedTreeMap.drawChart(tags,s,c);
  }
});


function filterByShelf(){
  if(typeof booksWithShelf !== 'undefined'){
    dataset = dataset.filter(function(m) {
      if(booksWithShelf.indexOf(m.goodreads_book_id) != -1) return m.goodreads_book_id;
    });
  }
}

function selectedShelfLabel(tag_name){

  d3.select("#filter-info").select("svg")
          .insert("rect")
          .attr("x", 10)
          .attr("width",25)
          .attr("height",22)
          .attr("y",370)
          .style("fill", "white")
          .style("stroke","black")
          .attr("class","tag")
          .on("click",function(){
            selectedShelf = [];
            booksWithShelf = [];
            dataset = unfilteredDataset;
            filterByAvgRating(20);
            var current_cluster_id = selectedCluster.datum().cluster_id;
            currentSelection = []
            for (index = 0; index < selectedCircles.length; index++) {
                if(selectedCircles[index].circle.datum().cluster_id == current_cluster_id) 
                  currentSelection.push(selectedCircles[index]);
            }
            bubbleChart.drawChart(dataset, selectedCluster.datum().title, currentSelection);
            bubbleEvents();
            d3.select("#filter-info").select("svg").selectAll(".tag").remove();
          })
          .on('mouseover', function (d){
            var color = d3.color(d3.select(this).style("fill")).darker(0.8);
            d3.select(this).style("fill", color);
          })
          .on('mouseout', function(d){
              var color = d3.color(d3.select(this).style("fill")).brighter(0.8);
              d3.select(this).style("fill", color);
          })

  d3.select("#filter-info").select("svg").append("text")
          .attr("x", 45)
          .attr("y", 385)
          .attr("class","tag")
          .style("fill","black")
          .text(tag_name);
}