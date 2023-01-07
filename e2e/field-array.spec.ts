import { makePageHelpers } from "@e2e-helpers/page";
import { test, expect } from "@playwright/test";

test("field array append", async ({ page }) => {
	const { expectSubmittedValues, getByLabel } = makePageHelpers(
		page,
		"Field Array",
	);

	const email = "me2@example.com";
	const user = "Bruce";
	const password = "secret";

	await page.goto("http://localhost:3700/");
	await page
		.getByRole("region", { name: "Field Array" })
		.getByRole("button", { name: "E-mail" })
		.click();
	await getByLabel("E-mail 2").fill(email);

	await page
		.getByRole("region", { name: "Field Array" })
		.getByRole("button", { name: "User" })
		.click();
	await getByLabel("User name 2").fill(user);
	await getByLabel("Password 2").fill(password);
	await getByLabel("Password 2").press("Enter");

	await expectSubmittedValues(
		`{"emails":["me@example.com","${email}"],"users":[{"name":"Peter","password":"monkey7"},{"name":"${user}","password":"${password}"}],"submit":"success"}`,
	);
});
