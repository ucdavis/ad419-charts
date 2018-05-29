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
        .filter(p => p.categoryKey == category.key)
        .reduce((prev, p) => prev + p.total, 0);

    return total;
}

function getCategoryTopic() {
    const categoryIndex = getSelectedCategory();
    if (categoryIndex < 0) {
        return "";
    }
    const category = categories[categoryIndex];
    return category.name;
}

const totalSpans = document.getElementsByClassName("total-span");

function setTotals() {
    const total = getTotal();
    const millions = total / 1000000;
    const topic = getCategoryTopic();

    for (let i = 0; i < totalSpans.length; i++) {
        const span = totalSpans[i] as HTMLSpanElement;
        span.innerText = `$${millions.toFixed(1)} million`;
        span.setAttribute("data-topic", topic);
    }
}

window.addEventListener("load", setTotals);

onSelectedCategoryChanged(setTotals);
