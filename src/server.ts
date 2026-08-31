import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

async function startServer() {
  await connectDB();

  const PORT = Number(env.PORT) || 4000;
  app.listen(PORT, () => {
    console.log(`[Server] ABC School Backend running on http://localhost:${PORT}`);
    console.log(`[Server] Health check available at http://localhost:${PORT}/health`);
    console.log(`[Server] Numbers API available at http://localhost:${PORT}/api/numbers`);
  });
}

startServer().catch((err) => {
  console.error("[Server] Failed to start server:", err);
});
