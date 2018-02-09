import * as d3 from "d3";
import * as force from "d3-force";
import { SimulationNodeDatum, DragContainerElement } from "d3";

let data = require("./map-data.json");

data = data.features.map((f: any) => { 
    return {
        value: f.properties.Name.length
    }; }) as object[];

const chartSelector = "#chart";
const width = 1000;
const height = 500;


const svg: d3.Selection<Element, any, Element, any> = d3.select(chartSelector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g");

const simulation = force.forceSimulation(data)
    .force("x", force.forceX(width / 2).strength(0.02))
    .force("y", force.forceY(height / 2).strength(0.02))
    // .force("charge", force.forceManyBody().strength(10))
    .force("center", force.forceCenter(width / 2, height / 2))
    .force("collision", force.forceCollide((d: any) => { return d.value + 0.5; }).strength(0.5));

// initial setup
const circles = svg.append("svg:g")
    .attr("id", "circles")
    .selectAll("circle")
    .data(data)
    .enter().append("svg:circle")
    .attr("fill", "#004B85")
    .attr("fill-opacity", "0.8")
    .attr("cx", (d: SimulationNodeDatum, i) => { return d.x; })
    .attr("cy", (d: SimulationNodeDatum, i) => { return d.y; })
    .attr("r", (d: any, i) => { return d.value; });

// drag
circles.call(d3.drag()
    .on("start", (d: SimulationNodeDatum) => {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    })
    .on("drag", (d: SimulationNodeDatum) => {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    })
    .on("end", (d: SimulationNodeDatum) => {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = undefined;
        d.fy = undefined;
    }));

// listen to ticks
simulation.on("tick", () => {
    circles
        .attr("cx", (d: SimulationNodeDatum, i) => { return d.x; })
        .attr("cy", (d: SimulationNodeDatum, i) => { return d.y; });
});