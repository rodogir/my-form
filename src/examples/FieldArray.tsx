import { Form, useFieldArray, useForm } from "../form/useForm";
import {
  AddItemButton,
  Buttons,
  RemoveItemButton,
  ResetButton,
  Section,
  SubmitButton,
  TextInputField,
} from "./components";
import { FormStateMessage, waitFor } from "./helpers";

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
    <Section title="Field array">
      <Form
        id="field-array"
        formInstance={form}
        onSubmit={simulateSubmit}
        className="flex flex-col gap-3"
      >
        <div className="grid grid-cols-3 gap-2">
          {emails.fields.map(({ key, name }, index) => (
            <div key={key} className="flex gap-1 items-end">
              <TextInputField name={name} label={`E-mail ${index + 1}`} />
              <RemoveItemButton onClick={() => emails.remove(index)} />
            </div>
          ))}
        </div>
        <div>
          <AddItemButton onClick={() => emails.append("")}>
            E-mail
          </AddItemButton>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {users.fields.map(({ key, name }, index) => (
            <div key={key} className="flex gap-1 items-end">
              <TextInputField name={`${name}.name`} label="User name" />
              <TextInputField name={`${name}.password`} label="Password" />
              <RemoveItemButton onClick={() => users.remove(index)} />
            </div>
          ))}
        </div>
        <div>
          <AddItemButton
            onClick={() => users.append({ name: "", password: "changeme" })}
          >
            User
          </AddItemButton>
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
