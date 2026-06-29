import express, { Request, Response } from "express";
const router = express.Router();

import pool from "../db/database.js";

router.get('/test', async(req: Request, res: Response) => {
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;
    const properties = await pool.query("SELECT * FROM rets_property LIMIT ? OFFSET ?", [limit, offset]);
    res.json({
        "total": properties.length,
        "limit": limit,
        "offset": offset,
        "results": properties[0]
    });
});

export default router;