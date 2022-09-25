import { FireIcon } from "@heroicons/react/24/outline";
import { Form, useForm } from "../../lib/main";
import {
  Buttons,
  ResetButton,
  Section,
  SubmitButton,
  TextInputField,
} from "./components";
import { FormStateMessage, waitFor } from "./helpers";

export function Simple() {
  const form = useForm({
    defaultValues: {
      firstName: "Peter",
      lastName: "Parker",
    },
  });

  const simulateSubmit = async (values: any) => {
    await waitFor(850);
    // eslint-disable-next-line no-console
    console.log("submitted", values);
    if (values.submit === "error") {
      form.setState("error");
    } else {
      form.setState("submitted");
    }
  };

  return (
    <Section title="Simple Example">
      <Form
        id="sample-1"
        formInstance={form}
        onSubmit={simulateSubmit}
        className="flex flex-col gap-3"
      >
        <div className="grid grid-cols-3 gap-2">
          <TextInputField name="firstName" label="Given name" />
          <TextInputField name="lastName" label="Last name" />
        </div>
        <Buttons>
          <ResetButton
            onClick={() => {
              form.reset();
            }}
          />
          <SubmitButton name="submit" value="error">
            <FireIcon className="h-5 w-5 text-rose-700" />
          </SubmitButton>
          <SubmitButton name="submit" value="success" />
        </Buttons>
        <FormStateMessage />
      </Form>
    </Section>
  );
}
