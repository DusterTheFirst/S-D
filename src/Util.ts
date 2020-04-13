/*!
 * Copyright (C) 2018-2020  Zachary Kohnen (DusterTheFirst)
 */

export async function textFileReaderAsync(file: Blob) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (_) => {
            if (reader.result !== null) {
                resolve(reader.result.toString());
            } else {
                reject(new Error("No result"));
            }
        };
        reader.onerror = reject;
    });
}

export async function dataFileReaderAsync(file: Blob) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (_) => {
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
    const link = document.createElement("a");
    const url = URL.createObjectURL(file);

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }, 0);
}