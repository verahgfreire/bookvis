// abstract class
class Chart{

	constructor(div_w, div_h, id, mtop, mright, mbottom, mleft){
		this.div_w=div_w;
		this.div_h=div_h;
		this.id=id;
  		this.margin = {top: mtop, right: mright, bottom: mbottom, left: mleft};
  		this.w = this.div_w - this.margin.left - this.margin.right;
  		this.h = this.div_h - this.margin.top - this.margin.bottom;

		d3.select("#"+id)
        .append("svg")
        .attr("width", div_w)
        .attr("height", div_h)
        .append("g")
        .attr("transform", "translate("+ this.margin.left + ","+this.margin.top+")");
	}

}