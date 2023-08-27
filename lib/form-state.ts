export type FieldValue = unknown;
export type FormValues = Map<string, FieldValue>;
export type FormValuesObject = Record<string, unknown>;
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

export interface FormStateValue {
	values: FormValues;
	flatDefaultValues: FormValues;
	defaultValues: FormValuesObject;
	arrays: FieldArrayState;
	formMeta: { state: FormMetaState; submitCount: number };
	fieldMeta: Record<string, FieldMeta | undefined>;
}
