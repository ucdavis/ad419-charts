import "../components";
import "../css/generated.css";

import "es6-shim";
import "innersvg-polyfill";

import * as $ from "jquery";
import "slick-carousel";

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

const $carousel = $(".lead_carousel");
function setupSlideshow() {
    $carousel.slick({
        variableWidth: true,
        arrows: true,
        dots: true,
        autoplay: false,
        autoplaySpeed: 3000,
        swipeToSlide: true,
    });
}

const $articles = $(".article");
function setupArticleSelect() {
    $(".lead_carousel").on("click", ".article-link", function(e) {
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

    // find all article links (new ones are created as the carousel moves)
    const $articleLinks = $(".lead_carousel .article-link");

    // remove all active
    $articleLinks.removeClass("active");

    // set matching slides as active
    $carousel.find(`[href='${href}']`).addClass("active");

    // hide all articles
    $articles.hide();

    // show single article
    $(href).show();
}

$().ready(() => {
    setupSlideshow();
    setupArticleSelect();

    setSelectedCategory("");
});
