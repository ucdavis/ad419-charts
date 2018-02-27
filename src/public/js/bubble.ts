import * as d3 from "d3";
import * as force from "d3-force";
import * as Color from "color";
import { SimulationNodeDatum, DragContainerElement, interval, sum, timer, timeout } from "d3";

let data: any[] = require("./projects.json");

const sumTotal = data.reduce((prev, d) => prev + d.total, 0);
const maxTotal = data.reduce((prev, d) => Math.max(prev, d.total), 0);

const chartSelector = "#bubble";
const width = 800;
const height = 800;
const center = {
  x: (width / 2),
  y: (height / 2),
};
const scale = 50;

const categories = [
  {
    name: "Animals",
    color: "#ba0c2f",
    departments: new Set(),
    total: 0,
  },
  {
    name: "Human",
    color: "#c6007e",
    departments: new Set(),
    total: 0,
  },
  {
    name: "Biology",
    color: "#ed8800",
    departments: new Set(),
    total: 0,
  },
  {
    name: "Food",
    color: "#ffcd00",
    departments: new Set(),
    total: 0,
  },
  {
    name: "Agriculture",
    color: "#78be20",
    departments: new Set(),
    total: 0,
  },
  {
    name: "Environment",
    color: "#008eaa",
    departments: new Set(),
    total: 0,
  },
  {
    name: "Viticulture",
    color: "#642667",
    departments: new Set(),
    total: 0,
  },
];

let selectedCategory = -1;

// assign departments and category
data.forEach(d => {
  const index = categories.findIndex((c) => c.name === d.category);
  const category = categories[index];

  d.category = category;
  d.categoryIndex = index;

  category.departments.add(d.dept);
  category.total += d.total;
});

// sort by total, limit
data.sort((a, b) => b.total - a.total);
// data = data.slice(0, 100);

function getCircleColor(index: number): string {
  if (selectedCategory < 0) {
    return categories[index].color;
  }

  if (index === selectedCategory) {
      return categories[index].color;
  }

  return "#C7C8CC";
}

function getCircleStroke(index: number): string {
  return Color(categories[index].color)
    .darken(0.5)
    .hex();
}

function getCircleRadius(total) {
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

function getTargetRadius(d: any): number {
  if (selectedCategory < 0) {
    return 0;
  }

  if (d.categoryIndex === selectedCategory) {
    return 0;
  }

  return (width / 3);
}

function getStrengthMultiplier(d: any) {
  return 2 + (d.total / maxTotal);
}

// build chart
const svg: d3.Selection<Element, any, Element, any> = d3
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
  .attr("fill", (d: any) => getCircleColor(d.categoryIndex))
  .attr("stroke", (d: any) => getCircleStroke(d.categoryIndex))
  .attr("stroke-width", "1")
  .attr("cx", (d: any) => getTargetX(d.categoryIndex))
  .attr("cy", (d: any) => getTargetY(d.categoryIndex))
  .attr("r", (d: any) => getCircleRadius(d.total));

// mouse over thick border
circles
    .on("mouseover", function (d: any, i) {
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

let simulation: force.Simulation<any, any>;
function buildSimulation() {

  // build forces
  simulation = force
    .forceSimulation<any, any>(data)
    // .alphaDecay(1 - Math.pow(0.001, 1 / 1000))
    .force("collision", force.forceCollide((d: any) => getCircleRadius(d.total) * 0.95).strength(0.5).iterations(3))
    .force("center", force.forceCenter(center.x, center.y));

  if (selectedCategory >= 0) {
    // use radial positioning
    simulation
      .force("r", force.forceRadial((d: any) => getTargetRadius(d), center.x, center.y).strength((d: any) => 0.1 * getStrengthMultiplier(d)));
  } else {
    // use x/y positioning
    simulation
      .force("x", force.forceX((d: any) => getTargetX(d.categoryIndex)).strength((d: any) => 0.05 * getStrengthMultiplier(d)))
      .force("y", force.forceY((d: any) => getTargetY(d.categoryIndex)).strength((d: any) => 0.05 * getStrengthMultiplier(d)));
  }

  // listen to ticks
  simulation.on("tick", () => {
    circles
      // .transition()
      // .duration(100)
      .attr("cx", (d: SimulationNodeDatum) => {
        return d.x as number;
      })
      .attr("cy", (d: SimulationNodeDatum) => {
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
  const forceCollide = simulation.force<force.ForceCollide<any>>("collision");
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

interval(() => {
  // stop previous simulation
  simulation.stop();
  collisionTimer.stop();

  // iterate
  selectedCategory = (selectedCategory + 1) % categories.length;

  console.log("selecting new category", selectedCategory);

  // rebuild
  buildSimulation();
  easeCollision();

  // re-colorize
  circles
    .attr("fill", (d: any) => getCircleColor(d.categoryIndex));
}, 5000);