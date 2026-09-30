import * as d3 from "d3";
import * as geo from "d3-geo";
import * as topojson from "topojson";
import { GeometryCollection, Topology } from "topojson-specification";
import { Polygon, Point } from "geojson";

import { getCategories, onSelectedCategoryChanged, setSelectedCategory } from "./data";

const data = require("./map-data.json") as geo.ExtendedFeatureCollection<geo.ExtendedFeature<Point, any>>;
const state_data = require("./map-geo.json") as geo.ExtendedFeature<Polygon, any>;
const counties_data = require("./map-counties-ca-topo.json") as Topology;

const categories = getCategories();

const chartSelector = "#map";
const width = 700;
const height = 800;

const iconSize = 22;
const markerRadius = 18;
const zoomFactor = 1.18;

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
    .translate([175, 306]);

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
        lat: 39.08,
        lng: -122.44,
        title: "Powdery Mildew",
        department: "Department of Viticulture and Enology",
        director: "Dario Cantu",
        categoryKey: "AG",
    }, {
        svg: iconImages.kids,
        lat: 39.06,
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
        title: "Investigating the biology and insecticide resistance of California mosquito disease vectors",
        department: "Department of Entomology and Nematology",
        director: "Anthony Cornel",
        categoryKey: "AG",
    }, {
        svg: iconImages.family,
        lat: 38.3,
        lng: -120.80,
        title: "The California Families Project: Understanding Biological Changes in Adolescence and Early Adulthood",
        department: "Department of Human Ecology",
        director: "Amanda Guyer",
        categoryKey: "HUMAN",
    }, {
        svg: iconImages.wheat,
        lat: 32.76,
        lng: -116.25,
        title: "Genes for perennial growth in wheat",
        department: "Department of Plant Sciences",
        director: "Jan Dvorak",
        categoryKey: "AG",
    }, {
        svg: iconImages.rain,
        lat: 38.07,
        lng: -118.90,
        title: "Integrated assessment of climate and extreme weather impacts on agriculture in California",
        department: "Department of Land, Air and Water Resources",
        director: "Erwan Monier",
        categoryKey: "ENV",
    }, {
        svg: iconImages.bee,
        lat: 37.79,
        lng: -120.03,
        title: "Assessing and enhancing the contributions of native bees to agricultural pollination",
        department: "Department of Entomology and Nematology",
        director: "Neal Williams",
        categoryKey: "AG",
    }, {
        svg: iconImages.treetall,
        lat: 41.22,
        lng: -122.43,
        title: "Advanced sensing and management technologies to optimize nitrogen management in deciduous crops",
        department: "Department of Plant Sciences",
        director: "Patrick Brown",
        categoryKey: "AG",
    }, {
        svg: iconImages.fish,
        lat: 36.81,
        lng: -121.64,
        title: "Ecological information towards conservation and resilience of native fishes",
        department: "Department of Wildlife, Fish and Conservation Biology",
        director: "Andrew Rypel",
        categoryKey: "ENV",
    }, {
        svg: iconImages.bolt,
        lat: 36.00,
        lng: -118.41,
        title: "Biometeorological phenomena and the fluxes of mass, momentum and energy",
        department: "Department of Land, Air and Water Resources",
        director: "Kyaw Paw U",
        categoryKey: "ENV",
    }, {
        svg: iconImages.fowl,
        lat: 39.88,
        lng: -122.44,
        title: "Biogeomorphic Evolution of Restored Floodplain Wetlands in California and its Consequences on Ecosystem Functioning",
        department: "Department of Environmental Science and Policy",
        director: "Xiaolo Dong",
        categoryKey: "ENV",
    }, {
        svg: iconImages.apple,
        lat: 33.81,
        lng: -118.2,
        title: "Nutrition and caregiving interventions to support children's neurodevelopment in low-resource communities",
        department: "Department of Nutrition",
        director: "Elizabeth Prado",
        categoryKey: "HUMAN",
    }, {
        svg: iconImages.wind,
        lat: 35.81,
        lng: -119.84,
        title: "Understanding Particulate Matter Pollution from Biomass Burning Activities in California",
        department: "Department of Environmental Science and Policy",
        director: "Qi Zhang",
        categoryKey: "ENV",
    }, {
        svg: iconImages.solar,
        lat: 33.97,
        lng: -117.20,
        title: "The impact of California solar electricity generation on local air quality",
        department: "Department of Agricultural and Resource Economics",
        director: "Kevin Novan",
        categoryKey: "ENV",
    }, {
        svg: iconImages.rice,
        lat: 35.17,
        lng: -115.20,
        title: "Analysis of disease resistance in rice",
        department: "Department of Plant Pathology",
        director: "Pamela Ronald",
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

const chart = d3.select<HTMLDivElement, {}>(chartSelector);

const svg = chart
    .append<SVGElement>("svg")
    .attr("class", "mx-auto block h-auto w-full max-w-5xl")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`);

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
    .append<SVGGElement>("svg:g")
    .attr("class", "map-marker")
    .attr("role", "button")
    .attr("tabindex", 0)
    .attr("aria-label", d => `${d.title}, ${d.department}`);

// Marker discs keep the geography legible while preserving a clear category signal.
const iconCircles = icons
    .append<SVGCircleElement>("svg:circle")
    .attr("class", "marker-disc")
    .attr("cx", d => d.left || 0)
    .attr("cy", d => d.top || 0)
    .attr("r", markerRadius)
    .attr("fill", d => d.categoryColor || "none");

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
    .attr("fill", "#fff");

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

const mapDetail = d3.select("#map-detail");
const mapDetailIcon = d3.select<HTMLImageElement, {}>("#map-detail-icon");
const mapDetailCategory = d3.select("#map-detail-category");
const mapDetailTitle = d3.select("#map-detail-title");
const mapDetailDepartment = d3.select("#map-detail-department");
const mapDetailDirector = d3.select("#map-detail-director");

function setMarkerScale(marker: SVGGElement, scale: number) {
    const selection = d3.select<SVGGElement, IIconData>(marker);
    selection.select<SVGCircleElement>(".marker-disc")
        .transition()
        .duration(120)
        .attr("r", markerRadius * scale);

    selection.select<SVGElement>(".icon")
        .transition()
        .duration(120)
        .attr("x", (d: IIconData) => (d.left || 0) - (iconSize * scale / 2))
        .attr("y", (d: IIconData) => (d.top || 0) - (iconSize * scale / 2))
        .attr("width", iconSize * scale)
        .attr("height", iconSize * scale);
}

function updateMapDetail(data: IIconData) {
    const category = categories[data.categoryIndex || 0];

    mapDetail.attr("data-topic", data.categoryKey);
    mapDetailIcon
        .classed("hidden", false)
        .attr("src", category.icon || "");
    mapDetailCategory.text(category.name);
    mapDetailTitle.text(data.title);
    mapDetailDepartment.text(data.department);
    mapDetailDirector.text(data.director);
}

function updateMapOverview(categoryIndex: number) {
    const category = categories[categoryIndex];
    const isCategorySelected = categoryIndex >= 0 && !!category;

    mapDetail.attr("data-topic", isCategorySelected ? category.key : "");
    mapDetailIcon
        .classed("hidden", !isCategorySelected)
        .attr("src", isCategorySelected ? category.icon || "" : "");
    mapDetailCategory.text(isCategorySelected ? category.name : "Explore the map");
    mapDetailTitle.text(isCategorySelected
        ? `Explore ${category.name.toLowerCase()} research`
        : "Discover research across California");
    mapDetailDepartment.text(isCategorySelected
        ? "Select a marker to learn about the people and departments behind this work."
        : "Select a research marker to see the people and departments behind the work.");
    mapDetailDirector.text("");
}

function setActiveMarker(marker: SVGGElement) {
    icons.classed("map-marker--active", function() {
        return this === marker;
    });
}

icons
    .on("mouseenter", function(data: IIconData) {
        setActiveMarker(this as SVGGElement);
        setMarkerScale(this as SVGGElement, zoomFactor);
        updateMapDetail(data);
    })
    .on("mouseleave", function() {
        setMarkerScale(this as SVGGElement, 1);
        icons.classed("map-marker--active", false);
    })
    .on("focus", function(data: IIconData) {
        setActiveMarker(this as SVGGElement);
        setMarkerScale(this as SVGGElement, zoomFactor);
        updateMapDetail(data);
    })
    .on("blur", function() {
        setMarkerScale(this as SVGGElement, 1);
        icons.classed("map-marker--active", false);
    })
    .on("click", function(data: IIconData) {
        setSelectedCategory(data.categoryKey);
        setActiveMarker(this as SVGGElement);
        updateMapDetail(data);
    })
    .on("keydown", function(data: IIconData) {
        const event = (d3 as any).event as KeyboardEvent;
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setSelectedCategory(data.categoryKey);
            setActiveMarker(this as SVGGElement);
            updateMapDetail(data);
        }
    });

// category change
onSelectedCategoryChanged((categoryIndex) => {
    if (categoryIndex < 0) {
        icons.classed("inactive", false);
        updateMapOverview(categoryIndex);
        return;
    }
    icons.classed("inactive", d => d.categoryIndex !== categoryIndex);
    updateMapOverview(categoryIndex);
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
