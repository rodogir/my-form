import "./App.css";
import { SubmitButton, TextInputField } from "./form/TextInputField";
import { Form, useForm, useFormState } from "./form/useForm";

export function App() {
  const form = useForm({
    defaultValues: {
      firstName: "Peter",
      lastName: "Parker",
      fullName: "",
    },
  });
  const simulateSubmit = async (values: any) => {
    await waitFor(850);
    console.log("submitted", values);
    if (values.submit === "error") {
      form.setState("error");
    } else {
      form.setState("submitted");
    }
  };

  return (
    <Form
      id="sample-1"
      formInstance={form}
      onSubmit={simulateSubmit}
      className="flex-col"
    >
      <div className="flex">
        <TextInputField name="firstName" />
        <TextInputField name="lastName" />
        <TextInputField name="fullName" />
      </div>
      <div className="flex">
        <SubmitButton name="submit" value="success">
          💾
        </SubmitButton>
        <SubmitButton name="submit" value="error">
          💾❌
        </SubmitButton>
        <button type="button" onClick={form.reset}>
          ↩️
        </button>
      </div>
      <FormStateMessage />
    </Form>
  );
}

function FormStateMessage() {
  const state = useFormState();
  return (
    <>
      {state === "submitting" && <p>Submitting ...</p>}
      {state === "submitted" && <p>✅ Form successfully submitted</p>}
      {state === "error" && <p>❌ Oh no, submitting the form failed 😔</p>}
    </>
  );
}

function waitFor(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
