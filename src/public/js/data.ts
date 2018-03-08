const departments: object = require("./departments.json");
const categories: any[] = require("./categories.json");
const projects: any[] = require("./projects.json");

// transform into array
let sources = require("./sources.json");
sources = Object.keys(sources).map((f) => {

    // transform into array
    const c = Object.keys(sources[f]).map(s => {
        return {
            name: s,
            total: sources[f][s],
        };
    });

    return {
        name: f,
        categories: c,
        total: c.reduce((prev, d) => prev + d.total, 0),
    };
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
