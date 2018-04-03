interface Map<T> {
    [K: string]: T;
}

export function groupBy<T>(array: T[], selector: (item: any) => any) {
    const grouped = array.reduce((prev, item) => {
        const key = selector(item);
        if (key in prev) {
            prev[key].push(item);
        } else {
            prev[key] = [ item ];
        }
        return prev;
    }, {} as Map<T[]>);

    return Object.keys(grouped).map((key) => {
        return {
            key,
            values: grouped[key]
        };
    });
}
