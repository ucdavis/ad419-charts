import * as d3 from "d3";
import * as geo from "d3-geo";
import * as topojson from "topojson";
import { Polygon, Point } from "geojson";
import { Selection } from "d3-selection";
import { DragContainerElement } from "d3";

import { getCategories, getSelectedCategory, onSelectedCategoryChanged } from "./data";

const data = require("./map-data.json") as geo.ExtendedFeatureCollection<geo.ExtendedFeature<Point, any>>;
const state_data = require("./map-geo.json") as geo.ExtendedFeature<Polygon, any>;
const counties_data = require("./map-counties-ca-topo.json") as topojson.Topology;

const categories = getCategories();

const chartSelector = "#map";
const width = 800;
const height = 800;

const iconSize = 38;
const iconCircleSize = 70;
const zoomFactor = 1.1;

// create projection translation
const projection = geo.geoMercator()
    .center([-122, 38.5])
    .scale(3500)
    .translate([175, 250]);

// setup icons
const iconImages = require("../media/mapicons").default;
const iconsData: any[] = [
    {
        svg: iconImages.bigwater,
        lat: 35.31,
        lng: -118.94,
        title: "ground water banking",
        pi: "Helene Dahike",
        categoryKey: "ENV",
    }, {
        svg: iconImages.brain,
        lat: 40.56,
        lng: -116.64,
        title: "human development",
        pi: "Jay Belsky",
        categoryKey: "HUMAN",
    }, {
        svg: iconImages.cow,
        lat: 38.70,
        lng: -116.22,
        title: "animal genetics",
        pi: "Alison Van Eenennaam",
        categoryKey: "AG",
    }, {
        svg: iconImages.crab,
        lat: 36.15,
        lng: -122.86,
        title: "animal science",
        pi: "Anne Todgham",
        categoryKey: "ENV",
    }, {
        svg: iconImages.dna,
        lat: 36.70,
        lng: -118.01,
        title: "animal genetics",
        pi: "Juan Medrano",
        categoryKey: "AG",
    }, {
        svg: iconImages.droplets,
        lat: 40.8361,
        lng: -121.30,
        title: "precision irrigation",
        pi: "Shrinivasa Upadhyaya",
        categoryKey: "AG",
    }, {
        svg: iconImages.grapes,
        lat: 39.38,
        lng: -122.44,
        title: "powdery mildew",
        pi: "Dario Cantu",
        categoryKey: "AG",
    }, {
        svg: iconImages.kids,
        lat: 33.27,
        lng: -119.44,
        title: "child development",
        pi: "Lean Hibel",
        categoryKey: "HUMAN",
    }, {
        svg: iconImages.leaf,
        lat: 34.02,
        lng: -115.49,
        title: "crop breeding",
        pi: "Charlie Brummer",
        categoryKey: "AG",
    }, {
        svg: iconImages.marsh,
        lat: 38.29,
        lng: -123.97,
        title: "wetland ecology and conservation",
        pi: "John Eadie",
        categoryKey: "ENV",
    }, {
        svg: iconImages.milk,
        lat: 34.80,
        lng: -121.56,
        title: "animal science",
        pi: "Ed DePeters",
        categoryKey: "AG",
    }, {
        svg: iconImages.orangeslice,
        lat: 34.87,
        lng: -117.00,
        title: "citrus greening disease",
        pi: "Carolyn Slupsky",
        categoryKey: "AG",
    }, {
        svg: iconImages.seed,
        lat: 39.67,
        lng: -118.71,
        title: "seed biotechnology",
        pi: "Kent Bradford",
        categoryKey: "AG",
    }, {
        svg: iconImages.strawberry,
        lat: 36.83,
        lng: -120.52,
        title: "strawberry breeding",
        pi: "Steve Knapp",
        categoryKey: "AG",
    }, {
        svg: iconImages.tree,
        lat: 41.02,
        lng: -123.43,
        title: "plant pathology",
        pi: "Dave Rizzo",
        categoryKey: "ENV",
    }, {
        svg: iconImages.wineglass,
        lat: 38.66,
        lng: -120.5943,
        title: "sustainable wine production",
        pi: "David Block",
        categoryKey: "AG",
    },
];

iconsData.forEach(icon => {
    const location = projection([icon.lng, icon.lat]) || [0, 0];
    icon.left = location[0];
    icon.top = location[1];
    icon.categoryIndex = categories.findIndex(c => c.key == icon.categoryKey);
    icon.categoryColor = categories[icon.categoryIndex].color;
});


const path = geo.geoPath()
    .projection(projection);

const svg = d3.select(chartSelector)
    .insert("svg:svg", "h2")
    .attr("width", width)
    .attr("height", height);

