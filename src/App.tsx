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
  const simulateSubmit = async (values: any) => {
    await waitFor(850);
    if (values.submit === "error") {
      console.log("failed to submit", values);
      // todo: set form state to error;
    } else {
      console.log("successfully submitted", values);
    }
  };
  return (
    <div>
      <Form id="sample-1" formInstance={form} onSubmit={simulateSubmit}>
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

function waitFor(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
