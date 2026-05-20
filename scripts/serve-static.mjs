import { resolve } from "node:path";
import { createDemoServer } from "../dist/assets/server-runtime.js";

process.stdout.on("error", () => undefined);
process.stderr.on("error", () => undefined);

const rootDir = resolve(process.argv[2] ?? "dist");
const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? "4173");
const server = createDemoServer({ rootDir, host, port });

server.listen(port, host, () => {
  console.log(`Serving ${rootDir} with Node runtime at http://${host}:${port}/`);
});
