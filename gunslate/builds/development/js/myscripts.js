var width = 1000,
	height = 600;

var path = d3.geo.path()
	.projection(null) //albersUsa projection stated in Make file when creating the topojson data

var radius = d3.scale.sqrt() 
	.domain([0, 500]) // INPUT domain-range of possible input data values
	//To avoid distortion, make sure that the minimum "domain" and "range" values are both 0
	.range([0, 60]); // OUTPUT range is the range of possible output values

var arc = d3.svg.arc()
	.outerRadius(radius)	

var svg = d3.select('body').append('svg')
	.attr('height', height)
	.attr('width', width);


var toolTip = d3.select('body')
	.append('div')
	.style('position', 'absolute')
	.style('padding', '0 10px')
	.style('background', '#fff')
	.style('opacity', 0)
	.style('font-family', 'Open Sans')
	.style('z-index', 1000);
	
var q=queue()
	q.defer(d3.json, 'js/json/poverty/us.json')
	q.defer(d3.csv,'js/json/poverty/SlateGunDeaths.csv')
	q.await(makeMyMap);

function makeMyMap(error,usa,gundeaths) {
	//console.log(gundeaths);

var deathcount=d3.nest()
.key(function(d){return d.state;})
.key(function(d){return d.city})
.key(function(d){return d.gender;})
//.entries(datta);
.entries(gundeaths);
console.log(deathcount);
console.log(usa);

	if (error) return console.log(error);
	// console.log(usa);

	//build the main land area
	svg.append('path')
		.datum(topojson.feature(usa, usa.objects.nation))
		.attr('class', 'land')
		.attr('d', path); //build our d attribute


	svg.selectAll('.states')
            // retrieve the features so that we can access the id
            .data(topojson.feature(usa, usa.objects.counties).features)
            .enter().append('path')
            .attr('id', function(d) { return d.id; })
            .attr("class", "states states-hover")
            .attr('d', path)


         //add Tool Tip
         .on('mouseover', function(d, i){
			// console.log(d);
			toolTip.transition()
			  .style('opacity', .9)
			  .style('left', (d3.event.pageX) + 'px')
			  .style('top', (d3.event.pageY) + 'px')  
			tempColor = this.style.fill; //store current color
			// d3.select(this)
			
			if(d.properties.name != null || d.properties.name != undefined){
				toolTip.html(d.properties.name + "<br/>Male:"+d.properties.males+"<br/>Female:"+d.properties.females)	
			} else {
				toolTip.html("")	
			}
		})
		.on('mouseout', function(){
			d3.select(this)
			 .transition().delay(400).duration(800)
			 .style('opacity', 1)
			 .style('fill', tempColor)
		})



	//build out internal state lines
	svg.append('path')
		.datum(topojson.mesh(usa, usa.objects.states, function(a, b) { 
			return a !== b; 
		})) //topojson.mesh
		.attr('class', 'border-states')
		.attr('d', path); 

	
	//show data as layered bubbles
	svg.append("g")
		.attr("class", "bubble")
		.selectAll("circle")
		.data(topojson.feature(usa, usa.objects.counties).features 
			/*.sort(function(a, b) { //sort population low to high
				return (b.properties.population - a.properties.population); 
			}) //sort
		) //data*/)
		.enter().append("circle") 
		.on('mouseover', function(d, i){
		d3.select(this).attr('class', 'hover')
		})
		.on('mouseout', function(d, i){
			d3.select(this).attr('class', '')
		})

		.attr("transform", function(d) { 
			return "translate(" + path.centroid(d) + ")"; //Computes the projected centroid (in pixels) for the specified feature
		})
		.attr("r", function(d)	{ 
			return radius(d.properties.males+d.properties.females); //radius var with input (domain) and output (range)
		})



} //d3.json

