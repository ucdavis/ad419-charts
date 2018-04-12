import * as d3 from "d3";
import * as geo from "d3-geo";
import * as topojson from "topojson";
import { Polygon, Point } from "geojson";
import { Selection } from "d3-selection";

const data = require("./map-data.json") as geo.ExtendedFeatureCollection<geo.ExtendedFeature<Point, any>>;
const state_data = require("./map-geo.json") as geo.ExtendedFeature<Polygon, any>;
const counties_data = require("./map-counties-ca-topo.json") as topojson.Topology;

const selector = "#map";
const width = 500;
const height = 600;

// create projection translation
const projection = geo.geoMercator()
    .center([-121, 38])
    .scale(2500)
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
        lat: 32.65,
        lng: -120.13,
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
        lat: 38.11,
        lng: -123.57,
        title: "wetland ecology and conservation",
        pi: "John Eadie",
        categoryKey: "ENV",
    }, {
        svg: iconImages.milk,
        lat: 34.09,
        lng: -122.01,
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
        lat: 41.57,
        lng: -123.57,
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

const svg = d3.select(selector)
    .insert("svg:svg", "h2")
    .attr("width", width)
    .attr("height", height);

const states = svg.append("svg:g")
    .attr("id", "states")
    .attr("fill", "#ccc")
    .attr("stroke", "#fff");

const counties = svg.append("svg:g")
    .attr("id", "counties")
    .attr("fill", "#ccc")
    .attr("stroke", "#fff");

const icons = svg.append("svg:g")
    .attr("id", "icons")
    .selectAll("g")
    .data(iconsData)
    .enter()
    .append("svg:g");

const iconSvgs = icons
    .append("svg:g")
    .html(d => d.svg)
    .select("svg")
    .attr("class", "icon")
    .attr("x", d => d.left - 25)
    .attr("y", d => d.top - 25)
    .attr("width", 50)
    .attr("height", 50)
    .attr("fill", d => d.categoryColor);

// icon titles
icons.append("svg:text")
    .attr("class", "chart-label opaque")
    .attr("x", d => d.left)
    .attr("y", d => d.top + 50)
    .attr("text-anchor", "middle")
    .text(d => d.title);

// investigator titles
icons.append("svg:text")
    .attr("class", "chart-label minor opaque")
    .attr("x", d => d.left)
    .attr("y", d => d.top + 65)
    .attr("text-anchor", "middle")
    .text(d => d.pi);

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

// mouse overs
icons
    .append("svg:rect")
    .attr("x", d => d.left - 25)
    .attr("y", d => d.top - 25)
    .attr("width", 50)
    .attr("height", 50)
    .attr("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", function (d: any, i) {

        const element = d3.select(this as Element).node();
        console.log(element);
        if (!element) return;
        const g = element.parentElement;

        d3.select(g)
            .select("svg")
            .transition()
            .duration(200)
            .attr("x", (d: any) => d.left - 40)
            .attr("y", (d: any) => d.top - 40)
            .attr("width", 80)
            .attr("height", 80);

        // show text
        d3.select(g)
            .selectAll("text")
            .classed("opaque", false);
    })
    .on("mouseout", function() {

        const element = d3.select(this as Element).node();
        if (!element) return;
        const g = element.parentElement;

        d3.select(g)
            .select("svg")
            .transition()
            .duration(1000)
            .attr("x", (d: any) => d.left - 25)
            .attr("y", (d: any) => d.top - 25)
            .attr("width", 50)
            .attr("height", 50);

        // hide text
        d3.select(g)
            .selectAll("text")
            .classed("opaque", true);

    });
