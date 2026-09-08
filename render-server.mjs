import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.join(__dirname, "packages/demo/dist");
const port = Number(process.env.PORT || 10000);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".wasm": "application/wasm",
  ".map": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function safePath(urlPath) {
  const pathname = decodeURIComponent(urlPath.split("?")[0] || "/");
  const relative = pathname.replace(/^\/+/, "");
  const candidate = path.resolve(publicRoot, relative);
  if (candidate !== publicRoot && !candidate.startsWith(`${publicRoot}${path.sep}`)) {
    return null;
  }
  return candidate;
}

async function sendFile(res, filePath) {
  const data = await fs.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "Content-Type": contentTypes[ext] || "application/octet-stream",
    "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600",
  });
  res.end(data);
}

const server = http.createServer(async (req, res) => {
  try {
    const target = safePath(req.url || "/");
    if (!target) {
      res.writeHead(400);
      res.end("Bad request");
      return;
    }

    try {
      const stat = await fs.stat(target);
      if (stat.isFile()) {
        await sendFile(res, target);
        return;
      }
    } catch {}

    // SPA fallback for the demo UI.
    await sendFile(res, path.join(publicRoot, "index.html"));
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end("Internal server error");
  }
});

server.on("upgrade", (req, socket, head) => {
  if ((req.url || "").startsWith("/wisp/")) {
    wisp.routeRequest(req, socket, head);
    return;
  }
  socket.destroy();
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Scramjet listening on 0.0.0.0:${port}`);
  console.log(`Demo: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`}`);
  console.log("Wisp: /wisp/");
});
