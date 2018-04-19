import * as d3 from "d3";
import {
  onSelectedCategoryChanged,
  getSelectedCategory,
  getCategories,
  getProjects,
  getDepartments
} from "./data";

const categories = getCategories();
const departments = getDepartments();
const projects = getProjects();

const sumTotal = projects.reduce((prev, d) => prev + d.total, 0);

// category change
const totalChart = d3.selectAll("#bubble-summary-legend, #map-summary-legend");
onSelectedCategoryChanged(categoryIndex => {
  // update chart
  if (categoryIndex < 0) {
    const total = sumTotal;
    const count = projects.length;

    totalChart.select(".icon");

    totalChart.select(".title")
        .text("");

    totalChart.select(".total")
        .text(`$${(total / 1000000).toFixed(1)}M`);

    totalChart.select(".count")
        .text(count);
  } else {
    const category = categories[categoryIndex];
    const total = projects.reduce(
      (prev, p) => (p.categoryIndex !== categoryIndex ? prev : prev + p.total),
      0
    );
    const count = projects.reduce(
      (prev, p) => (p.categoryIndex !== categoryIndex ? prev : prev + 1),
      0
    );

    totalChart.select(".icon")
        .attr("src", category.icon || "");

    totalChart.select(".topic")
        .text(category.name);

    totalChart.select(".total")
        .text(`$${(total / 1000000).toFixed(1)}M`);

    totalChart.select(".count")
        .text(count);

    // remove all old departments
    totalChart
      .select(".departments")
      .selectAll("p")
      .remove();

    const d = departments.filter(d => d.categoryIndex === categoryIndex);
    totalChart
      .select(".departments")
      .selectAll("p")
      .data(d)
      .enter()
      .append("p")
      .text(d => d.name);
  }
});
