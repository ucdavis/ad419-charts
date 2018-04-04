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
function smoothScroll(href) {
    const margin = 50;
    $root.animate({
        scrollTop: $(href).offset().top - $topicBar.height() - margin
    }, 500, function () {
        // window.location.hash = href;
    });
}

function setupTopicSelector() {
    // attach listeners
    $(".topic-button").click(function() {
        const topic = $(this).data("topic");
        handleTopicChanged(topic);
        handleTopicChanged(topic);
    });

    $(".topic-all").click(function(e) {
        e.preventDefault();
        handleTopicChanged("");
    });

    $(".lead_carousel").on("click", ".article-link", function(e) {
        e.preventDefault();
        $(".lead_carousel .article-link").removeClass("active");
        $(this).addClass("active");

        const topic = $(this).data("topic");
        handleTopicChanged(topic);

        const href = $(this).attr("href");
        smoothScroll(href);
    });
}
$().ready(setupTopicSelector);

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

    // hide/show articles
    if (!topic) {
        $(".article").show();
    } else {
        $(".article").hide();
        $(`.article[data-topic='${topic}']`).show();
    }
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
$().ready(setupScroll);
