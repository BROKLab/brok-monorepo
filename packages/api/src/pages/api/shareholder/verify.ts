import type { NextApiRequest, NextApiResponse } from "next";
import { GET_PROVIDER, SPEND_KEY, WALLET } from "../../../contants";
import { getStealthAddress } from "../../../utils/stealth";

type Data = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
	switch (req.method) {
		case "GET":
			// show wallet for user
			res.status(200).json({});
			res.end();
			break;
		case "POST":
			if ("address" in req.body) {
				// connect vc registry -> set authenticate
				//
			}

			res.status(200).json({
				address: "TODO",
			});
			res.end();
			break;
		default:
			res.setHeader("Allow", ["GET", "POST"]);
			res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
