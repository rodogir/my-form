import { useRef } from "react";
import { useStore } from "zustand";
import { FormValues } from "../form-state";
import { get } from "../utils";
import { FieldName, FieldValue, TypedFieldName } from "./base-types";
import {
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
	};
}

export type FormApi<TValues extends FormValues = FormValues> = ReturnType<
	typeof useForm2<TValues>
>;

export interface FormFieldProps<TValues extends FormValues, TFieldValue> {
	form: FormApi<TValues>;
	name: TypedFieldName<TValues, TFieldValue>;
}

export function useFormField2<TValues extends FormValues, TFieldValue>({
	form,
	name,
}: FormFieldProps<TValues, TFieldValue>) {
	const value = useStore(
		form.store,
		(state) => get(state.values, name) as TFieldValue,
	);
	return {
		value,
		handleChange: (value: TFieldValue) => {
			setValue(form.store, name, value);
		},
	};
}
