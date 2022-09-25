type FormValues = Record<string, any>;
type FieldArrayState = Record<string, { fields: { key: string }[] }>;

type FieldMeta = { isDirty: boolean; isTouched: boolean };

export type FormMetaState =
  | "valid"
  | "validating"
  | "submitted"
  | "submitting"
  | "error";

export interface FormStateValue {
  values: FormValues;
  arrays: FieldArrayState;
  formMeta: { state: FormMetaState; submitCount: number };
  fieldMeta: Record<string, FieldMeta>;
}
