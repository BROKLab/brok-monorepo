import { test, expect } from "@playwright/test";
import { ethers } from "ethers";

// test.beforeAll(() => {
// 	const projectDir = process.cwd();
// 	loadEnvConfig(projectDir);
// });

test("/api/custodyAccont should return an address", async ({ request, baseURL }) => {
	const res = await request.post(`${baseURL}/api/custodyAccount`, {
		headers: {
			"Content-Type": "application/json",
		},
		data: JSON.stringify({}),
	});
	const json = await res.json();
	expect("address" in json).toBe(true);
	expect(json.address).toContain("0x");
	expect(ethers.utils.isAddress(json.address)).toBe(true);
	// TODO Make test that checks received address is useable .e.g. can send to it
});
