import produce from "immer";
import type { ChangeEvent, FormEvent, MouseEvent, ReactNode } from "react";
import {
	createContext,
	useContext,
	useMemo,
	useRef,
	useSyncExternalStore,
} from "react";
import { FieldMeta, FormMetaState, FormStateValue } from "./form-state";
import { useEvent } from "./useEvent";
import { get, set } from "./utils";

export interface UseFormOptions {
	defaultValues: FormValues;
	effects?: Record<string, FormEffect>;
}

export function useForm({ defaultValues, effects = {} }: UseFormOptions) {
	const subscribersRef = useRef(new Set<Subscriber>());
	const stateRef = useRef<FormStateValue>({
		defaultValues,
		values: defaultValues,
		arrays: findFieldArrays(defaultValues),
		fieldMeta: {},
		formMeta: { state: "valid", submitCount: 0 },
	});

	const getEffects = useEvent(() => effects);

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
				value: any,
				options?: { isTouched: boolean },
			) => {
				const effcts = getEffects();
				updateState((state) => {
					const currentMeta = state.fieldMeta[name] ?? {
						isDirty: false,
						isTouched: false,
					};
					const isDirty = value !== get(state.defaultValues, name);
					const isTouched = options?.isTouched ?? currentMeta.isTouched;

					return produce(state, (draft) => {
						set(draft.values, name, value);
						if (
							currentMeta.isDirty !== isDirty ||
							currentMeta.isTouched !== isTouched
						) {
							draft.fieldMeta[name] = { isDirty, isTouched };
						}
						effcts?.[name]?.({
							getValues: () => draft.values,
							setValue: (n: string, v: string) => set(draft.values, n, v),
						});
					});
				});
			},
			setState: (metaState: FormMetaState) => {
				updateState((state) =>
					produce(state, (draft) => {
						draft.formMeta.state = metaState;
						if (
							metaState === "submitted" &&
							state.formMeta.state !== "submitted"
						) {
							draft.formMeta.submitCount += 1;
						}
					}),
				);
			},
			reset: (values?: FormValues) => {
				const currentState = stateRef.current;
				const newDefaultValues = values ?? currentState.defaultValues;
				publishState({
					defaultValues: newDefaultValues,
					values: newDefaultValues,
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

// todo: add support for nested fields
function findFieldArrays(values: FormValues) {
	return Object.entries(values).reduce<FieldArrayState>(
		(acc, [name, value]) => {
			if (Array.isArray(value)) {
				acc[name] = { fields: value.map(() => ({ key: generateRandId() })) };
			}
			return acc;
		},
		{},
	);
}

function generateRandId() {
	return (Math.random() * 10 ** 10).toFixed(0);
}

export type FormInstance = ReturnType<typeof useForm>;
type FormValues = Record<string, any>;
type FieldArrayState = Record<string, { fields: { key: string }[] }>;
type Subscriber = () => void;
type FormEffect = (form: Pick<FormInstance, "getValues" | "setValue">) => void;

const FormContext = createContext<FormInstance>({
	getValues: () => ({}),
	setValue: () => {},
	setState: () => {},
	reset: () => {},
	updateState: () => {},
	store: {
		getSnapshot: () => ({
			defaultValues: {},
			values: {},
			arrays: {},
			fieldMeta: {},
			formMeta: { state: "valid", submitCount: 0 },
			getEffects: () => ({}),
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
		get(store.getSnapshot().values, name),
	);
}

const defaultFieldMeta: FieldMeta = { isDirty: false, isTouched: false };

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

	const arrays = useSyncExternalStore(
		store.subscribe,
		() => store.getSnapshot().arrays[name],
	);

	return {
		fields:
			arrays?.fields.map(({ key }, idx) => ({
				key,
				name: `${name}.${idx}`,
			})) ?? [],
		append: useEvent((value) => {
			updateState((current) => {
				return produce(current, (draft) => {
					draft.values[name].push(value);
					draft.arrays[name]?.fields.push({ key: generateRandId() });
				});
			});
		}),
		remove: useEvent((index: number) => {
			updateState((state) => {
				return produce(state, (draft) => {
					draft.values[name].splice(index, 1);
					draft.arrays[name]?.fields.splice(index, 1);
				});
			});
		}),
	};
}
