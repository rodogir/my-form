import { makePageHelpers } from "@e2e-helpers/page";
import { test, expect } from "@playwright/test";

test("synchronized fields", async ({ page }) => {
	const { getByLabel } = makePageHelpers(page, "Synchronized Fields");

	await page.goto("http://localhost:3700/");

	await getByLabel("Given name").fill("Bruce");
	await getByLabel("Last name").fill("Wayne");

	await expect(getByLabel("Full name")).toHaveValue("Bruce Wayne");
});
