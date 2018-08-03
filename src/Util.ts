export async function fileReaderAsync<T>(file: Blob) {
    return new Promise<T>((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
            if (e.target && e.target.result) {
                resolve(e.target && e.target.result as T);
            } else {
                reject(new Error("No result"));
            }
        };
        reader.onerror = reject;
    });
}

export function download(file: Blob, filename: string) {
    if (window.navigator.msSaveOrOpenBlob) {// IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    } else {
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
}