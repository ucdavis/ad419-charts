import * as d3 from "d3";
import * as force from "d3-force";
import * as Color from "color";
import { SimulationNodeDatum, DragContainerElement, interval, sum, timer, timeout } from "d3";

import { getSources, getCategories, getSelectedCategory, onSelectedCategoryChanged, ISource, ICategory } from "./data";

interface ISourceDatam extends ISource {
  sourceIndex: number;
  categories: ICategoryDatam[];
  width: number;
  height: number;
}

interface ICategoryDatam extends ICategory, SimulationNodeDatum {
  sourceIndex: number;
  categoryIndex: number;
  total: number;
}

// prepare data
let sources =  getSources();
sources = sources.filter(s => s.total > 0);
sources.sort((a, b) => b.total - a.total);
sources = sources.slice(0, 15);

const sumTotal = sources.reduce((prev, d) => prev + d.total, 0);
const maxTotal = sources.reduce((prev, d) => Math.max(prev, d.total), 0);

const chartSelector = "#sources";
const scale = 80;

const categories = getCategories();

function getCircleColor(index: number): string {
  const defaultColor = "#C7C8CC";

  const selectedCategory = getSelectedCategory();
  if (selectedCategory < 0) {
    return categories[index].color || defaultColor;
  }

  if (index === selectedCategory) {
      return categories[index].color || defaultColor;
  }

  return defaultColor;
}

function getCircleStroke(index: number): string {
  return Color(categories[index].color)
    .darken(0.5)
    .hex();
}

function getCircleRadius(total: number): number {
  return Math.sqrt(total) / scale;
}

const targetHeights = [100, 150, 200, 300];
function getTargetHeight(total: number): number {
  const result = 3.5 * getCircleRadius(total);

  for (let i = 0; i < targetHeights.length; i++) {
    const target = targetHeights[i];
    if (target > result) return target;
  }

  return result;
}

// tranform data into datams
const data: ISourceDatam[] = sources.map((s, i) => {
  return {
    name: s.name,
    total: s.total,
    sourceIndex: i,
    width: Math.max(3 * getCircleRadius(s.total), 75),
    height: getTargetHeight(s.total),
    categories: s.categories.map((c) => {
      return {
        name: c.name,
        total: c.total || 0,
        sourceIndex: i,
        categoryIndex: categories.findIndex((x) => x.name === c.name),
      };
    }),
  };
});

// select target div
const svg = d3.select(chartSelector);

// build individual charts
const charts = svg
  .selectAll(".source-chart")
  .data(data)
  .enter()
  .append("svg")
  .attr("class", "chart")
  .attr("width", (d) => d.width)
  .attr("height", (d) => d.height);



charts.each(function(source) {
  const center = {
    x: (source.width / 2),
    y: (source.height / 2),
  };

  const chart = d3.select(this as Element);

  // setup circles
  const circles = chart
    .selectAll(".circle")
    .data(source.categories)
    .enter()
    .append("svg:circle")
    .attr("fill", (d) => getCircleColor(d.categoryIndex))
    .attr("stroke", (d) => getCircleStroke(d.categoryIndex))
    .attr("stroke-width", "1")
    .attr("r", (d) => getCircleRadius(d.total));

  // add labels
  const label = chart
    .append("text")
    .attr("class", "chart-label")
    .attr("x", center.x)
    .attr("y", 20)
    .attr("alignment-baseline", "middle")
    .attr("text-anchor", "middle")
    .text(source.name);

  // mouse over thick border
  circles
    .on("mouseover", function() {
      d3.select(this as Element)
        .transition()
        .duration(100)
        .attr("stroke", "#1d1d1d")
        .attr("stroke-width", "2");
    })
    .on("mouseout", function() {
      d3.select(this as Element)
        .transition()
        .duration(100)
        .attr("stroke", (d: any) => getCircleStroke(d.categoryIndex))
        .attr("stroke-width", "1");
    });

  // build forces
  const simulation = force
    .forceSimulation(source.categories)
    .force("collision", force.forceCollide((d: ICategoryDatam) => getCircleRadius(d.total) * 0.95).strength(0.5).iterations(3))
    .force("center", force.forceCenter(center.x, center.y))
    .force("x", force.forceX(center.x))
    .force("y", force.forceY(center.y));

  // listen to ticks
  simulation.on("tick", () => {
    circles
      .attr("cx", (d) => {
        return d.x as number;
      })
      .attr("cy", (d) => {
        return d.y as number;
      });
  });
});

