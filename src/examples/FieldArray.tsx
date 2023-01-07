import { Form, useFieldArray, useForm } from "../../lib/main";
import {
	AddItemButton,
	Buttons,
	RemoveItemButton,
	ResetButton,
	Section,
	SubmitButton,
	TextInputField,
} from "./components";
import { FormStateMessage, useSubmitHelper } from "./helpers";

export function FieldArray() {
	const form = useForm({
		defaultValues: {
			emails: ["me@example.com"],
			users: [{ name: "Peter", password: "monkey7" }],
		},
	});

	const { handleSubmit, submittedValues, resetSubmittedValues } =
		useSubmitHelper(form);

	const emails = useFieldArray("emails", form);
	const users = useFieldArray("users", form);

	return (
		<Section title="Field array">
			<Form
				id="field-array"
				formInstance={form}
				onSubmit={handleSubmit}
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
							<TextInputField
								name={`${name}.name`}
								label={`User name ${index + 1}`}
							/>
							<TextInputField
								name={`${name}.password`}
								label={`Password ${index + 1}`}
							/>
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
							resetSubmittedValues();
						}}
					/>
					<SubmitButton name="submit" value="success" />
				</Buttons>
				<FormStateMessage values={submittedValues} />
			</Form>
		</Section>
	);
}
