import { makePageHelpers } from "@e2e-helpers/page";
import { test } from "@playwright/test";

test("simple", async ({ page }) => {
	const { expectSubmittedValues, getByLabel } = makePageHelpers(
		page,
		"Simple Example",
	);

	const givenName = "Bruce";
	const lastName = "Wayne";

	await page.goto("http://localhost:3700/");
	await getByLabel("Given name").fill(givenName);
	await getByLabel("Last name").fill(lastName);
	await getByLabel("Last name").press("Enter");
	await expectSubmittedValues(
		`{"firstName":"${givenName}","lastName":"${lastName}","submit":"success"}`,
	);
});
