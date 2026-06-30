import express, { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
const router = express.Router();

import pool from "../db/database.js";

router.get('/', async(req: Request, res: Response) => {

    let limit = 10;
    let offset = 0;
    let city = null;
    let zipcode = null;
    let minPrice = null;
    let maxPrice = null;
    let beds = null;
    let baths = null;

    interface TotalRow extends RowDataPacket {
        total: number;
    }
    const [totalResult] = await pool.query<TotalRow[]>("SELECT COUNT(*) AS total FROM rets_property");
    const total = totalResult[0].total;

    const knownParams = new Set([
        'limit', 'offset', 'city', 'zipcode',
        'minPrice', 'maxPrice', 'beds', 'baths',
      ]);

    for (const [key, value] of Object.entries(req.query)) {
        if (knownParams.has(key) && Array.isArray(value)) {
            return res.status(400).json({ 
                error: `The ${key} parameter must be a single value`
            });
        }

        switch (key) {
            case 'limit':
                limit = Number(value);
                if (isNaN(limit)) return res.status(400).json({ error: `The ${key} parameter must be a number`});
                if (limit <= 0) return res.status(400).json({ error: `The ${key} parameter must be greater than 0`});
                if (limit > total) return res.status(400).json({ error: `The ${key} parameter must be less than the total number of properties`});
                break;
            case 'offset':
                offset = Number(value);
                break;
            case 'city':
                city = value;
                break;
            case 'zipcode':
                zipcode = value;
                break;
            case 'minPrice':
                minPrice = Number(value);
                break;
            case 'maxPrice':
                maxPrice = Number(value);
                break;
            case 'beds':
                beds = Number(value);
                break;
            case 'baths':
                baths = Number(value);
                break;
            default:
                return res.status(400).json({ error: `Unknown parameter: ${key}` });
        }
    }

    const [results] = await pool.query("SELECT * FROM rets_property LIMIT ? OFFSET ?", [limit, offset]);

    res.json({
        "total": total,
        "limit": limit,
        "offset": offset,
        "results": results
    });
});

export default router;