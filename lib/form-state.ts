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

export interface FormStateValue {
  values: FormValues;
  defaultValues: FormValues;
  arrays: FieldArrayState;
  formMeta: { state: FormMetaState; submitCount: number };
  fieldMeta: Record<string, FieldMeta | undefined>;
}
