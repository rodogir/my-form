import { test, expect } from "@playwright/test";

test("simple", async ({ page }) => {
	await page.goto("http://localhost:3700/");
	await page
		.getByRole("region", { name: "Simple Example" })
		.getByLabel("Given name")
		.click();
	await page
		.getByRole("region", { name: "Simple Example" })
		.getByLabel("Given name")
		.fill("Rodrigo");
	await page
		.getByRole("region", { name: "Simple Example" })
		.getByLabel("Given name")
		.press("Tab");
	await page
		.getByRole("region", { name: "Simple Example" })
		.getByLabel("Last name")
		.fill("Benz");
	await page
		.getByRole("region", { name: "Simple Example" })
		.getByLabel("Last name")
		.press("Enter");
	await page
		.getByRole("region", { name: "Simple Example" })
		.getByTestId("toggle-submitted-values")
		.click();
	await expect(
		page
			.getByRole("region", { name: "Simple Example" })
			.getByTestId("submitted-values"),
	).toHaveAttribute(
		"values",
		`{"firstName":"Rodrigo","lastName":"Benz","submit":"success"}`,
	);
});
