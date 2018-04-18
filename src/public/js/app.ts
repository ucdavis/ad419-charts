import "../sass/app.scss";

import * as $ from "jquery";
import "slick-carousel";

import "./totals";
import "./bubble";
import "./sources";
import "./map";

import { setSelectedCategory } from "./data";

const $topicBar = $("#topic-bar");
const $root = $("html, body");
function smoothScroll(href: string) {
    const target = ($(href).offset() || { top: 0 }).top;
    const offset = $topicBar.height() || 0;
    const margin = 50;

    $root.animate({
        scrollTop: target - offset - margin
    }, 500, function () {
        // window.location.hash = href;
    });
}

function handleTopicChanged(topic: string) {
    setSelectedCategory(topic);

    // decorate body
    $root.data("topic", topic);

    // decorate topic button
    $(".topic-button").each(function() {
        const t = $(this).data("topic");
        if (t === topic) {
            $(this).addClass("active");
        } else {
            $(this).removeClass("active");
        }
    });
}

function setupTopicSelector() {
    // attach listeners
    $(".topic-button").click(function() {
        const topic = $(this).data("topic");
        handleTopicChanged(topic);
        handleTopicChanged(topic);

        showRandomArticle(topic);
    });

    $(".topic-all").click(function(e) {
        e.preventDefault();
        handleTopicChanged("");
        showRandomArticle("");
    });
}

function setupScroll() {
    // get fixed position
    const startTop = Math.ceil($topicBar.position().top) + 1;

    // add sticky
    $topicBar.addClass("sticky-top");

    // setup scroll spy
    const handleScroll = () => {
        const top = $topicBar.position().top;
        if (top > startTop) {
            $topicBar.addClass("thin");
        } else {
            $topicBar.removeClass("thin");
        }
    };
    $(window).scroll(handleScroll);

    // prefire
    handleScroll();
}

const $carousel = $(".lead_carousel");
function setupSlideshow() {
    $carousel.slick({
        variableWidth: true,
        arrows: false,
        autoplay: false,
        autoplaySpeed: 3000
    });
}

const $articleLinks = $(".lead_carousel .article-link");
const $articles = $(".article");
function setupArticleSelect() {
    $(".lead_carousel").on("click", ".article-link", function(e) {
        e.preventDefault();

        // mark one slide as active
        $articleLinks.removeClass("active");
        $(this).addClass("active");

        // hide all articles
        $articles.hide();

        // show single article
        const href = $(this).attr("href") || "";
        $(href).show();
        smoothScroll(href);

        // set topic
        const topic = $(this).data("topic");
        handleTopicChanged(topic);
    });
}

function showRandomArticle(topic: string) {
    // deactivate active article, show random one
    $articleLinks.removeClass("active");
    $articles.hide();

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
    // show article
    $(article).show();

    // find an select slide as active
    const id = article.id;
    for (let i = 0; i < $articleLinks.length; i++) {
        const $articleLink = $($articleLinks[i]);
        if ($articleLink.attr("href") === `#${id}`) {
            $articleLink.addClass("active");
            $carousel.slick("slickGoTo", i);
            break;
        }
    }
}

$().ready(() => {
    setupTopicSelector();
    setupScroll();
    setupSlideshow();
    setupArticleSelect();
    showRandomArticle("");
});
