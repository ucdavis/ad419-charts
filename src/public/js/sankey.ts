import * as d3 from "d3";
import { sankey as Sankey, sankeyLinkHorizontal, sankeyRight } from "d3-sankey";

const data = require("./sankey-data.json");

const chartSelector = "#chart";
const width = 1000;
const height = 500;

const svg: d3.Selection<Element, any, Element, any> = d3
  .select(chartSelector)
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g");

const formatNumber = d3.format(",.0f");
const format = function(d: number) {
    return formatNumber(d) + " TWh";
  },
  color = d3.scaleOrdinal(d3.schemeCategory10);

const sankey = Sankey()
  .nodeAlign(sankeyRight)
  .nodeWidth(15)
  .nodePadding(10)
  .extent([[1, 1], [width - 1, height - 6]]);

let link = svg
  .append("g")
  .attr("class", "links")
  .attr("fill", "none")
  .attr("stroke", "#000")
  .attr("stroke-opacity", 0.2)
  .selectAll("path");

let node = svg
  .append("g")
  .attr("class", "nodes")
  .attr("font-family", "sans-serif")
  .attr("font-size", 10)
  .selectAll("g");

sankey(data);

link = link
  .data(data.links)
  .enter()
  .append("path")
  .attr("d", sankeyLinkHorizontal() as any)
  .attr("stroke-width", function(d: any) {
    return Math.max(1, d.width);
  });

link.append("title").text(function(d: any) {
  return d.source.name + " → " + d.target.name + "\n" + format(d.value);
});

node = node
  .data(data.nodes)
  .enter()
  .append("g");

node
  .append("rect")
  .attr("x", function(d: any) {
    return d.x0;
  })
  .attr("y", function(d: any) {
    return d.y0;
  })
  .attr("height", function(d: any) {
    return d.y1 - d.y0;
  })
  .attr("width", function(d: any) {
    return d.x1 - d.x0;
  })
  .attr("fill", function(d: any) {
    return color(d.name.replace(/ .*/, ""));
  })
  .attr("stroke", "#000");

node
  .append("text")
  .attr("x", function(d: any) {
    return d.x0 - 6;
  })
  .attr("y", function(d: any) {
    return (d.y1 + d.y0) / 2;
  })
  .attr("dy", "0.35em")
  .attr("text-anchor", "end")
  .text(function(d: any) {
    return d.name;
  })
  .filter(function(d: any) {
    return d.x0 < width / 2;
  })
  .attr("x", function(d: any) {
    return d.x1 + 6;
  })
  .attr("text-anchor", "start");

node.append("title").text(function(d: any) {
  return d.name + "\n" + format(d.value);
});

console.log("wat");
