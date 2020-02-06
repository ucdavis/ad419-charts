import * as d3 from "d3";
import * as geo from "d3-geo";
import * as topojson from "topojson";
import { GeometryCollection, Topology } from "topojson-specification";
import { Polygon, Point } from "geojson";
import { Selection } from "d3-selection";
import { DragContainerElement } from "d3";

import { getCategories, getSelectedCategory, onSelectedCategoryChanged, setSelectedCategory } from "./data";

const data = require("./map-data.json") as geo.ExtendedFeatureCollection<geo.ExtendedFeature<Point, any>>;
const state_data = require("./map-geo.json") as geo.ExtendedFeature<Polygon, any>;
const counties_data = require("./map-counties-ca-topo.json") as Topology;

const categories = getCategories();

const chartSelector = "#map";
const width = 800;
const height = 800;

const iconSize = 38;
const iconCircleSize = 70;
const zoomFactor = 1.1;

interface IIconData {
    svg: string;
    lat: number;
    lng: number;
    title: string;
    department: string;
    director: string;
    categoryKey: string;

    left?: number;
    top?: number;
    categoryIndex?: number;
    categoryColor?: string;
}

// create projection translation
const projection = geo.geoMercator()
    .center([-122, 38.5])
    .scale(3500)
    .translate([175, 250]);

