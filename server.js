const { createServer } = require("http");
const { parse } = require("url");
const fs = require("fs");
const path = require("path");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const rawPort = process.env.PORT;
const port = rawPort ? (isNaN(Number(rawPort)) ? rawPort : Number(rawPort)) : 3000;
const hostname = process.env.HOSTNAME || "0.0.0.0";

const STATIC_MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
};

const app = next({ dev, hostname, port: typeof port === "number" ? port : 3000 });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);

        // High-performance static handler for runtime uploads (e.g., user avatars)
        if (parsedUrl.pathname && parsedUrl.pathname.startsWith("/uploads/")) {
          const safePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, "");
          const filePath = path.join(process.cwd(), "public", safePath);

          if (fs.existsSync(filePath)) {
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
              const ext = path.extname(filePath).toLowerCase();
              res.statusCode = 200;
              res.setHeader("Content-Type", STATIC_MIME_TYPES[ext] || "application/octet-stream");
              res.setHeader("Content-Length", stat.size);
              res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          }
        }

        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Server request error:", err);
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    });

    server.once("error", (err) => {
      console.error("Server listen error:", err);
      process.exit(1);
    });

    server.listen(port, () => {
      console.log(`> Nova Studio server ready on ${port} (PID: ${process.pid})`);
    });

    // Graceful shutdown guards against ERR_SERVER_NOT_RUNNING
    const shutdown = () => {
      if (server && server.listening) {
        server.close(() => {
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  })
  .catch((err) => {
    console.error("Failed to initialize Next.js server:", err);
    process.exit(1);
  });
