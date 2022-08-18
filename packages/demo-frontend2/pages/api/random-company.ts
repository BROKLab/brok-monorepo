// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { readFileSync } from "fs";
import {join, resolve} from 'path'
import getConfig from 'next/config';


type Data = {
  length: number
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const serverRuntimeConfig= getConfig()
  console.log(serverRuntimeConfig)
  const file = resolve( './pages/api/demo-data/companies.json');
  const json = readFileSync( file, "utf8");
  const companies = JSON.parse(json ) as any[]
  companies.length
  res.status(200).json({ length: companies.length })
}
