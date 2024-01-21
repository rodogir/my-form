import { createStore } from "zustand";
import { generateRandId } from "../utils";
import { setIn } from "./immutable-utils";

export type FormValues = Record<string, any>;
export type FieldArrayState = Record<string, { fields: { key: string }[] }>;
export type FieldMeta = {
	isDirty: boolean;
	isTouched: boolean;
	hasError: boolean;
	message?: string;
};

export type FormMetaState =
	| "valid"
	| "validating"
	| "submitted"
	| "submitting"
	| "error";

export interface FormState<TValues extends FormValues> {
	deafaultValues: TValues;
	values: TValues;
	arrays: FieldArrayState;
	formMeta: { state: FormMetaState; submitCount: number };
	fieldMeta: Record<string, FieldMeta | undefined>;
	setValue: <TName extends FieldName<TValues>>(
		name: TName,
		value: FieldValue<TValues, TName>,
	) => void;
}

export interface FormStoreOptions<TValues> {
	defaultValues: TValues;
}

export function createFormStore<TValues extends FormValues>({
	defaultValues,
}: FormStoreOptions<TValues>) {
	return createStore<FormState<TValues>>()((set) => ({
		deafaultValues: defaultValues,
		values: defaultValues,
		arrays: findFieldArrays(defaultValues),
		formMeta: { state: "valid", submitCount: 0 },
		fieldMeta: {},
		setValue: (name, value) => {
			set((oldState) => {
				return setIn(oldState, `values.${name}` as any, value);
			});
		},
	}));
}

export type FieldName<T, TDepth extends any[] = []> = TDepth["length"] extends 5
	? never
	: T extends object
	  ? {
				[K in keyof T]: T[K] extends ReadonlyArray<infer U>
					?
							| `${K & string}`
							| (U extends object
									? `${K & string}.${number}.${FieldName<U, [...TDepth, any]> &
											string}`
									: never)
					: T[K] extends object
					  ?
								| `${K & string}`
								| `${K & string}.${FieldName<T[K], [...TDepth, any]> & string}`
					  : `${K & string}`;
		  }[keyof T]
	  : never;

export type FieldValue<T, TProp> = T extends Record<string | number, any>
	? TProp extends `${infer TBranch}.${infer TDeepProp}`
		? FieldValue<T[TBranch], TDeepProp>
		: T[TProp & string]
	: never;

export function findFieldArrays(values: FormValues) {
	const entries: [key: string, value: FieldArrayState[string]][] = [];
	findFieldArraysRecursively(values, "", entries);
	return Object.fromEntries(entries);
}

function findFieldArraysRecursively(
	values: FormValues,
	prefix: string,
	result: [key: string, value: FieldArrayState[string]][],
) {
	for (const name in values) {
		const value = values[name];

		if (Array.isArray(value)) {
			const fieldArrayName = `${prefix}${name}`;
			result.push([
				fieldArrayName,
				{
					fields: value.map(() => ({ key: generateRandId() })),
				},
			]);
			value.forEach((v, index) => {
				if (v && typeof v === "object") {
					findFieldArraysRecursively(v, `${fieldArrayName}.${index}.`, result);
				}
			});
			continue;
		}
		if (value && typeof value === "object") {
			findFieldArraysRecursively(value, `${name}.`, result);
		}
	}
}

if (import.meta.vitest) {
	const { it, expect } = import.meta.vitest;
	it("findFieldArrays", () => {
		expect(findFieldArrays({ emails: [] })).toEqual({ emails: { fields: [] } });
		expect(findFieldArrays({ emails: [], phones: [] })).toEqual({
			emails: { fields: [] },
			phones: { fields: [] },
		});
		expect(findFieldArrays({ emails: ["me@example.com"] })).toEqual({
			emails: { fields: [{ key: expect.any(String) }] },
		});
		expect(
			findFieldArrays({ contacts: [{ id: "1", name: "Bruce", emails: [] }] }),
		).toEqual({
			contacts: { fields: [{ key: expect.any(String) }] },
			"contacts.0.emails": { fields: [] },
		});
		expect(
			findFieldArrays({
				profile: { contacts: [{ id: "1", name: "Bruce", emails: [] }] },
			}),
		).toEqual({
			"profile.contacts": { fields: [{ key: expect.any(String) }] },
			"profile.contacts.0.emails": { fields: [] },
		});
	});
}
