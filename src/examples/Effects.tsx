import { Form, useForm } from "../../lib/main";
import {
	Buttons,
	Checkbox,
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
			firstName: "",
			lastName: "",
			fullName: "",
			quantityKg: "",
			quantityPc: "",
			factor: "",
			locked: false,
		},
		effects: {
			firstName: ({ setValue, getValues }) => {
				const { firstName, lastName } = getValues();
				setValue("fullName", `${firstName} ${lastName}`);
			},
			lastName: ({ setValue, getValues }) => {
				const { firstName, lastName } = getValues();
				setValue("fullName", `${firstName} ${lastName}`);
			},
			// quantityKg: (value, { setValue, getValues }) => {
			// 	const { factor, locked, quantityPc } = getValues();
			// 	if (!locked) {
			// 		const newFactor = parseFloat(value) / parseFloat(quantityPc);
			// 		if (!Number.isNaN(newFactor) && Number.isFinite(newFactor)) {
			// 			setValue("factor", newFactor.toString());
			// 		}
			// 		return;
			// 	}
			// 	const otherQuantity = parseFloat(value) / parseFloat(factor);
			// 	if (!Number.isNaN(otherQuantity) && Number.isFinite(otherQuantity)) {
			// 		setValue("quantityPc", otherQuantity.toString());
			// 	}
			// },
			// quantityPc: (value, { setValue, getValues }) => {
			// 	const { factor, locked, quantityKg } = getValues();
			// 	if (!locked) {
			// 		const newFactor = parseFloat(quantityKg) / parseFloat(value);
			// 		if (!Number.isNaN(newFactor) && Number.isFinite(newFactor)) {
			// 			setValue("factor", newFactor.toString());
			// 		}
			// 		return;
			// 	}
			// 	const otherQuantity = parseFloat(value) * parseFloat(factor);
			// 	if (!Number.isNaN(otherQuantity) && Number.isFinite(otherQuantity)) {
			// 		setValue("quantityKg", otherQuantity.toString());
			// 	}
			// },
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
		<Section title="Synchronized Fields">
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
				<div className="flex gap-2">
					<TextInputField name="quantityKg" label="Kg" />
					<TextInputField name="quantityPc" label="Pieces" />
					<TextInputField name="factor" label="Factor" readOnly={true} />
					<Checkbox name="locked" />
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
