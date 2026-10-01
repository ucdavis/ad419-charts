const templates: { [tagName: string]: string } = {
  "site-hero": require("./site-hero.template.html"),
  "research-overview": require("./research-overview.template.html"),
  "funding-section": require("./funding-section.template.html"),
  "geography-section": require("./geography-section.template.html"),
  "contributors-section": require("./contributors-section.template.html"),
  "spotlights-section": require("./spotlights-section.template.html"),
  "site-footer": require("./site-footer.template.html"),
};

const componentTags = Object.keys(templates);

componentTags.forEach((tagName) => {
  const component = document.querySelector(tagName) as HTMLElement | null;

  if (component && !component.hasChildNodes()) {
    component.innerHTML = templates[tagName];
  }
});
