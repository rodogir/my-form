import { useEffect, useRef } from "react";
import { ZodSchema } from "zod";
import { useStore } from "zustand";
import { FormValues } from "../form-state";
import { get } from "../utils";
import { FieldName, FieldValue, TypedFieldName } from "./base-types";
import {
	FieldMeta,
	FieldValidator,
	createFormStore,
	createInitialFormState,
	endSubmit,
	setValue,
	startSubmit,
} from "./store";

export type { FormValues };

export interface UseFormOptions<TValues extends FormValues> {
	defaultValues: TValues;
	onSubmit?: ({ values }: { values: TValues }) => Promise<void>;
}

export function useForm2<TValues extends FormValues>({
	defaultValues,
	onSubmit,
}: UseFormOptions<TValues>) {
	const store = useRef(createFormStore({ defaultValues })).current;
	return {
		store,
		handleSubmit: async () => {
			startSubmit(store);
			await onSubmit?.({ values: store.getState().values });
			endSubmit(store);
		},
		reset: (values?: TValues) => {
			const currentState = store.getState();
			store.setState(
				createInitialFormState({
					defaultValues: values ?? currentState.defaultValues,
					submitCount: currentState.formMeta.submitCount,
				}),
			);
		},
		setValue: <TName extends FieldName<TValues>>(
			name: TName,
			value: FieldValue<TValues, TName>,
		) => {
			setValue(store, name, value);
		},
		registerValidator: (
			name: FieldName<TValues>,
			validator?: FieldValidator,
		) => {
			store.setState((oldState) => ({
				...oldState,
				fieldMeta: {
					...oldState.fieldMeta,
					[name]: {
						...oldState.fieldMeta[name],
						validator,
					},
				},
			}));
			return () => {
				store.setState((oldState) => ({
					...oldState,
					fieldMeta: {
						...oldState.fieldMeta,
						[name]: {
							...oldState.fieldMeta[name],
							validator: undefined,
						},
					},
				}));
			};
		},
	};
}

export type FormApi<TValues extends FormValues = FormValues> = ReturnType<
	typeof useForm2<TValues>
>;

export interface FormFieldProps<TValues extends FormValues, TFieldValue> {
	form: FormApi<TValues>;
	name: TypedFieldName<TValues, TFieldValue>;
	validator?: { onChange?: ZodSchema } | undefined;
}

export function useFormField2<TValues extends FormValues, TFieldValue>({
	form,
	name,
	validator,
}: FormFieldProps<TValues, TFieldValue>) {
	const value = useStore(
		form.store,
		(state) => get(state.values, name) as TFieldValue,
	);
	const meta = useStore(
		form.store,
		(state) => state.fieldMeta[name] as FieldMeta | undefined,
	);

	console.log("useFormField2", name, value, meta);

	useEffect(() => {
		console.log("register validator", name, validator);
		const unregister = form.registerValidator(name, validator);
		return unregister;
	}, [validator, form, name]);

	return {
		value,
		handleChange: (value: TFieldValue) => {
			setValue(form.store, name, value);
		},
		meta: {
			isTouched: meta?.isTouched ?? false,
			isDirty: meta?.isDirty ?? false,
			isInvalid: meta?.isInvalid ?? false,
			errorMessage: meta?.errorMessage ?? undefined,
		},
	};
}
