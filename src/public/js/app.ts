import "../components";
import "../css/tailwind.css";

import "innersvg-polyfill";

import $ from "jquery";

import "./bubble";
import "./legend";
import "./map";
import "./sources";
import "./totals";

import { setSelectedCategory, onSelectedCategoryChanged, getCategories } from "./data";

const $root = $("html body");

const categories = getCategories();
function handleTopicChanged(categoryIndex: number) {
    let topic = "";
    const category = categories[categoryIndex];
    if (category) {
        topic = category.key;
    }

    // decorate body
    $root.attr("data-topic", topic);

    // set selected article
    showRandomArticle(topic);
}
onSelectedCategoryChanged(handleTopicChanged);

const $storyPicker = $(".story-picker");

const $articles = $(".article");
function setupArticleSelect() {
    $storyPicker.on("click", ".article-link", function(e) {
        e.preventDefault();

        // show single article
        const href = $(this).attr("href") || "";
        setArticle(href);

        // set topic
        const topic = $(this).data("topic");
        setSelectedCategory(topic);
    });
}

function showRandomArticle(topic: string) {
    let article;
    if (!topic) {
        const articleIndex = Math.floor(Math.random() * $articles.length);
        article = $articles[articleIndex];
    } else {
        const $topicArticles = $articles.filter(function() {
            const t = $(this).data("topic");
            return t === topic;
        });
        const articleIndex = Math.floor(Math.random() * $topicArticles.length);
        article = $topicArticles[articleIndex];
    }

    // find an select slide as active
    const id = article.id;
    setArticle(`#${id}`);
}

// setup an article lock object
// prevents a feedback loop from article change -> change topic -> select random article
let _articleLock: any;
function setArticle(href: string) {
    if (!!_articleLock) return;

    // lock article change for 200 ms
    _articleLock = setTimeout(() => { _articleLock = undefined; }, 200);

    // Find every story card before updating the active selection.
    const $articleLinks = $(".story-picker .article-link");

    // remove all active
    $articleLinks
        .removeClass("active")
        .attr("aria-current", "false");

    // Set the matching story as active and bring it into the visible rail.
    const $matchingLinks = $storyPicker.find(`[href='${href}']`);
    $matchingLinks
        .addClass("active")
        .attr("aria-current", "true");

    const storyPicker = $storyPicker.get(0);
    const activeCard = $matchingLinks.first().closest(".carousel-wrapper").get(0);
    if (storyPicker && activeCard) {
        const scrollLeft = activeCard.offsetLeft
            - ((storyPicker.clientWidth - activeCard.clientWidth) / 2);
        storyPicker.scrollTo({ left: Math.max(0, scrollLeft), behavior: "smooth" });
    }

    // hide all articles
    $articles.hide();

    // show single article
    $(href).show();
}

$().ready(() => {
    setupArticleSelect();

    const copyrightYear = document.getElementById("copywrite-year");
    if (copyrightYear) {
        copyrightYear.textContent = String(new Date().getFullYear());
    }

    setSelectedCategory("");
});
