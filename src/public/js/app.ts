import "../sass/app.scss";

import * as $ from "jquery";

import "./totals";
import "./bubble";
import "./sources";
import "./map";

import { setSelectedCategory } from "./data";

const navButtons = document.getElementsByClassName("topic-button");
const viewAllButtons = document.getElementsByClassName("topic-all");

function setupTopicSelector() {
    // attach listeners
    for (let i = 0; i < navButtons.length; i++) {
        const button = navButtons[i] as HTMLElement;
        const topic = button.getAttribute("data-topic") || "";
        button.onclick = function(e) {
            handleTopicChanged(topic);
        };
    }

    for (let i = 0; i < viewAllButtons.length; i++) {
        const button = viewAllButtons[i] as HTMLButtonElement;
        button.onclick = function(e) {
            e.preventDefault();
            handleTopicChanged("");
        };
    }
}
window.addEventListener("load", setupTopicSelector);

function handleTopicChanged(topic: string) {
    setSelectedCategory(topic);

    // decorate body
    document.body.setAttribute("data-topic", topic);

    // decorate topic button
    for (let i = 0; i < navButtons.length; i++) {
        const button = navButtons[i] as HTMLLIElement;
        const t = button.getAttribute("data-topic");
        if (t === topic) {
            $(button).addClass("active");
        } else {
            $(button).removeClass("active");
        }
    }
}

function setupScroll() {
    // get fixed position
    const topicBar = $("#topic-bar");
    const startTop = Math.ceil(topicBar.position().top) + 1;

    // add sticky
    topicBar.addClass("sticky-top");

    // setup scroll spy
    const handleScroll = () => {
        const top = topicBar.position().top;
        if (top > startTop) {
            topicBar.addClass("thin");
        } else {
            topicBar.removeClass("thin");
        }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // prefire
    handleScroll();
}
window.addEventListener("load", setupScroll);
