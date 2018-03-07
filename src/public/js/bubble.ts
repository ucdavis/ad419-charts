import * as d3 from "d3";
import * as force from "d3-force";
import * as Color from "color";
import { SimulationNodeDatum, DragContainerElement, interval, sum, timer, timeout } from "d3";

import { getProjects, getCategories, getSelectedCategory, onSelectedCategoryChanged, IProject } from "./data";

interface IProjectDatam extends IProject, SimulationNodeDatum {
  categoryIndex: number;
}

const projects = getProjects();

const sumTotal = projects.reduce((prev, d) => prev + d.total, 0);
const maxTotal = projects.reduce((prev, d) => Math.max(prev, d.total), 0);

const chartSelector = "#bubble";
const width = 800;
const height = 800;
const center = {
  x: (width / 2),
  y: (height / 2),
};
const scale = 50;

const categories = getCategories();

// assign category index
const data: IProjectDatam[] = projects.map(p => {
  const index = categories.findIndex((c) => c.name === p.category);
  const category = categories[index];

  return {
    ...p,
    categoryIndex: index,
  };
});

// sort by total, limit
data.sort((a, b) => b.total - a.total);

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

function getTargetX(categoryIndex: number): number {
  return Math.sin(2 * Math.PI * categoryIndex / categories.length) * (width / 5)
    + center.x;
}

function getTargetY(categoryIndex: number): number {
  return Math.cos(2 * Math.PI * categoryIndex / categories.length) * (height / 5)
    + center.y;
}

function getTargetRadius(d: IProjectDatam): number {
  const selectedCategory = getSelectedCategory();
  if (selectedCategory < 0) {
    return 0;
  }

  if (d.categoryIndex === selectedCategory) {
    return 0;
  }

  return (width / 3);
}

function getStrengthMultiplier(d: IProjectDatam) {
  return 2 + (d.total / maxTotal);
}

// build chart
const svg: d3.Selection<Element, {}, Element, {}> = d3
  .select(chartSelector)
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g");

// initial setup
const circles = svg
  .append("svg:g")
  .attr("id", "circles")
  .selectAll("circle")
  .data(data)
  .enter()
  .append("svg:circle")
  .attr("fill", (d) => getCircleColor(d.categoryIndex))
  .attr("stroke", (d) => getCircleStroke(d.categoryIndex))
  .attr("stroke-width", "1")
  .attr("cx", (d) => getTargetX(d.categoryIndex))
  .attr("cy", (d) => getTargetY(d.categoryIndex))
  .attr("r", (d) => getCircleRadius(d.total));

// mouse over thick border
circles
    .on("mouseover", function() {
      d3.select<Element, IProjectDatam>(this as Element)
        .transition()
        .duration(100)
        .attr("stroke", "#1d1d1d")
        .attr("stroke-width", "2");
    })
    .on("mouseout", function() {
      d3.select<Element, IProjectDatam>(this as Element)
        .transition()
        .duration(100)
        .attr("stroke", (d) => getCircleStroke(d.categoryIndex))
        .attr("stroke-width", "1");
    });

let simulation: force.Simulation<IProjectDatam, any>;
function buildSimulation() {
  const selectedCategory = getSelectedCategory();

  // build forces
  simulation = force
    .forceSimulation<any, any>(data)
    // .alphaDecay(1 - Math.pow(0.001, 1 / 1000))
    .force("collision", force.forceCollide((d: IProjectDatam) => getCircleRadius(d.total) * 0.95).strength(0.5).iterations(3))
    .force("center", force.forceCenter(center.x, center.y));

  if (selectedCategory >= 0) {
    // use radial positioning
    simulation
      .force("r", force.forceRadial((d: IProjectDatam) => getTargetRadius(d), center.x, center.y).strength((d: IProjectDatam) => 0.1 * getStrengthMultiplier(d)));
  } else {
    // use x/y positioning
    simulation
      .force("x", force.forceX((d: IProjectDatam) => getTargetX(d.categoryIndex)).strength((d: IProjectDatam) => 0.05 * getStrengthMultiplier(d)))
      .force("y", force.forceY((d: IProjectDatam) => getTargetY(d.categoryIndex)).strength((d: IProjectDatam) => 0.05 * getStrengthMultiplier(d)));
  }

  // listen to ticks
  simulation.on("tick", () => {
    circles
      // .transition()
      // .duration(100)
      .attr("cx", (d) => {
        return d.x as number;
      })
      .attr("cy", (d) => {
        return d.y as number;
      });
  });

  // if no selected category, group items
  if (selectedCategory < 0) {
    timeout(() => {
      const forceX = simulation.force<force.ForceX<any>>("x");
      if (forceX === undefined) return;
      const forceY = simulation.force<force.ForceY<any>>("y");
      if (forceY === undefined) return;

      forceX.strength(0);
      forceY.strength(0);

      simulation.force("r", force.forceRadial(0, center.x, center.y).strength(0.1));
    }, 3000);
  }
}
buildSimulation();

let collisionTimer: d3.Timer;
function easeCollision() {
  // slowly build collision strength
  const forceCollide = simulation.force<force.ForceCollide<IProjectDatam>>("collision");
  if (forceCollide === undefined) return;

  const strength = forceCollide.strength();
  const endTime = 2000;
  collisionTimer = timer(elapsed => {
    const dt = elapsed / endTime;
    // half default, half exp growth
    const newStrength = (0.3 * strength) + (0.7 * Math.pow(dt, (endTime / 1000) * strength));
    forceCollide.strength(newStrength);
    if (dt >= 1.0) {
      collisionTimer.stop();
    }
  });
}
easeCollision();

onSelectedCategoryChanged(() => {
    // stop previous simulation
    simulation.stop();
    collisionTimer.stop();

    // rebuild
    buildSimulation();
    easeCollision();

    // re-colorize
    circles
      .attr("fill", (d) => getCircleColor(d.categoryIndex));
});
