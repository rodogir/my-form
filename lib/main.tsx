import { produce } from "immer";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import {
	createContext,
	useContext,
	useMemo,
	useRef,
	useSyncExternalStore,
} from "react";
import type { FieldMeta, FormStateValue } from "./form-state";
import { useEvent } from "./useEvent";
import { get, set } from "./utils";

export interface UseFormOptions {
	defaultValues: FormValues;
	effects?: Record<string, FormEffect>;
}

export function useForm({ defaultValues, effects }: UseFormOptions) {
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

	return useMemo(
		() => ({
			store,
			updateState,
			getValues: () => store.getSnapshot().values,
			setValue: (
				name: string,
				value: any,
				options?: { isTouched: boolean },
			) => {
				const effcts = getEffects();
				update((current) => {
					set(current.values, name, value);
					const currentMeta = current.fieldMeta[name] ?? {
						isDirty: false,
						isTouched: false,
					};
					const isDirty = value !== get(current.defaultValues, name);
					const isTouched = options?.isTouched ?? currentMeta.isTouched;
					if (
						currentMeta.isDirty !== isDirty ||
						currentMeta.isTouched !== isTouched
					) {
						// eslint-disable-next-line no-param-reassign
						current.fieldMeta[name] = { isDirty, isTouched };
					}
					effcts?.[name]?.(value, {
						getValues: () => store.getSnapshot().values,
						setValue: (n: string, v: string) => set(current.values, n, v),
					});
				});
			},
			setState: (state: FormState) => {
				const currentState = stateRef.current;
				const nextState: FormStateValue = {
					...stateRef.current,
					formMeta: {
						state,
						submitCount:
							state === "submitted" &&
							currentState.formMeta.state !== "submitted"
								? currentState.formMeta.submitCount + 1
								: currentState.formMeta.submitCount,
					},
				};
				publishState(nextState);
			},
			// defaultValues: initialValuesRef.current,
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
		[getEffects, publishState, store, update],
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

type FormInstance = ReturnType<typeof useForm>;
type FormValues = Record<string, any>;
type FieldArrayState = Record<string, { fields: { key: string }[] }>;
type Subscriber = () => void;
type FormState = "valid" | "submitted" | "submitting" | "error";
type FormEffect = (
	value: string,
	form: Pick<FormInstance, "getValues" | "setValue">,
) => void;

const FormContext = createContext<FormInstance>({
	getValues: () => ({}),
	setValue: () => {},
	setState: () => {},
	reset: () => {},
	update: () => {},
	store: {
		getSnapshot: () => ({
			defaultValues: {},
			values: {},
			arrays: {},
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
			// todo: add support for non event (maybe use a separate hook for cleaner code)
			onChange: (event: ChangeEvent<HTMLInputElement>) => {
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

export function useFormStateField(
	field: keyof FormStateValue,
	instance?: FormInstance,
) {
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
