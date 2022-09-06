import "./App.css";
import { SubmitButton, TextInputField } from "./form/TextInputField";
import { Form, useForm } from "./form/useForm";

export function App() {
  const form = useForm({
    defaultValues: {
      firstName: "Rodrigo",
      lastName: "Benz",
      fullName: "",
    },
  });
  // const formState = useFormState();
  return (
    <div>
      <Form
        id="sample-1"
        formInstance={form}
        onSubmit={(values) => console.log(values)}
      >
        <TextInputField name="firstName" />
        <TextInputField name="lastName" />
        <TextInputField name="fullName" />
        <SubmitButton name="submit" value="success">
          💾
        </SubmitButton>
        <SubmitButton name="submit" value="error">
          💾❌
        </SubmitButton>
      </Form>
      <p></p>
    </div>
  );
}