// setup icons
const iconImages = require("../media/mapicons").default;
const iconsData: IIconData[] = [
    {
        svg: iconImages.bigwater,
        lat: 36.70,
        lng: -119.41,
        title: "Groundwater Banking",
        department: "Department of Land, Air and Water Resources",
        director: "Helen Dahlke",
        categoryKey: "ENV",
    }, {
        svg: iconImages.brain,
        lat: 34.41,
        lng: -120.02,
        title: "Human Development",
        department: "Department of Human Ecology",
        director: "Jay Belsky",
        categoryKey: "HUMAN",
    }, {
        svg: iconImages.cow,
        lat: 36.03,
        lng: -116.09,
        title: "Animal Genetics",
        department: "Department of Animal Science",
        director: "Alison Van Eenennaam",
        categoryKey: "AG",
    }, {
        svg: iconImages.crab,
        lat: 37.81,
        lng: -122.64,
        title: "Animal Science",
        department: "Department of Animal Science",
        director: "Anne Todgham",
        categoryKey: "ENV",
    }, {
        svg: iconImages.dna,
        lat: 36.70,
        lng: -118.01,
        title: "Animal Genetics",
        department: "Department of Animal Science",
        director: "Juan Medrano",
        categoryKey: "AG",
    }, {
        svg: iconImages.droplets,
        lat: 40.8361,
        lng: -121.30,
        title: "Precision Irrigation",
        department: "Department of Biological and Agricultural Engineering",
        director: "Shrinivasa Upadhyaya",
        categoryKey: "AG",
    }, {
        svg: iconImages.grapes,
        lat: 39.38,
        lng: -122.44,
        title: "Powdery Mildew",
        department: "Department of Viticulture and Enology",
        director: "Dario Cantu",
        categoryKey: "AG",
    }, {
        svg: iconImages.kids,
        lat: 38.66,
        lng: -120.70,
        title: "Child Development",
        department: "Department of Human Ecology",
        director: "Leah Hibel",
        categoryKey: "HUMAN",
    }, {
        svg: iconImages.leaf,
        lat: 34.02,
        lng: -115.52,
        title: "Crop Breeding",
        department: "Department of Plant Sciences",
        director: "Charlie Brummer",
        categoryKey: "AG",
    }, {
        svg: iconImages.marsh,
        lat: 39.98,
        lng: -124.12,
        title: "Wetland Ecology and Conservation",
        department: "Department of Wildlife, Fish and Conservation Biology",
        director: "John Eadie",
        categoryKey: "ENV",
    }, {
        svg: iconImages.milk,
        lat: 35.63,
        lng: -121.01,
        title: "Animal Science",
        department: "Department of Animal Science",
        director: "Ed DePeters",
        categoryKey: "AG",
    }, {
        svg: iconImages.orangeslice,
        lat: 34.87,
        lng: -117.00,
        title: "Citrus Greening Disease",
        department: "Department of Nutrition",
        director: "Carolyn Slupsky",
        categoryKey: "AG",
    }, {
        svg: iconImages.seed,
        lat: 40.09,
        lng: -120.16,
        title: "Seed Biotechnology",
        department: "Department of Plant Sciences",
        director: "Kent Bradford",
        categoryKey: "AG",
    }, {
        svg: iconImages.strawberry,
        lat: 37.19,
        lng: -120.63,
        title: "Strawberry Breeding",
        department: "Department of Plant Sciences",
        director: "Steve Knapp",
        categoryKey: "AG",
    }, {
        svg: iconImages.tree,
        lat: 41.02,
        lng: -123.43,
        title: "Plant Pathology",
        department: "Department of Plant Pathology",
        director: "Dave Rizzo",
        categoryKey: "ENV",
    }, {
        svg: iconImages.wineglass,
        lat: 38.36,
        lng: -121.75,
        title: "Sustainable Wine Production",
        department: "Department of Viticulture and Enology",
        director: "David Block",
        categoryKey: "AG",
    }, {
        svg: iconImages.pest,
        lat: 35.31,
        lng: -118.94,
        title: "Sustainble Pest Management",
        department: "Department of Food and Technology",
        director: "Christopher Simmons",
        categoryKey: "ENV",
    }, {
        svg: iconImages.family,
        lat: 33.71,
        lng: -117.72,
        title: "Child Development",
        department: "Department of Human Ecology",
        director: "Daniel Ewon Choe",
        categoryKey: "HUMAN",
    }, {
        svg: iconImages.wheat,
        lat: 39.76,
        lng: -121.25,
        title: "Wheat Genetics",
        department: "Department of Plant Sciences",
        director: "Jorge Dubcovsky",
        categoryKey: "AG",
    }, {
        svg: iconImages.rain,
        lat: 38.07,
        lng: -118.90,
        title: "Cloud, Climate Physics",
        department: "Department of Land, Air and Water Resources",
        director: "Da Yang",
        categoryKey: "ENV",
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

const chart = d3.select<HTMLDivElement, {}>(chartSelector);

const svg = chart
    .append<SVGElement>("svg")
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
    .append<SVGGElement>("svg:g");

// icon circle shadow
const iconCircles = icons
    .append<SVGGElement>("svg:g")
    .html(iconImages.circle)
    .select<SVGElement>("svg")
    .attr("class", "circle")
    .attr("x", d => (d.left || 0) - (iconCircleSize / 2))
    .attr("y", d => (d.top || 0) - (iconCircleSize / 2))
    .attr("width", iconCircleSize)
    .attr("height", iconCircleSize)
    .attr("fill", "#fff");

// icon symbols
const iconSvgs = icons
    .append<SVGGElement>("svg:g")
    .html(d => d.svg)
    .select<SVGElement>("svg")
    .attr("class", "icon")
    .attr("x", d => (d.left || 0) - (iconSize / 2))
    .attr("y", d => (d.top || 0) - (iconSize / 2))
    .attr("width", iconSize)
    .attr("height", iconSize)
    .attr("fill", d => d.categoryColor || "none");

states.selectAll("path")
    .data([state_data] as any)
    .enter().append("svg:path")
    .attr("d", path as any);

counties.selectAll("path")
    .data(topojson.feature(counties_data, counties_data.objects.counties as GeometryCollection<{}>).features)
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
const tooltip = chart
  .append<HTMLElement>("div")
  .attr("class", "chart-tooltip hidden")
  .attr("dy", 1);

// build tooltip
tooltip.append("div").attr("class", "department");
tooltip.append("div").attr("class", "project");
tooltip.append("div").attr("class", "director");

// mouse overs
icons.selectAll<SVGElement, IIconData>("svg")
    .on("mouseover", function (data, i, groups) {

        d3.select(groups[0])
            .transition()
            .duration(100)
            .attr("x", (d: any) => d.left - (iconCircleSize * zoomFactor / 2))
            .attr("y", (d: any) => d.top - (iconCircleSize * zoomFactor / 2))
            .attr("width", iconCircleSize * zoomFactor)
            .attr("height", iconCircleSize * zoomFactor);

        d3.select(groups[1])
            .transition()
            .duration(100)
            .attr("x", (d: any) => d.left - (iconSize * zoomFactor / 2))
            .attr("y", (d: any) => d.top - (iconSize * zoomFactor / 2))
            .attr("width", iconSize * zoomFactor)
            .attr("height", iconSize * zoomFactor);

        // setup tooltip text
        tooltip.attr("data-topic", data.categoryKey);

        tooltip.select(".department")
            .text(data.department);

        tooltip.select(".project")
            .text(data.title);

        tooltip.select(".director")
            .text(data.director);

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

        const circlePosition = {
            x: (data.left || 0) + svgPosition.left - chartPosition.left,
            y: (data.top || 0) + svgPosition.top - chartPosition.top,
        };

        // move mouseover tooltip
        tooltip
            .classed("hidden", false)
            .style("left", `${circlePosition.x}px`)
            .style("top", `${circlePosition.y - (iconCircleSize / 2)}px`);
    })
    .on("mouseout", function(data, i, groups) {

        d3.select(groups[0])
            .transition()
            .duration(100)
            .attr("x", (d: any) => d.left - (iconCircleSize / 2))
            .attr("y", (d: any) => d.top - (iconCircleSize / 2))
            .attr("width", iconCircleSize)
            .attr("height", iconCircleSize);

        d3.select(groups[1])
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

// click
icons.selectAll("svg")
    .on("click", function (d: any, i) {
        setSelectedCategory(d.categoryKey);
    });

// category change
const totalChart = d3.select("#map-summary-chart");
onSelectedCategoryChanged((categoryIndex) => {
    if (categoryIndex < 0) {
        icons.classed("inactive", false);
        return;
    }
    icons.classed("inactive", d => d.categoryIndex !== categoryIndex);
});

// drag
// icons.call(
//     d3.drag()
//         .container(svg.node() as DragContainerElement)
//         .subject(function() {
//             return this;
//         })
//         .on("drag", () => {
//             d3.select(d3.event.subject)
//               .select(".circle")
//                 .attr("x", d3.event.x - 25)
//                 .attr("y", d3.event.y - 25);

//             console.log(projection.invert([d3.event.x, d3.event.y]));
//         }));
