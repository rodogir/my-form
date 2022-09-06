import "./App.css";
import { TextInputField } from "./form/TextInputField";
import { Form, useForm } from "./form/useForm";

export function App() {
  const form = useForm({
    defaultValues: {
      firstName: "Rodrigo",
      lastName: "Benz",
      fullName: "",
    },
  });
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
        <button type="submit">💾</button>
      </Form>
    </div>
  );
}
