import express from "express";
import cors from "cors";
import createFromRefRouter from "./routes/createFromRef.js";
import editImageRouter from "./routes/editImage.js";
import editWithMaskRouter from "./routes/editWithMask.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Route inclusions
app.use("/", createFromRefRouter);
app.use("/", editImageRouter);
app.use("/", editWithMaskRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
