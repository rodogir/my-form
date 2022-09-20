import { FireIcon } from "@heroicons/react/24/outline";
import { Form, useForm } from "../form/useForm";
import { ResetButton, SubmitButton, TextInputField } from "./components";
import { FormStateMessage, waitFor } from "./helpers";

export function Simple() {
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
    <section>
      <h1 className="text-2xl font-semibold text-gray-800 capitalize">
        Simple Example
      </h1>
      <Form
        id="sample-1"
        formInstance={form}
        onSubmit={simulateSubmit}
        className="mt-6 flex flex-col gap-3"
      >
        <div className="grid grid-cols-3 gap-2">
          <TextInputField name="firstName" label="Given name" />
          <TextInputField name="lastName" label="Last name" />
          <TextInputField name="fullName" label="Full name" />
        </div>
        <div className="flex gap-2 justify-end">
          <ResetButton
            onClick={() => {
              form.reset();
            }}
          />
          <SubmitButton name="submit" value="error">
            <FireIcon className="h-5 w-5 text-rose-700" />
          </SubmitButton>
          <SubmitButton name="submit" value="success" />
        </div>
        <FormStateMessage />
      </Form>
    </section>
  );
}
