import { Fragment } from "react";
import { SubmitButton, TextInputField } from "../form/TextInputField";
import { Form, useFieldArray, useForm } from "../form/useForm";
import { FormStateMessage, waitFor } from "./helpers";

export function FieldArray() {
  const form = useForm({
    defaultValues: {
      emails: ["me@example.com"],
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

  const { fields, append } = useFieldArray("emails", form);

  return (
    <Form
      id="field-array"
      formInstance={form}
      onSubmit={simulateSubmit}
      className="flex-col"
    >
      <div className="flex">
        {fields.map(({ key, name }) => (
          <Fragment key={key}>
            <TextInputField name={name} key={name} />
            {/* <button type="button" onClick={() => append("")}>
              ➕ add email
            </button> */}
          </Fragment>
        ))}
      </div>
      <button type="button" onClick={() => append("")}>
        ➕ add email
      </button>
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
