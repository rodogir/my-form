import { getByPathArray, Path, pathToArray } from "./utils";

export function set<T extends Record<string, unknown> | unknown[]>(
	object: T,
	path: Path<T>,
	value: unknown,
): T {
	return setByPathArray(object, pathToArray(path), value);
}

function setByPathArray<T extends Record<string, unknown> | unknown[]>(
	object: T,
	pathArray: string[],
	value: unknown,
): T {
	const head = pathArray.slice(0, -1);
	const tail = pathArray.slice(-1)[0];

	if (!tail) {
		return object;
	}

	const objectToUpdate = getByPathArray(object, head);
	const updated = Array.isArray(objectToUpdate)
		? (() => {
				const copy = [...objectToUpdate];
				copy[Number.parseInt(tail, 10)] = value;
				return copy;
		  })()
		: { ...objectToUpdate, [tail]: value };

	if (head.length === 0) {
		return updated;
	}
	return setByPathArray(object, head, updated);
}

if (import.meta.vitest) {
	const { it, expect } = import.meta.vitest;
	it("set", () => {
		const object = { a: { b: { c: "TEST" } } };
		expect(set(object, "a", "1")).toEqual({ a: "1" });
		expect(set(object, "a.b", "1")).toEqual({ a: { b: "1" } });
		expect(set(object, "a.b.c", "1")).toEqual({ a: { b: { c: "1" } } });

		const array = ["a", "b", "c"];
		expect(set(array, "0", "A")).toEqual(["A", "b", "c"]);
		expect(set(array, "1", "B")).toEqual(["a", "B", "c"]);

		const mixed = { a: { b: [{ c: 1 }, { c: 2 }] } };
		expect(set(mixed, "a.b.0", "A")).toEqual({
			a: { b: ["A", { c: 2 }] },
		});
		expect(set(mixed, "a.b.1.c", 10)).toEqual({
			a: { b: [{ c: 1 }, { c: 10 }] },
		});
	});
}
