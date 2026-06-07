import "dotenv/config";
import { createServer } from "./server";

const port = Number(process.env["PORT"] ?? 7071);

createServer().listen(port, () => {
  console.log(`Signal Foundry MCP server listening on ${port}`);
});
