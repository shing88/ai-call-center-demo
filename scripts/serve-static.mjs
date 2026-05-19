import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

process.stdout.on("error", () => undefined);
process.stderr.on("error", () => undefined);

const rootDir = resolve(process.argv[2] ?? "dist");
const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? "4173");
const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"]
]);

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${host}:${port}`);
  const relativePath = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1));
  const filePath = resolve(rootDir, relativePath);

  if (!filePath.startsWith(`${rootDir}${sep}`) && filePath !== rootDir) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes.get(extname(filePath)) ?? "application/octet-stream"
    });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

server.listen(port, host, () => {
  console.log(`Serving ${rootDir} at http://${host}:${port}/`);
});
