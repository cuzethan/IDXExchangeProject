import "./env.js";
import express from "express";
import startPoint from "./routes/startPoint.js";

const app = express();
const port = 5000;

app.use("/api", startPoint)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});