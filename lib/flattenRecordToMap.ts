function flattenRecordToMap(
	record: Record<string, unknown>,
	parentKey = "",
): Map<string, unknown> {
	const resultMap = new Map<string, unknown>();

	for (const key in record) {
		const newKey = parentKey ? `${parentKey}.${key}` : key;
		const value = record[key];

		if (Array.isArray(value)) {
			value.forEach((item, index) => {
				const arrayKey = `${newKey}.${index}`;
				if (typeof item === "object" && !Array.isArray(item)) {
					const innerMap = flattenRecordToMap(item, arrayKey);
					for (const [innerKey, value] of innerMap.entries()) {
						resultMap.set(innerKey, value);
					}
				} else {
					resultMap.set(arrayKey, item);
				}
			});
		} else if (value && typeof value === "object") {
			const innerMap = flattenRecordToMap(
				value as Record<string, unknown>,
				newKey,
			);
			for (const [innerKey, value] of innerMap.entries()) {
				resultMap.set(innerKey, value);
			}
		} else {
			resultMap.set(newKey, value);
		}
	}

	return resultMap;
}

if (import.meta.vitest) {
	const { describe, it, expect } = import.meta.vitest;

	describe("flattenRecordToMap", () => {
		it("flattens a nested record into a map", () => {
			const record = {
				name: { givenName: "John", lastName: "Doe" },
				age: 25,
				address: { street: "123 Main St", city: "Anytown" },
			};

			const flattenedMap = flattenRecordToMap(record);

			expect(flattenedMap.get("name.givenName")).toBe("John");
			expect(flattenedMap.get("name.lastName")).toBe("Doe");
			expect(flattenedMap.get("age")).toBe(25);
			expect(flattenedMap.get("address.street")).toBe("123 Main St");
			expect(flattenedMap.get("address.city")).toBe("Anytown");
		});

		it("handles flat records", () => {
			const record = { name: "John Doe", age: 30 };

			const flattenedMap = flattenRecordToMap(record);

			expect(flattenedMap.get("name")).toBe("John Doe");
			expect(flattenedMap.get("age")).toBe(30);
		});

		it("returns an empty map for an empty record", () => {
			const record = {};

			const flattenedMap = flattenRecordToMap(record);

			expect(flattenedMap.size).toBe(0);
		});

		it("should handle nested objects inside arrays", () => {
			const input = {
				users: [
					{ name: { first: "John", last: "Doe" }, age: 30 },
					{ name: { first: "Jane", last: "Smith" }, age: 25 },
				],
			};

			const result = flattenRecordToMap(input);

			expect(result.get("users.0.name.first")).toEqual("John");
			expect(result.get("users.0.name.last")).toEqual("Doe");
			expect(result.get("users.0.age")).toEqual(30);
			expect(result.get("users.1.name.first")).toEqual("Jane");
			expect(result.get("users.1.name.last")).toEqual("Smith");
			expect(result.get("users.1.age")).toEqual(25);
		});
	});
}
