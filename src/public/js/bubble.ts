import * as d3 from "d3";
import * as force from "d3-force";
import * as Color from "color";
import { SimulationNodeDatum, DragContainerElement, interval } from "d3";

let data = require("./map-data.json");

data = data.features.map((f: any) => {
  return {
    value: f.properties.Name.length
  };
}) as object[];

const chartSelector = "#bubble";
const width = 500;
const height = 600;
const center = {
  x: (width / 2),
  y: (height / 2),
};

const categories = [
  {
    label: "food",
    color: "#ba0c2f",
  },
  {
    label: "human",
    color: "#c6007e",
  },
  {
    label: "plant",
    color: "#ed8800",
  },
  {
    label: "animal",
    color: "#ffcd00",
  },
  {
    label: "environment",
    color: "#78be20",
  },
  {
    label: "conservation",
    color: "#00b5e2",
  },
  {
    label: "viticulture",
    color: "#008eaa",
  },
];

let selectedCategory = -1;

// fake duplicate data
const data2: object[] = [];
for (let i = 0; i < categories.length; i++) {
    data.forEach((d: any) => {
        data2.push({
            ...d,
            value: d.value, // + (d.value * 0.5 * Math.random()),
            category: categories[i],
            categoryIndex: i,
        });
    });
}
data = data2;

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

function getTargetX(categoryIndex: number): number {
  return Math.sin(2 * Math.PI * categoryIndex / categories.length) * (width / 6)
    + center.x;
}

function getTargetY(categoryIndex: number): number {
  return Math.cos(2 * Math.PI * categoryIndex / categories.length) * (height / 6)
    + center.y;
}

function getTargetRadius(categoryIndex: number): number {
  if (categoryIndex === selectedCategory) {
    return 0;
  }

  return (width / 3);
}

// build chart
const svg: d3.Selection<Element, any, Element, any> = d3
  .select(chartSelector)
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g");

let simulation: force.Simulation<any, any>;
function buildSimulation() {

  // build forces
  simulation = force
    .forceSimulation<any, any>(data)
    .alphaDecay(1 - Math.pow(0.001, 1 / 1000))
    .force("collision", force.forceCollide((d: any) => d.value * 0.95).strength(0.8));

  if (selectedCategory >= 0) {
    // radius positioning
    simulation
      .force("r", force.forceRadial((d: any) => getTargetRadius(d.categoryIndex), center.x, center.y).strength(0.1));
  } else {
    // use x/y positioning
    simulation
      .force("x", force.forceX((d: any) => getTargetX(d.categoryIndex)).strength(0.1))
      .force("y", force.forceY((d: any) => getTargetY(d.categoryIndex)).strength(0.1));
  }

    // listen to ticks
  simulation.on("tick", () => {
    circles
      .attr("cx", (d: SimulationNodeDatum) => {
        return d.x as number;
      })
      .attr("cy", (d: SimulationNodeDatum) => {
        return d.y as number;
      });
  });
}
buildSimulation();

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
  .attr("r", (d: any, i) => {
    return d.value;
  });

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



interval(() => {
  // stop previous simulation
  simulation.stop();

  // iterate
  selectedCategory = (selectedCategory + 1) % categories.length;

  console.log("selecting new category", selectedCategory);

  // rebuild
  buildSimulation();

  // re-colorize
  circles
    .attr("fill", (d: any) => getCircleColor(d.categoryIndex));
}, 5000);