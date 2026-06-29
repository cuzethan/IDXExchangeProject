import express, { Request, Response } from "express";
import properties from "./properties.js";
const router = express.Router();

//import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

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
