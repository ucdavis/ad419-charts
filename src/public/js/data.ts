const departments: object = require("./departments.json");
const categories: ICategory[] = require("./categories.json");
const projects: IProject[] = require("./projects.json");

// combine info
const sourcesLookup: any = require("./sources.json");
const sourceData: any = require("./source-data.json");
const sources = Object.keys(sourceData).map((f) => {

    // transform into array
    const c = Object.keys(sourceData[f]).map(s => {
        return {
            name: s,
            total: sourceData[f][s],
        };
    });

    // find lookup
    const l = sourcesLookup[f];

    return {
        name: l.name,
        categories: c,
        total: c.reduce((prev, d) => prev + d.total, 0),
    } as ISource;
});

export interface IProject {
    project: string;
    category: string;
    dept: string;
    total: number;
}

export interface ISource {
    name: string;
    categories: ICategory[];
    total: number;
}

export interface ICategory {
    name: string;
    color?: string;
    total?: number;
}

export function getProjects(): IProject[] {
    return [...projects];
}

export function getSources(): ISource[] {
    return [...sources];
}

export function getCategories(): ICategory[] {
    return [...categories];
}

let selectedCategory = -1;
export function getSelectedCategory(): number {
    return selectedCategory;
}

export function setSelectedCategory(category: string): number {
    const index = categories.findIndex(c => c.name === category);
    selectedCategory = index;

    events.forEach(e => {
        e(index);
    });

    return selectedCategory;
}

export interface SelectedCategoryChangedEvent {
    (index: number): void;
}

const events: SelectedCategoryChangedEvent[] = [];
export function onSelectedCategoryChanged(func: SelectedCategoryChangedEvent) {
    events.push(func);
}
