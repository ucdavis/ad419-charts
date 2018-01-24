import * as d3 from "d3";
import * as geo from "d3-geo";
import { Polygon, Point } from "geojson";
import { Selection } from "d3-selection";

const data = require("./map-data.json") as geo.ExtendedFeatureCollection<geo.ExtendedFeature<Point, any>>;
const state_data = require("./map-geo.json") as geo.ExtendedFeature<Polygon, any>;
const counties_data = require("./map-counties.json") as geo.ExtendedFeatureCollection<geo.ExtendedFeature<Polygon, any>>;

const selector = "#map";
const width = 500;
const height = 600;

// create projection translation
const projection = geo.geoMercator()
    .center([-121, 38])
    .scale(2500)
    .translate([175, 250]);

const path = geo.geoPath()
    .projection(projection);

const svg = d3.select(selector)
    .insert("svg:svg", "h2")
    .attr("width", width)
    .attr("height", height);

const states = svg.append("svg:g")
    .attr("id", "states")
    .attr("fill", "#ccc")
    .attr("stroke", "#fff");

const counties = svg.append("svg:g")
    .attr("id", "counties")
    .attr("fill", "#ccc")
    .attr("stroke", "#fff");

const circles = svg.append("svg:g")
    .attr("id", "circles");

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

states.selectAll("path")
    .data([state_data] as any)
    .enter().append("svg:path")
    .attr("d", path as any);

counties.selectAll("path")
    .data(counties_data.features.filter(f => f.properties.STATE === "06"))
    .enter().append("svg:path")
    .attr("d", path as any)
    .attr("stroke-dasharray", function() {
        const len = (this as SVGPathElement).getTotalLength();
        return `${len} ${len}`;
    })
    .attr("stroke-dashoffset", function() {
        return (this as SVGPathElement).getTotalLength();
    });

// load in animation
counties.selectAll("path")
    .transition()
    .duration(3000)
    .attr("stroke-dashoffset", 0);

const positions = data.features
    .map(f => projection([f.geometry.coordinates[0], f.geometry.coordinates[1]]) || [0, 0]);

// initial setup
circles.selectAll("circle")
    .data(data.features as any)
    .enter().append("svg:circle")
    .attr("fill", "#004B85")
    .attr("fill-opacity", "0.8")
    .attr("cx", (d, i) => { return positions[i][0]; })
    .attr("cy", (d, i) => { return positions[i][1]; })
    .attr("r", 0);

// load in animation
circles.selectAll("circle")
    .transition()
    .duration(3000)
    .delay(() => { return Math.random() * 3000 + 500; })
    .ease(d3.easeElasticInOut)
    .attr("r", (d: any) => { return d.properties.Name.length; });

// mouse overs
circles.selectAll("circle")
    .on("mouseover", function (d: any, i) {

        d3.select(this as Element)
            .transition()
            .duration(200)
            .attr("r", (d: any) => { return d.properties.Name.length * 1.5; });

        tooltip.transition()
            .duration(200)
            .style("opacity", .9);

        tooltip.html(d.properties.Name)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        d3.select(this as Element)
            .transition()
            .duration(1000)
            .attr("r", (d: any) => { return d.properties.Name.length; });

        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });