import express, { Request, Response } from "express";
const router = express.Router();

import pool from "../db/database.js";

router.get('/', async(req: Request, res: Response) => {

    let limit = 10;
    let offset = 0;

    let queryList = [];
    let params = [];

    const knownParams = new Set(['limit', 'offset', 'city', 'zipcode', 'minPrice', 'maxPrice', 'beds', 'baths']);

    for (const [key, value] of Object.entries(req.query)) {
        //returns error if the parameter is an array (Express can return arrays in query params)
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
                break;
            case 'offset':
                offset = Number(value);
                if (isNaN(offset)) return res.status(400).json({ error: `The ${key} parameter must be a number`});
                if (offset < 0) return res.status(400).json({ error: `The ${key} parameter must be greater than 0`});
                break;
            case 'city':
                queryList.push('LOWER(TRIM(L_City)) = LOWER(TRIM(?))');
                params.push(value);
                break;
            case 'zipcode':
                let zipcode = value;
                queryList.push('L_Zip = ?');
                params.push(zipcode);
                break;
            case 'minPrice':
                let minPrice = Number(value);
                if (isNaN(minPrice)) return res.status(400).json({ error: `The ${key} parameter must be a number`});
                if (minPrice < 0) return res.status(400).json({ error: `The ${key} parameter must be greater than 0`});
                queryList.push('L_SystemPrice >= ?');
                params.push(minPrice);
                break;
            case 'maxPrice':
                let maxPrice = Number(value);
                if (isNaN(maxPrice)) return res.status(400).json({ error: `The ${key} parameter must be a number`});
                if (maxPrice < 0) return res.status(400).json({ error: `The ${key} parameter must be greater than 0`});
                queryList.push('L_SystemPrice <= ?');
                params.push(maxPrice);
                break;
            case 'beds':
                let beds = Number(value);
                if (isNaN(beds)) return res.status(400).json({ error: `The ${key} parameter must be a number`});
                if (beds < 0) return res.status(400).json({ error: `The ${key} parameter must be greater than 0`});
                queryList.push('L_Keyword2 = ?');
                params.push(beds);
                break;
            case 'baths':
                let baths = Number(value);
                if (isNaN(baths)) return res.status(400).json({ error: `The ${key} parameter must be a number`});
                if (baths < 0) return res.status(400).json({ error: `The ${key} parameter must be greater than 0`});
                queryList.push('LM_Dec_3 = ?');
                params.push(baths);
                break;
            default:
                return res.status(400).json({ error: `Unknown parameter: ${key}` });
        }
    }

    const whereClause = queryList.length > 0 ? ' WHERE ' + queryList.join(' AND ') : '';

    const countQuery = 'SELECT COUNT(*) AS total FROM rets_property' + whereClause;

    const [rows] = await pool.query(countQuery, params);
    console.log(rows);
    const total = (rows as { total: number }[])[0].total;

    if (limit > total) {
        return res.status(400).json({ error: 'The limit parameter must be less than the total number of properties' });
    }

    const query = 'SELECT * FROM rets_property' + whereClause + ' LIMIT ? OFFSET ?';
    const [results] = await pool.query(query, [...params, limit, offset]);

    res.json({
        "total": total,
        "limit": limit,
        "offset": offset,
        "results": results
    });
});

export default router;