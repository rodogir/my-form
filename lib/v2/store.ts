import { dequal } from "dequal";
import { ZodSchema } from "zod";
import { StoreApi, createStore } from "zustand";
import { generateRandId, get } from "../utils";
import { FieldName, FieldValue, TypedFieldName } from "./base-types";
import { setIn } from "./immutable-utils";

export type FormValues = Record<string, any>;
export type FieldArrayState = Record<string, { fields: { key: string }[] }>;
export type FieldMeta = {
	isDirty: boolean;
	isTouched: boolean;
	isInvalid: boolean;
	errorMessage?: string;
	validator?: FieldValidator;
};

export interface FieldValidator {
	// todo: add support for async validators, onBlur
	onChange?: ZodSchema;
}

export type FormMetaState =
	| "valid"
	| "validating"
	| "submitted"
	| "submitting"
	| "error";

export interface FormState<TValues extends FormValues> {
	defaultValues: TValues;
	values: TValues;
	arrays: {
		[key in FieldName<TValues>]?: { fields: { key: string }[] };
	};
	formMeta: { state: FormMetaState; submitCount: number };
	fieldMeta: {
		[key in FieldName<TValues>]?: FieldMeta;
	};
}

export interface FormFieldProps<TValues extends FormValues, TFieldValue> {
	form: any;
	name: TypedFieldName<TValues, TFieldValue>;
}

export interface FormStoreOptions<TValues> {
	defaultValues: TValues;
}

export function createFormStore<TValues extends FormValues>({
	defaultValues,
}: FormStoreOptions<TValues>) {
	return createStore<FormState<TValues>>()(() => ({
		defaultValues: defaultValues,
		values: defaultValues,
		arrays: findFieldArrays(defaultValues),
		formMeta: { state: "valid", submitCount: 0 },
		fieldMeta: {},
	}));
}

export function createInitialFormState<TValues extends FormValues>({
	defaultValues,
	submitCount = 0,
}: { defaultValues: TValues; submitCount?: number }): FormState<TValues> {
	return {
		defaultValues: defaultValues,
		values: defaultValues,
		arrays: findFieldArrays(defaultValues),
		formMeta: { state: "valid", submitCount },
		fieldMeta: {},
	};
}

export function setValue<
	TValues extends FormValues,
	TName extends FieldName<TValues>,
>(
	store: StoreApi<FormState<TValues>>,
	name: TName,
	value: FieldValue<TValues, TName>,
) {
	store.setState((oldState) => {
		const { validator } = oldState.fieldMeta[name] ?? {};

		// todo: this should be a seperate function
		const { isInvalid, errorMessage } = (() => {
			if (!validator || !validator.onChange) {
				return { isInvalid: false, errorMessage: undefined };
			}
			const validationResult = validator.onChange?.safeParse(value);

			if (validationResult.success) {
				return { isInvalid: false, errorMessage: undefined };
			}

			return {
				isInvalid: true,
				errorMessage: validationResult?.error.issues[0]?.message,
			};
		})();

		const isTouched = true;

		const isDirty = dequal(get(oldState.defaultValues, name), value);

		const values = setIn(oldState.values, name, value);

		return {
			...oldState,
			values,
			fieldMeta: {
				...oldState.fieldMeta,
				[name]: {
					...oldState.fieldMeta[name],
					isDirty,
					isTouched,
					errorMessage,
					isInvalid,
				},
			},
		};
	});
}

export function startSubmit<TValues extends FormValues>(
	store: StoreApi<FormState<TValues>>,
) {
	store.setState((oldState) =>
		setIn(oldState, "formMeta.state", "submitting" satisfies FormMetaState),
	);
}

export function endSubmit<TValues extends FormValues>(
	store: StoreApi<FormState<TValues>>,
) {
	store.setState((oldState) =>
		setIn(oldState, "formMeta", {
			state: "submitted",
			submitCount: oldState.formMeta.submitCount + 1,
		}),
	);
}

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
