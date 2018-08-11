export async function fileReaderAsync(file: Blob) {
    return new Promise<string>((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
            if (reader.result !== null) {
                resolve(reader.result.toString());
            } else {
                reject(new Error("No result"));
            }
        };
        reader.onerror = reject;
    });
}

export function download(file: Blob, filename: string) {
    // IE 10+
    try {
        window.navigator.msSaveOrOpenBlob(file, filename);
    } catch (e) {
        alert(e);
    }

    let link = document.createElement("a");
    let url = URL.createObjectURL(file);

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }, 0);
}

/** A representation of a two dimensional array's size */
// interface ITwoDimensionalArraySize {
//     x: number;
//     ymax: number;
//     ymin: number;
// }
/** A representation of a two dimensional array's value key */
interface ITwoDimensionalArrayKey {
    x: number;
    y: number;
}
/** Wrapper for a two dimensional array of value V */
export class TwoDimensionalArray<V> {
    /** The array being wrapped */
    private array: Array<Array<V | undefined> | undefined>;

    /** The ISize representation of the two dimensional array */
    // public get size(): ITwoDimensionalArraySize {
    //     return {
    //         x: this.array.length,
    //         ymax: Math.max(... this.array.map(x => x !== undefined ? x.length : 0)),
    //         ymin: Math.min(... this.array.map(x => x !== undefined ? x.length : 0))
    //     };
    // }

    /** Create an empty two dimensional array */
    constructor();
    /** Wrap an already initialised two dimensional array */
    constructor(array?: V[][]);
    constructor(array?: V[][]) {
        this.array = array === undefined ? [] : array;
    }

    /** Clear the array */
    public clear() {
        this.array = [];
    }

    /**
     * Delete the array at the given coordanants
     */
    public delete(x: number, y?: number): boolean {
        if (y !== undefined) {
            let xelem = this.array[x];
            if (xelem !== undefined) {
                let [removed] = xelem.splice(y, 1);
                return removed !== undefined;
            } else {
                return false;
            }
        } else {
            let [removed] = this.array.splice(x, 1);
            return removed !== undefined;
        }
    }

    /** Iterate over all values of the two dimensional array */
    public forEach(callbackfn: (value: V, key: ITwoDimensionalArrayKey, array: this) => void, thisArg?: unknown) {
        this.array.forEach((xvalue, x) => {
            if (xvalue !== undefined) {
                xvalue.forEach((yvalue, y) => {
                    if (yvalue !== undefined) {
                        callbackfn(yvalue, { x, y }, this);
                    }
                });
            }
        });
    }

    /** Check if the two dimensional array has a value */
    public has(x: number, y?: number): boolean {
        if (y !== undefined) {
            return this.array[x] !== undefined && this.array[y] !== undefined;
        } else {
            return this.array[x] !== undefined;
        }
    }

    /** Set the value at the given coordanants */
    public set(x: number, value: V[]): this;
    public set(x: number, y: number, value: V): this;
    public set(x: number, yOrXValue: number | V[], valueOrNothing?: V): this {
        if (typeof yOrXValue === "number") {
            if (valueOrNothing !== undefined) {
                let value = valueOrNothing;
                let y = yOrXValue;

                let xarr = this.array[x];
                if (xarr === undefined) {
                    xarr = [];
                }
                xarr[y] = value;

                this.array[x] = xarr;
            }
        } else {
            let value = yOrXValue;
            this.array[x] = value;
        }
        return this;
    }

    /** Get the value at the given coords */
    public get(x: number): V[] | undefined;
    public get(x: number, y: number): V | undefined;
    public get(x: number, y?: number): V | V[] | undefined {
        if (y !== undefined) {
            let xarr = this.array[x];
            if (xarr !== undefined) {
                return xarr[y];
            } else {
                return undefined;
            }
        } else {
            return this.array[x] as V[];
        }
    }
}