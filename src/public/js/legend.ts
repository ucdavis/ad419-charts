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
const legends = d3.selectAll("#bubble-summary-legend, #map-summary-legend");
onSelectedCategoryChanged(categoryIndex => {
    console.log(categoryIndex);
  if (categoryIndex < 0) {
    // hide legends
    legends.classed("hidden", true);
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
  legends.classed("hidden", false);

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
