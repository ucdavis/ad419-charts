import { groupBy } from "../utils/array";

const categories: ICategory[] = require("./categories.json");

// transform into array
const departmentJson: any = require("./departments.json");
const departments: IDepartment[] = Object.keys(departmentJson).map((k) => {
    const categoryKey = departmentJson[k].category;
    const categoryIndex = categories.findIndex(c => c.key === categoryKey);
    return {
        key: k,
        name: departmentJson[k].name,
        categoryKey: categoryKey,
        categoryIndex: categoryIndex,
    };
}).filter(d => d.categoryIndex > -1);

// transform into array
const sourceJson: any = require("./sources.json");
const sources: ISource[] = Object.keys(sourceJson).map((k) => {
    return {
        key: k,
        name: sourceJson[k].name as string,
        parentSourceName: sourceJson[k].category as string,
    };
});

// parse projects
const projectJson: any[] = require("./projectTotals.json");
const projects: IProject[] = projectJson.map(p => {
    const categoryKey = departmentJson[p.dept].category;
    const categoryIndex = categories.findIndex(c => c.key === categoryKey);
    return {
        key: p.project,
        name: p.project,
        categoryKey: categoryKey,
        categoryIndex: categoryIndex,
        departmentKey: p.dept,
        total: p.total,
    };
}).filter(p => p.categoryIndex > -1);

const sourceTotalsByDepartmentJson: any = require("./sourceTotalsByDepartment.json");
const sourceTotals: ISourceTotal[] = [];
for (const sourceKey of Object.keys(sourceTotalsByDepartmentJson)) {

    const totals = sourceTotalsByDepartmentJson[sourceKey];
    const source = sources.find(s => s.key === sourceKey);

    if (source === undefined) {
        console.info("Could not find source: ", sourceKey);
        continue;
    }

    const result: ISourceTotal = {
        key: sourceKey,
        source: source,
        byDeparment: [],
        byCategory: categories.map(c => { return { ...c, total: 0 }; }),
        total: 0
    };

    // loop through departments
    for (const departmentKey of Object.keys(totals)) {
        const department = departments.find(d => d.key === departmentKey);
        if (department === undefined) {
            console.info("Could not find department: ", departmentKey);
            continue;
        }

        const total: number = totals[departmentKey] || 0;

        // don't include empty/negative departments
        if (total <= 0) {
            continue;
        }

        // add department entry
        result.byDeparment.push({
            ...department,
            total,
        });

        // find and update category entry
        const category = result.byCategory.find(c => c.key === department.categoryKey);
        if (category === undefined) {
            console.info("Could not find category: ", department.categoryKey);
            continue;
        }
        category.total += total;

        // update result total
        result.total += total;
    }

    // don't include empty/negative results
    if (result.total <= 0) {
        continue;
    }

    sourceTotals.push(result);
}



export interface ICategory {
    key: string;
    name: string;
    color: string;
    icon: string;
}

export interface ICategoryTotal extends ICategory {
    total: number;
}

export interface IDepartment {
    key: string;
    name: string;
    categoryKey: string;
    categoryIndex: number;
}

export interface IDepartmentTotal extends IDepartment {
    total: number;
}

export interface IProject {
    key: string;
    name: string;
    categoryKey: string;
    categoryIndex: number;
    departmentKey: string;
    total: number;
}

export interface ISource {
    key: string;
    name: string;
    parentSourceName: string;
}

export interface ISourceTotal {
    key: string;
    source: ISource;
    byDeparment: IDepartmentTotal[];
    byCategory: ICategoryTotal[];
    total: number;
}

export function getDepartments(): IDepartment[] {
    return [...departments];
}

export function getSources(): ISource[] {
    return [...sources];
}

export function getSourceTotals(): ISourceTotal[] {
    return [...sourceTotals];
}

export function getCategories(): ICategory[] {
    return [...categories];
}

export function getProjects(): IProject[] {
    return [...projects];
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
