import { createFormStore } from "@lib/store";
import { useRef } from "react";
import { FormValues } from "../form-state";

export interface UseFormOptions<TValues extends FormValues> {
	defaultValues: TValues;
}

export function useForm2<TValues extends FormValues>({
	defaultValues,
}: UseFormOptions<TValues>) {
	return useRef(createFormStore({ defaultValues })).current;
}
