import express from "express";
import cors from "cors";
import morgan from "morgan";
import { readFromBytebin } from "./bytebin";
import { detectLanguage } from "./detect";

type DetectionResponse = [number, any];

const cache = new Map<string, Promise<DetectionResponse>>();

async function handleRequest(
  id: string,
  req: express.Request,
): Promise<DetectionResponse> {
  const { ok, data, errorMsg } = await readFromBytebin(
    id,
    process.env.BYTEBIN_API_KEY
      ? {
          "Bytebin-Api-Key": process.env.BYTEBIN_API_KEY,
          "Bytebin-Forwarded-For": req.ip!,
        }
      : {},
  );
  if (ok) {
    try {
      return [200, await detectLanguage(id, data)];
    } catch (e) {
      console.error(e);
      return [400, "server error"];
    }
  } else {
    return [400, errorMsg];
  }
}

async function main() {
  const app = express();
  app.use(morgan("dev"));
  app.use(cors());
  app.disable("x-powered-by");
  app.enable("trust proxy");

  app.get("/:code", async (req, res) => {
    const id = req.params.code;
    if (id === "favicon.ico") {
      res.status(404).send("not found");
      return;
    }

    let promise = cache.get(id);
    if (promise === undefined) {
      promise = handleRequest(id, req);
      cache.set(id, promise);
    }

    const [code, resp] = await promise;
    res.status(code).send(resp);
  });

  const port = 3000;
  const server = app.listen(port, () => {
    console.log("listening on port " + port);
  });

  function stop() {
    console.log("shutdown signal received, stopping server");
    server.close(() => {
      console.log("bye!");
    });
  }

  process.on("SIGTERM", () => stop());
  process.on("SIGINT", () => stop());
}

(async () => {
  await main();
})();
