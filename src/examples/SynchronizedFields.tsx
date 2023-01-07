import { Form, useForm } from "../../lib/main";
import {
	Buttons,
	Checkbox,
	ResetButton,
	Section,
	SubmitButton,
	TextInputField,
} from "./components";
import { FormStateMessage, useSubmitHelper } from "./helpers";

export function SynchronizedFields() {
	const form = useForm({
		defaultValues: {
			firstName: "",
			lastName: "",
			fullName: "",
			quantityKg: "0.25",
			quantityPc: "1",
			factor: "0.25",
			locked: true,
		},
		synchronizedFields: {
			firstName: ({ setValue, getValues }) => {
				const { firstName, lastName } = getValues();
				setValue("fullName", `${firstName} ${lastName}`);
			},
			lastName: ({ setValue, getValues }) => {
				const { firstName, lastName } = getValues();
				setValue("fullName", `${firstName} ${lastName}`);
			},
			quantityKg: ({ setValue, getValues }) => {
				const { factor, locked, quantityPc, quantityKg } = getValues();
				if (!locked) {
					const newFactor = parseFloat(quantityKg) / parseFloat(quantityPc);
					if (!Number.isNaN(newFactor) && Number.isFinite(newFactor)) {
						setValue("factor", newFactor.toString());
					}
					return;
				}
				const otherQuantity = parseFloat(quantityKg) / parseFloat(factor);
				if (!Number.isNaN(otherQuantity) && Number.isFinite(otherQuantity)) {
					setValue("quantityPc", otherQuantity.toString());
				}
			},
			quantityPc: ({ setValue, getValues }) => {
				const { factor, locked, quantityPc, quantityKg } = getValues();
				if (!locked) {
					const newFactor = parseFloat(quantityKg) / parseFloat(quantityPc);
					if (!Number.isNaN(newFactor) && Number.isFinite(newFactor)) {
						setValue("factor", newFactor.toString());
					}
					return;
				}
				const otherQuantity = parseFloat(quantityPc) * parseFloat(factor);
				if (!Number.isNaN(otherQuantity) && Number.isFinite(otherQuantity)) {
					setValue("quantityKg", otherQuantity.toString());
				}
			},
		},
	});

	const { handleSubmit, submittedValues, resetSubmittedValues } =
		useSubmitHelper(form);

	return (
		<Section title="Synchronized Fields">
			<Form
				id="sample-1"
				formInstance={form}
				onSubmit={handleSubmit}
				className="flex flex-col gap-3"
			>
				<div className="grid grid-cols-3 gap-2">
					<TextInputField name="firstName" label="Given name" />
					<TextInputField name="lastName" label="Last name" />
					<TextInputField name="fullName" label="Full name" />
				</div>
				<div className="flex gap-2">
					<TextInputField name="quantityPc" label="Pieces" />
					<TextInputField name="quantityKg" label="Kg" />
					<TextInputField name="factor" label="Factor" readOnly={true} />
					<Checkbox name="locked" />
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
