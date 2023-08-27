import type { ChangeEvent, FormEvent, MouseEvent, ReactNode } from "react";
import {
	createContext,
	useContext,
	useMemo,
	useRef,
	useSyncExternalStore,
} from "react";
import { flattenValues } from "./flattenValues";
import {
	FieldMeta,
	FieldValue,
	FormMetaState,
	FormStateValue,
	FormValuesObject,
} from "./form-state";
import { useEvent } from "./useEvent";
import { generateRandId } from "./utils";

export interface UseFormOptions {
	defaultValues: FormValuesObject;
	synchronizedFields?: Record<string, SynchronizedFields>;
}

export function useForm({
	defaultValues,
	synchronizedFields = {},
}: UseFormOptions) {
	const subscribersRef = useRef(new Set<Subscriber>());

	const values = flattenValues(defaultValues);
	const stateRef = useRef<FormStateValue>({
		defaultValues,
		values,
		flatDefaultValues: values,
		arrays: findFieldArrays(defaultValues),
		fieldMeta: {},
		formMeta: { state: "valid", submitCount: 0 },
	});

	const getSynchronizedFields = useEvent(() => synchronizedFields);

	const publishState = useEvent((nextState: FormStateValue) => {
		stateRef.current = nextState;
		subscribersRef.current.forEach((fn) => fn());
	});

	const updateState = useEvent(
		(updater: (current: FormStateValue) => FormStateValue) => {
			const nextState = updater(stateRef.current);
			publishState(nextState);
		},
	);

	const store = useMemo(
		() => ({
			getSnapshot: () => stateRef.current,
			subscribe: (listener: () => void) => {
				subscribersRef.current.add(listener);
				return () => {
					subscribersRef.current.delete(listener);
				};
			},
		}),
		[],
	);

	const getValues = () => store.getSnapshot().values;

	return useMemo(
		() => ({
			store,
			updateState,
			getValues,
			setValue: (
				name: string,
				value: FieldValue,
				options?: { isTouched: boolean },
			) => {
				const syncFields = getSynchronizedFields();
				updateState((state) => {
					const currentMeta = state.fieldMeta[name] ?? {
						isDirty: false,
						isTouched: true,
					};
					const isDirty = value !== state.flatDefaultValues.get(name);
					const isTouched = options?.isTouched ?? currentMeta.isTouched;
					state.values.set(name, value);
					if (
						currentMeta.isDirty !== isDirty ||
						currentMeta.isTouched !== isTouched
					) {
						state.fieldMeta[name] = { isDirty, isTouched, hasError: false };
					}
					syncFields?.[name]?.({
						getValues: () => state.values,
						setValue: (n: string, v: FieldValue) => state.values.set(n, v),
					});
					return state;
				});
			},
			setState: (metaState: FormMetaState) => {
				updateState((state) => {
					if (
						metaState === "submitted" &&
						state.formMeta.state !== "submitted"
					) {
						state.formMeta.submitCount += 1;
					}
					return state;
				});
			},
			reset: (values?: FormValuesObject) => {
				const currentState = stateRef.current;
				const newDefaultValues = values ?? currentState.defaultValues;
				const flatValues = flattenValues(newDefaultValues);
				publishState({
					defaultValues: newDefaultValues,
					values: flatValues,
					flatDefaultValues: flatValues,
					formMeta: {
						state: "valid",
						submitCount: currentState.formMeta.submitCount,
					},
					fieldMeta: {},
					arrays: findFieldArrays(newDefaultValues),
				});
			},
		}),
		[publishState, store, updateState],
	);
}

export type FormInstance = ReturnType<typeof useForm>;
type FieldArrayState = Record<string, { fields: { key: string }[] }>;
type Subscriber = () => void;
type SynchronizedFields = (
	form: Pick<FormInstance, "getValues" | "setValue">,
) => void;

export function findFieldArrays(values: FormValuesObject) {
	const entries: [key: string, value: FieldArrayState[string]][] = [];
	findFieldArraysRecursively(values, "", entries);
	return new Map(entries);
}

