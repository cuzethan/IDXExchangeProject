import express, { Request, Response } from "express";
import properties from "./properties.js";
const router = express.Router();

//import cors from "cors";
import pool from "../db/database.js";

router.get("/health", async (req: Request, res: Response) => {
    try {
        await pool.query("SELECT 1");
        res.json({ status: "ok", database: "connected" });
    } catch {
        res.status(500).json({ status: "error", database: "disconnected" });
    }
});

router.use("/properties", properties);

export default router
