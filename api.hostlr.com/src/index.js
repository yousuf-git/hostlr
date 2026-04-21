import connectDatabase from "./database/database.js";
import { app } from "./app.js";
import initializeSocket from "./startup/socket.js";
import initializeJobs from "./startup/jobs.js";
import specs from "./startup/swagger.js";
import swaggerUi from "swagger-ui-express";

const startServer = async () => {
  try {
    await connectDatabase();
    app.use("/hostlr-api-docs", swaggerUi.serve, swaggerUi.setup(specs, {
      explorer: true,
      customSiteTitle: "HOSTLR API Docs",
      swaggerOptions: { persistAuthorization: true },
    }));
    const { server } = initializeSocket(app);
    initializeJobs();
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`HOSTLR API running on port ${PORT}`);
      console.log(`API Docs: http://localhost:${PORT}/hostlr-api-docs`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
};

startServer();
