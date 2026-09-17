import app from "./app";
import { initializeAdmin } from "./modules/staff/auth.service";

const PORT = process.env.PORT || 3001;

async function startServer() {
  await initializeAdmin();

  app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
  });
}

startServer();
