import * as d3 from "d3";

import {
  getCategories,
  getDepartments,
  getSelectedCategory,
  getProjects,
  onSelectedCategoryChanged,
  setSelectedCategory
} from "./data";

const categories = getCategories();
const departments = getDepartments();
const projects = getProjects();

const topicControls = Array.from(
  document.querySelectorAll<HTMLButtonElement>("#topic-bar [data-topic]")
);
const topicButtonVariants: { [topic: string]: string } = {
  AG: "btn-success",
  ENV: "btn-info",
  HUMAN: "btn-warning"
};
const bubbleDetail = d3.select("#bubble-detail");
const bubbleDetailEmpty = d3.select("#bubble-detail-empty");
const bubbleDetailSummary = d3.select("#bubble-detail-summary");
const bubbleDetailHeader = d3.select("#bubble-detail-header");
const bubbleDetailCategory = d3.select("#bubble-detail-category");
const bubbleDetailIcon = d3.select<HTMLImageElement, {}>("#bubble-detail-icon");
const bubbleDetailTotal = d3.select("#bubble-detail-total");
const bubbleDetailProjectCount = d3.select("#bubble-detail-project-count");
const bubbleDetailDepartments = d3.select("#bubble-detail-departments");

topicControls.forEach(control => {
  control.addEventListener("click", () => {
    const currentCategory = categories[getSelectedCategory()];
    const selectedTopic = currentCategory ? currentCategory.key : "";
    const topic = control.dataset.topic || "";

    setSelectedCategory(topic === selectedTopic ? "" : topic);
  });
});

function updateTopicControls(categoryIndex: number) {
  const category = categories[categoryIndex];

  topicControls.forEach(control => {
    const isSelected = category !== undefined
      ? control.dataset.topic === category.key
      : control.dataset.topic === "";
    const variant = topicButtonVariants[control.dataset.topic || ""];

    control.setAttribute("aria-pressed", isSelected ? "true" : "false");
    control.classList.toggle("btn-active", isSelected);
    if (variant) {
      control.classList.toggle(variant, isSelected);
    }
  });
}

function updateBubbleDetail(categoryIndex: number) {
  const category = categories[categoryIndex];

  if (category === undefined) {
    bubbleDetail.attr("data-topic", null);
    bubbleDetailHeader.style("border-color", null);
    bubbleDetailEmpty.classed("hidden", false);
    bubbleDetailSummary.classed("hidden", true);
    return;
  }

  const categoryProjects = projects.filter(project => project.categoryIndex === categoryIndex);
  const categoryTotal = categoryProjects.reduce((total, project) => total + project.total, 0);
  const categoryDepartments = departments.filter(department => department.categoryIndex === categoryIndex);

  bubbleDetail.attr("data-topic", category.key);
  bubbleDetailHeader.style("border-color", category.color);
  bubbleDetailCategory
    .text(category.name)
    .style("color", category.color);
  bubbleDetailIcon.attr("src", category.icon || "");
  bubbleDetailTotal
    .text(`$${(categoryTotal / 1000000).toFixed(1)}M`)
    .style("color", category.color);
  bubbleDetailProjectCount
    .text(categoryProjects.length)
    .style("color", category.color);
  bubbleDetailDepartments
    .selectAll("li")
    .remove();
  bubbleDetailDepartments
    .selectAll("li")
    .data(categoryDepartments)
    .enter()
    .append("li")
    .text(department => department.name);
  bubbleDetailEmpty.classed("hidden", true);
  bubbleDetailSummary.classed("hidden", false);
}

onSelectedCategoryChanged(categoryIndex => {
  updateTopicControls(categoryIndex);
  updateBubbleDetail(categoryIndex);
});
