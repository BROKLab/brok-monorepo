// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { readFileSync } from "fs";
import {resolve} from 'path'
import { Organisasjon } from './demo-data/companies.types';


type Data = {
  data: Organisasjon[]
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'GET') {
    const amount = parseInt("amount" in req.query && typeof req.query.amount === "string" ? req.query.amount : "1")
      const file = resolve( './pages/api/demo-data/companies.json');
      const json = readFileSync( file, "utf8");
      const data = JSON.parse(json ) as Organisasjon[]
      let orgs : Organisasjon[]= [];
      for(let i = 0; i < amount; i++) {
        const random = Math.floor(Math.random() * (data.length + 1) + 0)
        orgs.push(data[random])
      }
      res.status(200).json({
        data: orgs
      })
    }
  res.status(500)
}
