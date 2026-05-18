import { copyFile, mkdir } from "node:fs/promises";

const distUrl = new URL("../dist/", import.meta.url);

await mkdir(distUrl, { recursive: true });
await copyFile(new URL("../index.html", import.meta.url), new URL("index.html", distUrl));
await copyFile(new URL("../src/styles.css", import.meta.url), new URL("styles.css", distUrl));