const states = svg.append("svg:g")
    .attr("id", "states")
    .attr("fill", "#B2C8DA")
    .attr("stroke", "#fff");

const counties = svg.append("svg:g")
    .attr("id", "counties")
    .attr("fill", "#B2C8DA")
    .attr("stroke", "#fff");

const icons = svg.append("svg:g")
    .attr("id", "icons")
    .selectAll("g")
    .data(iconsData)
    .enter()
    .append("svg:g");

// icon circle shadow
const iconCircles = icons
    .append("svg:g")
    .html(iconImages.circle)
    .select("svg")
    .attr("class", "circle")
    .attr("x", d => d.left - (iconCircleSize / 2))
    .attr("y", d => d.top - (iconCircleSize / 2))
    .attr("width", iconCircleSize)
    .attr("height", iconCircleSize)
    .attr("fill", "#fff");

// icon symbols
const iconSvgs = icons
    .append("svg:g")
    .html(d => d.svg)
    .select("svg")
    .attr("class", "icon")
    .attr("x", d => d.left - (iconSize / 2))
    .attr("y", d => d.top - (iconSize / 2))
    .attr("width", iconSize)
    .attr("height", iconSize)
    .attr("fill", d => d.categoryColor);

states.selectAll("path")
    .data([state_data] as any)
    .enter().append("svg:path")
    .attr("d", path as any);

counties.selectAll("path")
    .data(topojson.feature(counties_data, counties_data.objects.counties as topojson.GeometryCollection).features)
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

// mouse over tooltip
const tooltip = d3
  .select(chartSelector)
  .append<HTMLElement>("div")
  .attr("class", "chart-tooltip hidden")
  .attr("dy", 1);

// build tooltip
tooltip.append("div").attr("class", "department");
tooltip.append("div").attr("class", "project");
tooltip.append("div").attr("class", "total");

// mouse overs
icons.selectAll("svg")
    .on("mouseover", function (d: any, i) {

        const element = d3.select(this as Element).node();
        console.log(element);
        if (!element) return;
        const parent = element.parentElement;
        if (!parent) return;
        const g =  parent.parentElement;
        if (!g) return;

        d3.select(g)
            .select(".circle")
            .transition()
            .duration(100)
            .attr("x", (d: any) => d.left - (iconCircleSize * zoomFactor / 2))
            .attr("y", (d: any) => d.top - (iconCircleSize * zoomFactor / 2))
            .attr("width", iconCircleSize * zoomFactor)
            .attr("height", iconCircleSize * zoomFactor);

        d3.select(g)
            .select(".icon")
            .transition()
            .duration(100)
            .attr("x", (d: any) => d.left - (iconSize * zoomFactor / 2))
            .attr("y", (d: any) => d.top - (iconSize * zoomFactor / 2))
            .attr("width", iconSize * zoomFactor)
            .attr("height", iconSize * zoomFactor);

        // setup tooltip text
        // tooltip.attr("data-topic", category.key);

        // tooltip.select(".department")
        //     .text(project.name);

        // tooltip.select(".project")
        //     .text(project.name);

        // tooltip.select(".total")
        //     .text(`$${ (project.total / 1000000).toFixed(1) }M`);

        // move mouseover tooltip
        tooltip
            .classed("hidden", false)
            .style("left", d.left)
            .style("top", d.top - (iconCircleSize / 2));
    })
    .on("mouseout", function() {

        const element = d3.select(this as Element).node();
        if (!element) return;
        const parent = element.parentElement;
        if (!parent) return;
        const g =  parent.parentElement;
        if (!g) return;

        d3.select(g)
            .select(".circle")
            .transition()
            .duration(100)
            .attr("x", (d: any) => d.left - (iconCircleSize / 2))
            .attr("y", (d: any) => d.top - (iconCircleSize / 2))
            .attr("width", iconCircleSize)
            .attr("height", iconCircleSize);

        d3.select(g)
            .select(".icon")
            .transition()
            .duration(100)
            .attr("x", (d: any) => d.left - (iconSize / 2))
            .attr("y", (d: any) => d.top - (iconSize / 2))
            .attr("width", iconSize)
            .attr("height", iconSize);

        // hide tooltip
        tooltip
            .classed("hidden", true);
    });

// category change
onSelectedCategoryChanged(() => {
    const selectedCategory = getSelectedCategory();
});

// drag
// icons.call(
//     d3.drag()
//         .container(svg.node() as DragContainerElement)
//         .subject(function() {
//             return this;
//         })
//         .on("drag", () => {
//             console.log("draging");
//             // console.log(d3.event);
//             d3.select(d3.event.subject)
//               .select(".circle")
//                 .attr("x", d3.event.x - 25)
//                 .attr("y", d3.event.y - 25);

//             console.log(projection.invert([d3.event.x, d3.event.y]));
//         }));