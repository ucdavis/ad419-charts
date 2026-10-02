import siteHero from "./site-hero.template.html?raw";
import researchOverview from "./research-overview.template.html?raw";
import topicSelector from "./topic-selector.template.html?raw";
import fundingSection from "./funding-section.template.html?raw";
import geographySection from "./geography-section.template.html?raw";
import contributorsSection from "./contributors-section.template.html?raw";
import spotlightsSection from "./spotlights-section.template.html?raw";
import siteFooter from "./site-footer.template.html?raw";

const templates: { [tagName: string]: string } = {
  "site-hero": siteHero,
  "research-overview": researchOverview,
  "topic-selector": topicSelector,
  "funding-section": fundingSection,
  "geography-section": geographySection,
  "contributors-section": contributorsSection,
  "spotlights-section": spotlightsSection,
  "site-footer": siteFooter,
};

const componentTags = Object.keys(templates);

componentTags.forEach((tagName) => {
  const component = document.querySelector(tagName) as HTMLElement | null;

  if (component && !component.hasChildNodes()) {
    component.innerHTML = templates[tagName];
  }
});
