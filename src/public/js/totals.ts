import { getProjects, getCategories, getSelectedCategory, onSelectedCategoryChanged } from "./data";

const categories = getCategories();
const projects = getProjects();

function getTotal() {
    const categoryIndex = getSelectedCategory();
    if (categoryIndex < 0) {
        return projects.reduce((prev, p) => prev + p.total, 0);
    }

    const category = categories[categoryIndex];
    const total = projects
        .filter(p => p.category == category.name)
        .reduce((prev, p) => prev + p.total, 0);

    return total;
}

function getTextColor() {
    const categoryIndex = getSelectedCategory();
    if (categoryIndex < 0) {
        return "#";
    }
    return "";
}

const spendSpan = document.getElementById("spend-total") as HTMLSpanElement;
const sourceSpan = document.getElementById("source-total") as HTMLSpanElement;
const mapSpan = document.getElementById("map-total") as HTMLSpanElement;
const impactSpan = document.getElementById("impact-total") as HTMLSpanElement;

function setTotals() {
    const total = getTotal();
    const millions = total / 1000000;

    spendSpan.innerText = `$${millions.toFixed(1)} Million`;
    sourceSpan.innerText = `$${millions.toFixed(1)} Million`;
    mapSpan.innerText = `$${millions.toFixed(1)} Million`;
    impactSpan.innerText = `$${millions.toFixed(1)} Million`;
}

window.addEventListener("load", setTotals);

onSelectedCategoryChanged(setTotals);