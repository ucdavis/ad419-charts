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
  categoryIndex: number;
}

// prepare data
const sourceTotals = getSourceTotals()
  .filter(source => source.total > 0)
  .sort((a, b) => b.total - a.total);
const sources = sourceTotals.slice(0, 15);

const sumTotal = sources.reduce((prev, d) => prev + d.total, 0);
const maxTotal = sources.reduce((prev, d) => Math.max(prev, d.total), 0);

const chartSelector = "#sources";
export const scale = 80;

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

function getSelectedTotal(source: ISourceTotal): number {
  const selectedCategory = getSelectedCategory();
  if (selectedCategory < 0) {
    return source.total;
  }
  return source.byCategory[selectedCategory].total;
}

function getTotalLabelColor(): string {
  const selectedCategory = getSelectedCategory();
  if (selectedCategory < 0) {
    return "inherit";
  }

  return categories[selectedCategory].color;
}

interface IContributorSummary {
  name: string;
  total: number;
}

const sourceContributorNames = d3.selectAll("#source-top-contributors .source-contributor-name-text");
const sourceContributorTotals = d3.selectAll("#source-top-contributors .source-contributor-total");
const sourceTotal = d3.select("#source-total");

function updateTopContributors() {
  const contributors: IContributorSummary[] = sourceTotals
    .map(source => ({
      name: source.source.name,
      total: getSelectedTotal(source),
    }))
    .filter(source => source.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  sourceContributorNames
    .data(contributors)
    .text(contributor => contributor.name);
  sourceContributorTotals
    .data(contributors)
    .text(contributor => `$${(contributor.total / 1000000).toFixed(1)}M`)
    .style("color", getTotalLabelColor());
  sourceTotal.style("color", getTotalLabelColor());
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
  const result = 3 * getCircleRadius(total);

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
    height: Math.max(2.5 * getCircleRadius(s.total), 50) + 40,
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
  .append<HTMLDivElement>("div")
  .attr("class", "chart-container relative flex min-h-56 min-w-0 flex-col justify-between bg-base-100 px-5 pt-5 pb-4");



charts.each(function(sourceTotal) {

  const chart = d3.select(this);

  const center = {
    x: (sourceTotal.width / 2),
    y: (sourceTotal.height / 2),
  };

  // add labels
  const label = chart
    .append<HTMLDivElement>("div")
    .attr("class", "chart-label text-center text-base font-semibold tracking-wide text-base-content")
    .text(sourceTotal.source.name);

  // add totals
  const totals = label
    .selectAll(".total-label")
    .data([sourceTotal])
    .enter()
    .append<HTMLDivElement>("div")
    .attr("class", "total-label mt-1 text-2xl leading-none font-bold")
    .text(`$${ (getSelectedTotal(sourceTotal) / 1000000).toFixed(1) }M`);

  // create svg element
  const svg = chart.append<SVGElement>("svg")
    .attr("class", "chart mx-auto block h-auto max-w-full")
    .attr("width", sourceTotal.width)
    .attr("height", sourceTotal.height)
    .attr("viewBox", `0 0 ${sourceTotal.width} ${sourceTotal.height}`);

  // setup circles
  const circles = svg
    .selectAll(".circle")
    .data(sourceTotal.byCategory)
    .enter()
    .append<SVGCircleElement>("svg:circle")
    .attr("class", "circle")
    .attr("fill", (d) => getCircleColor(d.categoryIndex))
    .attr("stroke", (d) => getCircleStroke(d.categoryIndex))
    .attr("stroke-width", "1")
    .attr("r", (d) => getCircleRadius(d.total))
    .attr("cx", center.x)
    .attr("cy", center.y);

  // mouse over tooltip
  const tooltip = chart
    .append<HTMLElement>("div")
    .attr("class", "chart-tooltip hidden")
    .style("min-width", "15rem");

  // build tooltip
  tooltip.append("div").attr("class", "title");
  tooltip.append("div").attr("class", "total");
  tooltip.append("div").attr("class", "percent");

  // mouse over thick border
  circles
    .on("mouseover", function(category) {
      d3.select(this)
        .transition()
        .duration(100)
        .attr("stroke", "#1d1d1d")
        .attr("stroke-width", "2");

      // setup tooltip text
      tooltip.attr("data-topic", category.key);

      tooltip.select(".title")
        .text(category.name);

      tooltip.select(".percent")
        .text((100 * category.total / sourceTotal.total).toFixed(2) + " %");

      tooltip.select(".total")
        .text(`$${ (category.total / 1000000).toFixed(1) } million`);

      // calculate tooltip position
      const chartElement = chart.node();
      let chartPosition = { left: 0, top: 0 };
      if (!!chartElement) {
        chartPosition = chartElement.getBoundingClientRect();
      }

      const svgElement = svg.node();
      let svgPosition = { left: 0, top: 0 };
      if (!!svgElement) {
        svgPosition = svgElement.getBoundingClientRect();
      }

      const circle = this as SVGCircleElement;
      const circlePosition = {
        x: circle.cx.baseVal.value + svgPosition.left - chartPosition.left,
        y: circle.cy.baseVal.value + svgPosition.top - chartPosition.top,
      };

      // move mouseover tooltip
      tooltip
        .classed("hidden", false)
        .style("left", `${circlePosition.x}px`)
        .style("top", `${circlePosition.y - 10 - getCircleRadius(category.total)}px`);
    })
    .on("mouseout", function() {
      d3.select(this as SVGCircleElement)
        .transition()
        .duration(100)
        .attr("stroke", (d: any) => getCircleStroke(d.categoryIndex))
        .attr("stroke-width", "1");

      // hide tooltip
      tooltip
        .classed("hidden", true);
    });
});

let simulations: d3.Simulation<ICategoryDatam, any>[] = [];
const buildSimulation = debounce(() => {
  // stop and clear simulations
  simulations.forEach(s => s.stop);
  simulations = [];

  // iterate over charts
  charts.each(function(source) {

    const chart = d3.select<HTMLDivElement, ISourceDatam>(this);

    // Keep every bubble inside the SVG itself, rather than using the card's
    // total height (which also includes the source label).
    const selectedCategory = getSelectedCategory();
    const center = {
      x: (source.width / 2),
      y: (source.height / 2),
    };
    const chartPadding = 4;

    function getBoundedX(category: ICategoryDatam) {
      const radius = getCircleRadius(category.total) + chartPadding;
      return Math.max(radius, Math.min(source.width - radius, category.x as number));
    }

    function getBoundedY(category: ICategoryDatam) {
      const radius = getCircleRadius(category.total) + chartPadding;
      return Math.max(radius, Math.min(source.height - radius, category.y as number));
    }

    // build forces
    const simulation = force
      .forceSimulation(source.byCategory)
      .force("collision", force.forceCollide((d: ICategoryDatam) => getCircleRadius(d.total) * 0.95).strength(0.3).iterations(3))
      .force("x", force.forceX(center.x))
      .force("y", force.forceY((d: ICategoryDatam) => {
        if (d.categoryIndex !== selectedCategory) return center.y;

        const radius = getCircleRadius(d.total) + chartPadding;
        return Math.max(radius, center.y * 0.5);
      }));

    // listen to ticks
    const circles = chart.selectAll<Element, ICategoryDatam>(".circle");
    simulation.on("tick", () => {
      circles
        .attr("cx", (d) => {
          return getBoundedX(d);
        })
        .attr("cy", (d) => {
          return getBoundedY(d);
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
updateTopContributors();

window.addEventListener("resize", buildSimulation);

onSelectedCategoryChanged(() => {
  // re-colorize bubbles
  charts
    .selectAll<SVGCircleElement, ICategoryDatam>(".circle")
    .attr("fill", (d: ICategoryDatam) => getCircleColor(d.categoryIndex));

  // re-colorize labels
  charts
    .selectAll<HTMLDivElement, ISourceDatam>(".total-label")
    .style("color", getTotalLabelColor)
    .text((d) => `$${ (getSelectedTotal(d) / 1000000).toFixed(1) }M`);

  updateTopContributors();

  // move bubbles a bit
  buildSimulation();
});
