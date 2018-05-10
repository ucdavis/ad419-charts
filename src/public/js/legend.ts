import * as d3 from "d3";
import {
  onSelectedCategoryChanged,
  getSelectedCategory,
  getCategories,
  getProjects,
  getDepartments
} from "./data";

import { scale as bubbleScale, getCircleRadius as getBubbleCircleRadius } from "./bubble";
import { scale as sourceScale } from "./sources";

const categories = getCategories();
const departments = getDepartments();
const projects = getProjects();

const sumTotal = projects.reduce((prev, d) => prev + d.total, 0);

// category change
const legends = d3.selectAll("#bubble-summary-legend, #map-summary-legend");
onSelectedCategoryChanged(categoryIndex => {
  if (categoryIndex < 0) {
    // hide legends
    legends.classed("d-none", true);
    return;
  }

  const category = categories[categoryIndex];
  const total = projects.reduce(
    (prev, p) => (p.categoryIndex !== categoryIndex ? prev : prev + p.total),
    0
  );
  const count = projects.reduce(
    (prev, p) => (p.categoryIndex !== categoryIndex ? prev : prev + 1),
    0
  );

  // show legend
  legends.classed("d-none", false);

  // update legend details
  legends.select(".icon").attr("src", category.icon || "");

  legends.select(".topic").text(category.name);

  legends.select(".total").text(`$${(total / 1000000).toFixed(1)}M`);

  legends.select(".count").text(count);

  // remove all old departments
  legends
    .select(".departments")
    .selectAll("p")
    .remove();

  const d = departments.filter(d => d.categoryIndex === categoryIndex);
  legends
    .select(".departments")
    .selectAll("p")
    .data(d)
    .enter()
    .append("p")
    .text(d => d.name);
});

// setup circle scale legends
const bubbleScaleLegend = d3.select<SVGElement, {}>("#bubble-legend-scale");

const radius50 = getBubbleCircleRadius(5000000);
bubbleScaleLegend.select<SVGCircleElement>("#bubble-legend-scale-50")
  .attr("r", radius50)
  .attr("cy", 100 - radius50)
  .attr("cx", 100);

bubbleScaleLegend.select<SVGTextElement>("#bubble-legend-scale-50-label")
  .attr("x", 150 + radius50)
  .attr("y", 100 - (radius50 * 2));

bubbleScaleLegend.select<SVGPathElement>("#bubble-legend-scale-50-path")
  .attr("d", `M 100 ${100 - (radius50 * 2)} L ${150 + radius50} ${100 - (radius50 * 2)}`);

const radius15 = getBubbleCircleRadius(1500000);
bubbleScaleLegend.select<SVGCircleElement>("#bubble-legend-scale-15")
  .attr("r", radius15)
  .attr("cy", 100 - radius15)
  .attr("cx", 100);

bubbleScaleLegend.select<SVGTextElement>("#bubble-legend-scale-15-label")
  .attr("x", 150 + radius50)
  .attr("y", 100 - (radius15 * 2));

bubbleScaleLegend.select<SVGPathElement>("#bubble-legend-scale-15-path")
  .attr("d", `M 100 ${100 - (radius15 * 2)} L ${150 + radius50} ${100 - (radius15 * 2)}`);

const radius02 = getBubbleCircleRadius(200000);
bubbleScaleLegend.select<SVGCircleElement>("#bubble-legend-scale-02")
  .attr("r", radius02)
  .attr("cy", 100 - radius02)
  .attr("cx", 100);

bubbleScaleLegend.select<SVGTextElement>("#bubble-legend-scale-02-label")
  .attr("x", 150 + radius50)
  .attr("y", 100 - (radius50 * 2));

bubbleScaleLegend.select<SVGTextElement>("#bubble-legend-scale-02-label")
  .attr("x", 150 + radius50)
  .attr("y", 100 - (radius02 * 2));

bubbleScaleLegend.select<SVGPathElement>("#bubble-legend-scale-02-path")
  .attr("d", `M 100 ${100 - (radius02 * 2)} L ${150 + radius50} ${100 - (radius02 * 2)}`);