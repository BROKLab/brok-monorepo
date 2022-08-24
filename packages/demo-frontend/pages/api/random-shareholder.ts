// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { readFileSync } from "fs";
import { resolve } from 'path'
import { Organisasjon } from './demo-data/companies.types';
import { ShareholderDemoData } from './demo-data/shareholder.types';

export type RandomShareholder = ShareholderDemoData & {
  postalCode: string;
  city: string;
  street: string;
}
type Data = {
  data: RandomShareholder[]
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'GET') {
    const amount = parseInt("amount" in req.query && typeof req.query.amount === "string" ? req.query.amount : "1")
    const file = resolve('./pages/api/demo-data/shareholders.json');
    const json = readFileSync(file, "utf8");
    const data = JSON.parse(json) as ShareholderDemoData[]
    const regex = /(.+?(?=\d{4}))(\d{4})\s(.+)/gm;
    let shareholders: RandomShareholder[] = [];
    while(shareholders.length < amount) {
      const random = Math.floor(Math.random() * (data.length + 1) + 0)
      const shareholder = data[random];
      // const res = shareholder.bostedsadresse.match(regex)
      const test = regex.exec(shareholder.bostedsadresse)
      if(Array.isArray(test)){
        shareholders.push({...shareholder, postalCode: test[2], city: test[3], street: test[1]})
      }
    }
    res.status(200).json({
      data: shareholders
    })
  }
  res.status(500)
}
