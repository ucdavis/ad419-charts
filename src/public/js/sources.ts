import * as d3 from "d3";
import * as force from "d3-force";
import * as Color from "color";
import { SimulationNodeDatum, DragContainerElement, interval, sum, timer, timeout } from "d3";
import { debounce } from "../utils/common";
import { getSources, getCategories, getSelectedCategory, onSelectedCategoryChanged, ISourceTotal, ICategory, getSourceTotals, ICategoryTotal } from "./data";

interface ISourceDatam extends ISourceTotal {
  byCategory: ICategoryDatam[];
  width: number;
  height: number;
}

interface ICategoryDatam extends ICategoryTotal, SimulationNodeDatum {
  // sourceIndex: number;
  categoryIndex: number;
}

// prepare data
let sources = getSourceTotals();
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

function getSelectedTotal(source: ISourceDatam): number {
  const selectedCategory = getSelectedCategory();
  if (selectedCategory < 0) {
    return source.total;
  }
  console.log(source, selectedCategory);
  return source.byCategory[selectedCategory].total;
}

function getTotalLabelColor(): string {
  const selectedCategory = getSelectedCategory();
  if (selectedCategory < 0) {
    return "inherit";
  }

  return Color(categories[selectedCategory].color)
    .darken(0.5)
    .hex();
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
    ...s,
    width: Math.max(3 * getCircleRadius(s.total), 75) + 50,
    height: Math.max(3 * getCircleRadius(s.total), 150) + 40,
    byCategory: s.byCategory.map((c) => {
      return {
        ...c,
        categoryIndex: categories.findIndex((x) => x.name === c.name),
      };
    }),
  };
});

// select target div
const svg = d3.select(chartSelector);

// build individual charts
const charts = svg
  .selectAll(".chart")
  .data(data)
  .enter()
  .append("div")
  .attr("class", "chart-container")
  .attr("style", (d) => `min-height:${d.height}`)
  .append("svg")
  .attr("class", "chart")
  .attr("width", (d) => d.width)
  .attr("height", "100%");

charts.each(function(sourceTotal) {

  const chart = d3.select(this as Element);

  const center = {
    x: (sourceTotal.width / 2),
    y: (sourceTotal.height / 2),
  };

  // setup circles
  const circles = chart
    .selectAll(".circle")
    .data(sourceTotal.byCategory)
    .enter()
    .append("svg:circle")
    .attr("class", "circle")
    .attr("fill", (d) => getCircleColor(d.categoryIndex))
    .attr("stroke", (d) => getCircleStroke(d.categoryIndex))
    .attr("stroke-width", "1")
    .attr("r", (d) => getCircleRadius(d.total))
    .attr("cx", center.x)
    .attr("cy", center.y);

  // add labels
  const label = chart
    .append<SVGTextElement>("text")
    .attr("class", "chart-label")
    .attr("x", center.x)
    .attr("y", 10)
    .attr("dy", "1.1em")
    // .attr("alignment-baseline", "middle")
    .attr("text-anchor", "middle")
    .text(sourceTotal.source.name);

  // word wrap label
  label.call(wrap, sourceTotal.width - 30);

  const totals = label
    .selectAll(".total-label")
    .data([sourceTotal])
    .enter()
    .append<SVGTSpanElement>("tspan")
    .attr("class", "total-label")
    .attr("x", center.x)
    .attr("y", 10)
    .attr("dy", function() {
      const count = label.selectAll("tspan").size();
      const dy = parseFloat(label.attr("dy"));
      return count * dy + "em";
    })
    .text((d) => `$${ (getSelectedTotal(d) / 1000000).toFixed(1) }M`);


  // mouse over thick border
  circles
    .on("mouseover", function() {
      d3.select(this as SVGCircleElement)
        .transition()
        .duration(100)
        .attr("stroke", "#1d1d1d")
        .attr("stroke-width", "2");
    })
    .on("mouseout", function() {
      d3.select(this as SVGCircleElement)
        .transition()
        .duration(100)
        .attr("stroke", (d: any) => getCircleStroke(d.categoryIndex))
        .attr("stroke-width", "1");
    });
});

function wrap(text: d3.Selection<SVGTextElement, any, any, any>, width: number) {
    const words: string[] = text.text().split(/\s+/).reverse();
    let word: string;
    let line: string[] = [];
    let lineNumber = 0;
    const lineHeight = 1.1; // ems
    const x = text.attr("x");
    const y = text.attr("y");
    const dy = parseFloat(text.attr("dy"));

    let tspan = text
      .text("")                           // clear existing text
      .append<SVGTSpanElement>("tspan")   // add new tspan items
      .attr("x", x)
      .attr("y", y)
      .attr("dy", dy + "em");

    while (word = words.pop() || "") {
      line.push(word);
      tspan.text(line.join(" "));

      const node = tspan.node();
      if (node !== null && node.getComputedTextLength() > width && line.length > 1) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append<SVGTSpanElement>("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
}


let simulations: d3.Simulation<ICategoryDatam, any>[] = [];
const buildSimulation = debounce(() => {
  // stop and clear simulations
  simulations.forEach(s => s.stop);
  simulations = [];

  // iterate over charts
  charts.each(function(source) {
    const element = this as Element;
    if (element === null) {
      return;
    }

    // fetch category so we can "lift" active bubbles
    const selectedCategory = getSelectedCategory();

    // calculate height from container div
    const parent = element.parentElement;
    let height = source.height;
    if (parent !== null) {
      height = parent.clientHeight;
    }
    const center = {
      x: (source.width / 2),
      y: (height / 2),
    };

    // build forces
    const simulation = force
      .forceSimulation(source.byCategory)
      .force("collision", force.forceCollide((d: ICategoryDatam) => getCircleRadius(d.total) * 0.95).strength(0.3).iterations(3))
      .force("x", force.forceX(center.x))
      .force("y", force.forceY((d: ICategoryDatam) => d.categoryIndex === selectedCategory ? center.y * 0.5 : center.y));

    // listen to ticks
    const chart = d3.select(element);
    const circles = chart.selectAll<Element, ICategoryDatam>(".circle");
    simulation.on("tick", () => {
      circles
        .attr("cx", (d) => {
          return d.x as number;
        })
        .attr("cy", (d) => {
          return d.y as number;
        });
    });

    // ease collision
    let collisionTimer: d3.Timer;
    const forceCollide = simulation.force<force.ForceCollide<ICategoryDatam>>("collision");
    if (forceCollide === undefined) return;

    const strength = forceCollide.strength();
    const endTime = 3500;
    collisionTimer = timer(elapsed => {
      const dt = elapsed / endTime;
      // half default, half exp growth
      const newStrength = (0.1 * strength) + (0.7 * Math.pow(dt, (endTime / 1000) * strength));
      forceCollide.strength(newStrength);
      if (dt >= 1.0) {
        collisionTimer.stop();
      }
    });

    simulations.push(simulation);
  });
}, 500);



timeout(buildSimulation, 500);

window.addEventListener("resize", buildSimulation);

onSelectedCategoryChanged(() => {
  // re-colorize bubbles
  charts
    .selectAll<SVGCircleElement, ICategoryDatam>(".circle")
    .attr("fill", (d: ICategoryDatam) => getCircleColor(d.categoryIndex));

  // re-colorize labels
  charts
    .selectAll<SVGTSpanElement, ISourceDatam>(".total-label")
    .attr("fill", getTotalLabelColor)
    .text((d) => `$${ (getSelectedTotal(d) / 1000000).toFixed(1) }M`);

  // move bubbles a bit
  buildSimulation();
});