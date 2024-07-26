// app.js
import express from "express";
import routes from "./routes/index.js";
import cors from "cors";
const app = express();

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["X-Requested-With", "content-type", "Authorization"],
    credentials: true,
  })
);

app.use("/", routes);

export default app;
