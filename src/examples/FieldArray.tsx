import { Fragment } from "react";
import { Form, useFieldArray, useForm } from "../form/useForm";
import { FormStateMessage, waitFor } from "./helpers";
import { SubmitButton, TextInputField } from "./components";

export function FieldArray() {
  const form = useForm({
    defaultValues: {
      emails: ["me@example.com"],
      users: [{ name: "Peter", password: "monkey7" }],
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

  const emails = useFieldArray("emails", form);
  const users = useFieldArray("users", form);

  return (
    <Form
      id="field-array"
      formInstance={form}
      onSubmit={simulateSubmit}
      className="flex-col"
    >
      <div className="flex">
        {emails.fields.map(({ key, name }, index) => (
          <Fragment key={key}>
            <TextInputField name={name} />
            <button type="button" onClick={() => emails.remove(index)}>
              ➖
            </button>
          </Fragment>
        ))}
      </div>
      <button type="button" onClick={() => emails.append("")}>
        ➕ add email
      </button>
      <div className="flex">
        {users.fields.map(({ key, name }, index) => (
          <Fragment key={key}>
            <TextInputField name={`${name}.name`} />
            <TextInputField name={`${name}.password`} />
            <button type="button" onClick={() => users.remove(index)}>
              ➖
            </button>
          </Fragment>
        ))}
      </div>
      <button
        type="button"
        onClick={() => users.append({ name: "", password: "changeme" })}
      >
        ➕ add user
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
