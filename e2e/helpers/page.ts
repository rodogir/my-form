import { expect, Page } from "@playwright/test";

export function makePageHelpers(page: Page, region: string) {
	return {
		getByLabel: (label: string) =>
			page.getByRole("region", { name: region }).getByLabel(label),
		expectSubmittedValues: (values: string) =>
			expect(
				page
					.getByRole("region", { name: region })
					.getByTestId("submitted-values"),
			).toHaveAttribute("data-values", values),
	};
}
