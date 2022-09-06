import { ReactNode } from "react";
import { useFormField } from "./useForm";

interface TextInputFieldProps {
  name: string;
}

export function TextInputField({ name }: TextInputFieldProps) {
  const props = useFormField(name);
  return <input type="text" {...props} />;
}

export function SubmitButton({
  name,
  value,
  children,
}: {
  name: string;
  value: string;
  children?: ReactNode;
}) {
  const { onChange } = useFormField(name);

  return (
    <button type="submit" name={name} value={value} onClick={onChange}>
      {children}
    </button>
  );
}
