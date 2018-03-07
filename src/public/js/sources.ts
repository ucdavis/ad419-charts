import * as d3 from "d3";
import * as force from "d3-force";
import * as Color from "color";
import { SimulationNodeDatum, DragContainerElement, interval, sum, timer, timeout } from "d3";

import { getSources, getCategories, getSelectedCategory, onSelectedCategoryChanged, ISource, ICategory } from "./data";

interface ISourceDatam extends ISource {
  sourceIndex: number;
  categories: ICategoryDatam[];
  width: number;
}

interface ICategoryDatam extends ICategory, SimulationNodeDatum {
  sourceIndex: number;
  categoryIndex: number;
  total: number;
}

let sources =  getSources();
sources = sources.filter(s => s.total > 0);
sources.sort((a, b) => b.total - a.total);
sources = sources.slice(0, 15);

const sumTotal = sources.reduce((prev, d) => prev + d.total, 0);
const maxTotal = sources.reduce((prev, d) => Math.max(prev, d.total), 0);

const chartSelector = "#sources";
const columns = 5;
const rows = Math.ceil(sources.length / columns);
const width = 1200;
const height = 800;
const center = {
  x: (width / 2),
  y: (height / 2),
};
const scale = 100;

const categories = getCategories();

// tranform data into datams
const data: ISourceDatam[] = sources.map((s, i) => {
  return {
    name: s.name,
    total: s.total,
    sourceIndex: i,
    width: 2 * getCircleRadius(s.total),
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

function getCircleRadius(total: number) {
  return Math.sqrt(total) / scale;
}

function getTargetX(sourceIndex: number) {
  return width * ((sourceIndex % columns) + 0.5) / columns;
}

function getTargetY(sourceIndex: number) {
  return height * (Math.floor(sourceIndex / columns) + 0.5) / rows;
}

function getStrengthMultiplier(d: any) {
  return 2; // + (d.total / maxTotal);
}

// build total chart
const svg = d3.select(chartSelector)
  .append("svg")
  .attr("class", "chart")
  .attr("width", width)
  .attr("height", height);

// build individual charts
const charts = svg
  .selectAll(".chart")
  .data(data)
  .enter()
  .append("g");

// add labels
charts.append("text")
  .attr("x", (d) => getTargetX(d.sourceIndex))
  .attr("y", (d) => getTargetY(d.sourceIndex) - (0.4 * height / rows))
  .text((d) => d.name);

// setup circles
const circles = charts
  .selectAll(".circle")
  .data((d) => d.categories as ICategoryDatam[])
  .enter()
  .append("svg:circle")
  .attr("fill", (d) => getCircleColor(d.categoryIndex))
  .attr("stroke", (d) => getCircleStroke(d.categoryIndex))
  .attr("stroke-width", "1")
  .attr("r", (d) => getCircleRadius(d.total));

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
  .forceSimulation(data.reduce((prev, s) => { return prev.concat(s.categories); }, [] as ICategoryDatam[]))
  .force("collision", force.forceCollide((d: ICategoryDatam) => getCircleRadius(d.total) * 0.95).strength(0.5).iterations(3))
  .force("center", force.forceCenter(center.x, center.y))
  .force("x", force.forceX((d: ICategoryDatam) => getTargetX(d.sourceIndex)))
  .force("y", force.forceY((d: ICategoryDatam) => getTargetY(d.sourceIndex)));


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
