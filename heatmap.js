var margin = {top: 50, right: 90, bottom: 200, left: 90},
    width = window.innerWidth*0.8 - margin.left - margin.right,
    height = window.innerHeight*0.8 - margin.top - margin.bottom;

gridSize = Math.floor(width / 30);

var colors=['#ffffcc','##ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026'];
var colors2=['#fff5eb',
    '#fee6ce',
    '#fdd0a2',
    '#fdae6b',
    '#fd8d3c',
    '#f16913',
    '#d94801',
    '#a63603',
    '#7f2704'];
//var gridSize = Math.floor(width/30);
var formatYear= d3.timeParse("%Y");

//  scale all the x-axis,y-axis and color
// var xscale = d3.scaleBand().range([0,width]);
// var yscale = d3.scaleTime().range([height,gridSize]);





// read data
d3.csv("earthquakes.csv").then(function(data) {
        data.forEach(function(d) {
            d.States=d.States;
            d["2010"] =+d["2010"];
            d["2011"] =+d["2011"];
            d["2012"] =+d["2012"];
            d["2013"] =+d["2013"];
            d["2014"] =+d["2014"];
            d["2015"] =+d["2015"];
            d.Category=d.Category;
        });
//   console.log(data);

        // reshape the data for next Step
        var dataset=[];
        data.forEach(function(d){
            for( var i=2010;i<=2015;i++)
            {   var object={
                year:formatYear(i),
                Range:d[i],
                Category: d.Category,
                States: d.States
            };
                dataset.push(object);

            }
        });
        // console.log(dataset);
// check the results
// var nest=d3.nest().key(function(d){return d.year;}).entries(dataset);
// var ra=nest.map(function(d){return d.key;});
// console.log(ra);
//
// // group all the data  by Category
        var nest = d3.nest()
            .key(function(d){return d.Category;})
            .entries(dataset);


        var category= nest.map(function(d){return d.key;});
//console.log(category);//check that works
        var index =0;
// //set the defalult value is " 0 to 9"
        var temp=category[0];
        category[0]=category[3];
        category[3]=temp;
//console.log(nest);
//console.log(category[0]);
//
// //create earthquake range drop down menu
        var menu = d3.select("#Dropdown");

        menu.append("select")
            .attr("id", "rangeMenu")
            .selectAll("option")
            .data(category)
            .enter()
            .append("option")
            .attr("value", function(d, i) { return i; })
            .text(function(d) { return d; });
//
//
//
//
// //function to initialize the heatmap
        function drawHeat(category){
// create a svg
            var svg = d3.select("body").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// // filter the data to get the select range
            var selected_range = nest.find(function(d) {
                return d.key == category;
            });
            console.log(selected_range);
// get value for this range
            var x_this= d3.set(selected_range.values.map(function(j) {
                return j.States;})).values();
            console.log(x_this);// the name of state
            var count_color=d3.set(selected_range.values.map(function(j) {
                return +j.Range;})).values();
            console.log(count_color);
            for(var i=0;i<count_color.length;i++){
                count_color[i]= +count_color[i];
            }


// console.log(count_color);
            var gap2=Math.floor(count_color.length/9);
// console.log(gap2);
            var stand=[];

            var min = d3.min(selected_range.values, function(d){return d.Range;}),
                max= d3.max(selected_range.values, function(d){return d.Range;}),
                gap= Math.floor((max-min)/9);
            var a=0;
            for(var i=0;i<9;i++){
                stand.push(a);
                a=a+gap;

            }
            var threshold = d3.scaleThreshold()
                .domain(stand)
                .range(colors2);
            console.log(min);
            console.log(max);
            console.log(stand);

// var colorscale = d3.scaleLinear().range(colors2)
// .domain(d3.range(min,max,gap));
            var xscale = d3.scaleBand().range([0,width]).domain(x_this);
//
// xscale.domain([xscale.domain()[0], +xscale.domain()[1] + xStep]);
            var xaxis = svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
//
//
//
// console.log(xscale);
            var yscale = d3.scaleTime().range([height,gridSize]).domain([d3.max(selected_range.values, function(d){return d.year;}),
                d3.min(selected_range.values, function(d){return d.year;})
            ]);
//  yscale.domain([yscale.domain()[0], yscale.domain()[1] + yStep]);

//set color scale


            var heatmap = svg.selectAll(".heatmap")
                .data(selected_range.values)
                .enter()
                .append("rect")
                .attr("class","heatmap")
                .attr("x", function(d) { return xscale(d.States); })
                .attr("y", function(d) { return yscale(d.year)- gridSize; })
                .attr("rx", 10)
                .attr("ry", 10)
                .attr("width",0.9*6*width/selected_range.values.length)
                .attr("height",  gridSize*2)
                .style("stroke", "white")
                //     .style("stroke-opacity", 0.06)
                .style("fill", function(d) { return threshold(d.Range); })
                .on("mouseover",function(d){
                    d3.select(this).style("stroke","black");
                    svg.append("text")
                        .attr("class","showmouse")
                        .attr("font-size","25px")
                        .attr("x",width*2/5)
                        .attr("y",-24)
                        .text(function( ){
                                return d.States+" "+d.year.getFullYear()+": "+d.Range;
                            }
                        )
                })
                .on("mouseout",function(d){
                    d3.select(this).style("stroke","white");
                    d3.selectAll(".showmouse").remove();
                })

// Set x- axis
            var xaxis = svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height*1.1 + ")");
            xaxis
                .call(d3.axisBottom(xscale))
                .selectAll("text")
                .attr("class", "label")
                .attr("x", -10)
                .attr("y",0)
                .attr("dy", ".35em")
                .attr("transform", "rotate(300)")
                .style("text-anchor", "end");

// set y-axis

            var yaxis= svg.append("g")
                .attr("class","y axis")
                .attr("transform","translate(0," +(-gridSize/4) +")")
                .call(d3.axisLeft(yscale));


//add legend
            var legend = svg.selectAll(".legend")
                .data(stand)
                .enter()
                .append("g")
                .attr("class", "legend")
                .attr("transform", function(d,i){return "translate(" +(i*80) +", "+ (height+margin.bottom/2) +")";})
                .attr("class","legend");
//
//
            legend.append("rect")
                .attr("width",80)
                .attr("height", 20 )
                .style("fill",function(d,i){
                    return colors2[i];
                });
//
            legend.append("text")
                .attr("class","label")
                .attr("x", 0)
                .attr("y", 50)
                .text(String);

            svg.append("text")
                .attr("class","legend'slabel")
                .attr("x" ,-margin.left/2)
                .attr("y", height+margin.bottom/2 +8)
                .text("Count");


        } ;
        // the end of the draw  heatmap function.
//   console.log(category[0]);
        drawHeat(category[0]);



        menu.on("change",function(){

            d3.selectAll("svg").remove(); //. remove previous
            var the_range=d3.select(this)
                .select("select")
                .property("value");
            index=+the_range;
            drawHeat(category[index]);


        });// the end of the menu update






    }
);
