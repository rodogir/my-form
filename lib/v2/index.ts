import { useRef } from "react";
import { useStore } from "zustand";
import { FormValues } from "../form-state";
import { get } from "../utils";
import { TypedFieldName } from "./base-types";
import { createFormStore, endSubmit, startSubmit } from "./store";

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
	const value = useStore(form.store, (state) => get(state.values, name));
	return {
		value,
		handleChange: (value: TFieldValue) => {
			form.store.getState().setValue(name, value);
		},
	};
}
