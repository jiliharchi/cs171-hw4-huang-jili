
var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var width = 1060 - margin.left - margin.right;
var height = 800 - margin.bottom - margin.top;
var centered;

var bbVis = {
    x: 100,
    y: 10,
    w: width - 100,
    h: 300
};

var detailVis = d3.select("#detailVis").append("svg").attr({
    width:400,
    height:200
})

var canvas = d3.select("#vis").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
    })

var svg = canvas.append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    });


var projection = d3.geo.albersUsa().translate([width / 2, height / 2]);//.precision(.1);
var path = d3.geo.path().projection(projection);


var dataSet = {};
var DataFin = [];

var tip = d3.tip()
  .attr("class", "d3-tip")
  .offset([-10, 0])
  .html(function(d) {
    return "<span style='color:red'>" + d.STATION + "</span>";
  })







svg.call(tip);
// ZOOMING
function ZOOMING(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  svg.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  svg.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}



function loadStats() {

    d3.json("../data/reducedMonthStationHour2003_2004.json", function(error,data){
      completeDataSet= data;
      
      for(i=0;i<completeDataSet.length;i++){
        if (completeDataSet[i][0]){
        DataFin.push(completeDataSet[i][0]);
       }
      }
       loadStations();
    })
}



function loadStations() {
    d3.csv("../data/NSRDB_StationsMeta.csv",function(error,data){
    
    console.log(data[0])
console.log(DataFin[0])

    var allCircle = svg.selectAll("circle")
                       .data(data)
                       .enter()
                       .append("circle")
                       .on('mouseover', tip.show)
                       .on('mouseout', tip.hide)
                       .attr("transform", function(d){ return "translate(" + projection([d["NSRDB_LON(dd)"], d["NSRDB_LAT (dd)"]])+")";})
                       .attr("id", function(d){return d.USAF;})
                       .attr("r", function(d){
                            for(i=0;i<DataFin.length;i++){
                              if (d.USAF==DataFin[i].id){
                                return DataFin[i].sum/10000000;
                              }
                              }
                            })
                       .style("fill", "blue")
                       .on("click", updateDetailVis);
           
    });
}






d3.json("../data/us-named.json", function(error, data) {

    var usMap = topojson.feature(data,data.objects.states).features

     g = svg.selectAll(".country")
          .data(usMap)
          .enter().append("path")
          .attr("d", path)
          .on("click", ZOOMING);
     g.attr("id", "country");

    loadStats();
});


var createDetailVis = function(){ 
  
}


var updateDetailVis = function(d){

  var target;

  var x = d3.scale.linear()
    .range([0, 300]);

var y = d3.scale.linear()
    .range([180, 20]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("right");

  for(i=0;i<DataFin.length;i++){
     if (d.USAF==DataFin[i].id){
      target =  DataFin[i].hourly
    }
  }


x.domain(d3.extent(target, function(d) { return Number(d.key); }));
y.domain([0, d3.max(target, function(d) { return d.values; })]);


detailVis.selectAll("g")
         .remove();

detailVis.selectAll("text")
         .remove();

detailVis.append("g")
         .attr("class", "x axis")
         .attr("transform", "translate(0," + 180 + ")")
         .call(xAxis);
    
detailVis.append("g")
         .attr("class", "y axis")
         .attr("transform", "translate("+300+",0)")
         .call(yAxis);

detailVis.append("text")  
         .attr("class", "text")        
         .attr("x", 10)
         .attr("y", 10)
         .text(d.STATION);


detailVis.append("g")
         .selectAll(".bar")
         .data(target)
         .enter().append("rect")
         .attr("class", "bar")
         .attr("x", function(d) { return x( Number(d.key)); })
         .attr("width", 7)
         .attr("y", function(d) { return y(d.values); })
         .attr("height", function(d) { return 180 - y(d.values); });

}




