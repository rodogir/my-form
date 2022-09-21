import { Form, useForm } from "../form/useForm";
import {
  Buttons,
  P,
  ResetButton,
  Section,
  SubmitButton,
  TextInputField,
} from "./components";
import { FormStateMessage, waitFor } from "./helpers";

export function Effects() {
  const form = useForm({
    defaultValues: {
      firstName: "Peter",
      lastName: "Parker",
      fullName: "",
    },
    effects: {
      firstName: (value, { setValue, getValues }) => {
        const lastName = getValues().lastName;
        setValue("fullName", `${value} ${lastName}`);
      },
      lastName: (value, { setValue, getValues }) => {
        const firstName = getValues().firstName;
        setValue("fullName", `${firstName} ${value}`);
      },
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
    <Section title="Effects">
      <P>Effects don't trigger effects on fields they change!</P>
      <Form
        id="sample-1"
        formInstance={form}
        onSubmit={simulateSubmit}
        className="flex flex-col gap-3"
      >
        <div className="grid grid-cols-3 gap-2">
          <TextInputField name="firstName" label="Given name" />
          <TextInputField name="lastName" label="Last name" />
          <TextInputField name="fullName" label="Full name" />
        </div>
        <Buttons>
          <ResetButton
            onClick={() => {
              form.reset();
            }}
          />
          <SubmitButton name="submit" value="success" />
        </Buttons>
        <FormStateMessage />
      </Form>
    </Section>
  );
}
