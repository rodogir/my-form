import { useFormField } from "./useForm";

interface TextInputFieldProps {
  name: string;
}

export function TextInputField({ name }: TextInputFieldProps) {
  const props = useFormField(name);
  return <input type="text" {...props} />;
}
