import { FireIcon } from "@heroicons/react/24/outline";
import { Form, useForm } from "../../lib/main";
import {
	Buttons,
	ResetButton,
	Section,
	SubmitButton,
	TextInputField,
} from "./components";
import { FormStateMessage, useSubmitHelper } from "./helpers";

export function Simple() {
	const form = useForm({
		defaultValues: {
			firstName: "Peter",
			lastName: "Parker",
		},
	});

	const { handleSubmit, submittedValues, resetSubmittedValues } =
		useSubmitHelper(form);

	return (
		<Section title="Simple Example">
			<Form
				id="sample-1"
				formInstance={form}
				onSubmit={handleSubmit}
				className="flex flex-col gap-3"
			>
				<div className="grid grid-cols-3 gap-2">
					<TextInputField name="firstName" label="Given name" />
					<TextInputField name="lastName" label="Last name" />
				</div>
				<Buttons>
					<SubmitButton name="submit" value="success" />
					<SubmitButton name="submit" value="error">
						<FireIcon className="h-5 w-5 text-rose-700" />
					</SubmitButton>
					<ResetButton
						onClick={() => {
							form.reset();
							resetSubmittedValues();
						}}
					/>
				</Buttons>
				<FormStateMessage values={submittedValues} />
			</Form>
		</Section>
	);
}