function findFieldArraysRecursively(
	values: FormValuesObject,
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
			// todo: avoid typecast
			findFieldArraysRecursively(value as FormValuesObject, `${name}.`, result);
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

const FormContext = createContext<FormInstance>({
	getValues: () => new Map(),
	setValue: () => {},
	setState: () => {},
	reset: () => {},
	updateState: () => {},
	store: {
		getSnapshot: () => ({
			defaultValues: {},
			values: new Map(),
			flatDefaultValues: new Map(),
			arrays: new Map(),
			fieldMeta: {},
			formMeta: { state: "valid", submitCount: 0 },
		}),
		subscribe: () => () => {},
	},
});

function useFormContext() {
	return useContext(FormContext);
}

interface FormProps {
	id: string;
	formInstance: FormInstance;
	children?: ReactNode;
	onSubmit: (values: any) => void;
	className?: string;
}

export function Form({
	id,
	formInstance,
	children,
	onSubmit,
	className,
}: FormProps) {
	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const {
			values,
			formMeta: { state },
		} = formInstance.store.getSnapshot();
		if (state === "submitted" || state === "submitting") {
			return;
		}
		formInstance.setState("submitting");
		await onSubmit(values);
	};
	return (
		<FormContext.Provider value={formInstance}>
			<form id={id} onSubmit={handleSubmit} className={className}>
				{children}
			</form>
		</FormContext.Provider>
	);
}

export function useFormField(name: string) {
	const { setValue } = useFormContext();
	const value = useFieldValue(name);
	const meta = useFieldMeta(name);

	return [
		{
			name,
			value,
			// TODO: add support for non event (maybe use a separate hook for cleaner code)
			onChange: (
				event: ChangeEvent<HTMLInputElement> | MouseEvent<HTMLButtonElement>,
			) => {
				setValue(name, event.currentTarget.value, { isTouched: true });
			},
		},
		meta,
	] as const;
}

function useFieldValue(name: string) {
	const { store } = useFormContext();
	return useSyncExternalStore(store.subscribe, () =>
		store.getSnapshot().values.get(name),
	);
}

const defaultFieldMeta: FieldMeta = {
	isDirty: false,
	isTouched: false,
	hasError: false,
};

export function useFieldMeta(name: string) {
	const { store } = useFormContext();
	return (
		useSyncExternalStore(
			store.subscribe,
			() => store.getSnapshot().fieldMeta[name],
		) ?? defaultFieldMeta
	);
}

export function useCheckbox(name: string) {
	const { setValue } = useFormContext();
	const checked = useFieldValue(name);

	return {
		name,
		checked,
		onChange: (event: ChangeEvent<HTMLInputElement>) => {
			setValue(name, event.currentTarget.checked, { isTouched: true });
		},
	};
}

export function useFormStateField<Field extends keyof FormStateValue>(
	field: Field,
	instance?: FormInstance,
): FormStateValue[Field] {
	const contextForm = useFormContext();
	const { store } = instance ?? contextForm;

	return useSyncExternalStore(
		store.subscribe,
		() => store.getSnapshot()[field],
	);
}

export function useFormMeta(instance?: FormInstance) {
	return useFormStateField("formMeta", instance);
}

export function useFieldArray(name: string, instance?: FormInstance) {
	const contextForm = useFormContext();
	const { store, updateState } = instance ?? contextForm;

	const arrays = useSyncExternalStore(store.subscribe, () =>
		store.getSnapshot().arrays.get(name),
	);

	return {
		fields:
			arrays?.fields.map(({ key }, idx) => ({ key, name: `${name}.${idx}` })) ??
			[],
		append: useEvent((value) => {
			updateState((state) => {
				const fieldArray = state.arrays.get(name);
				if (!fieldArray) {
					return state;
				}
				const nextFields = [...fieldArray.fields, { key: generateRandId() }];
				const nextIndex = fieldArray.fields.length ?? 0;
				state.arrays.set(name, { ...fieldArray, fields: nextFields });

				const flatValue = flattenValues(value, `${name}.${nextIndex}`);
				for (const [key, value] of flatValue) {
					state.values.set(key, value);
				}
				// todo: find field arrays in value and add them to "arrays".
				return state;
			});
		}),
		remove: useEvent((index: number) => {
			updateState((state) => {
				const fieldArray = state.arrays.get(name);
				if (!fieldArray) {
					return state;
				}
				for (const key of state.values.keys()) {
					if (key.startsWith(`${name}.${index}.`)) {
						state.values.delete(key);
					}
				}

				state.arrays.set(name, {
					...fieldArray,
					fields: fieldArray.fields.filter((_, idx) => idx !== index),
				});

				// todo: find field arrays in value and remove from "arrays".
				return state;
			});
		}),
	};
}
