const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const rawPort = process.env.PORT;
const port = rawPort ? (isNaN(Number(rawPort)) ? rawPort : Number(rawPort)) : 3000;
const hostname = process.env.HOSTNAME || "0.0.0.0";

const app = next({ dev, hostname, port: typeof port === "number" ? port : 3000 });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
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
