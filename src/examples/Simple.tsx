import { FormMetaState } from "@lib/form-state";
import { ReactNode } from "react";
import { z } from "zod";
import { useStore } from "zustand";
import { FormApi, useForm2 } from "../../lib/v2";
import {
	Buttons,
	ResetButton,
	Section,
	SubmitButton,
	TextInputField2,
} from "./components";
import { waitFor } from "./helpers";

export function Simple() {
	const form = useForm2({
		defaultValues: {
			firstName: "",
			lastName: "",
			age: 18,
		},
		onSubmit: async ({ values }) => {
			await waitFor(500);
			console.log("submitted", values);
		},
	});
	const a = z.string().min(3);
	return (
		<Section title="Simple Example">
			<Form id="sample-1" form={form} className="flex flex-col gap-3">
				<div className="grid grid-cols-3 gap-2">
					<TextInputField2
						form={form}
						name="firstName"
						label="Given name"
						validator={{ onChange: z.string().min(3) }}
					/>
					<TextInputField2
						form={form}
						name="lastName"
						label="Given name"
						validator={{ onChange: z.string().min(3) }}
					/>
				</div>
				<Buttons>
					<SubmitButton name="submit" />
					<ResetButton
						onClick={() => {
							form.reset();
						}}
					/>
				</Buttons>
				<FormInfo form={form} />
			</Form>
		</Section>
	);
}

type FormProps = JSX.IntrinsicElements["form"] & {
	form: FormApi;
};

function Form({ form, ...props }: FormProps) {
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
				return undefined;
			}}
			{...props}
		/>
	);
}

function FormInfo({ form }: { form: FormApi }) {
	const { state, submitCount } = useStore(
		form.store,
		(state) => state.formMeta,
	);

	return (
		<aside>
			<h3 data-testid="form-state" data-form-state={state}>
				{messages[state]}
			</h3>
			<p>Submit count: {submitCount}</p>
		</aside>
	);
}

const messages: Record<FormMetaState, ReactNode> = {
	valid: "Form is valid",
	validating: "Validating form ...",
	error: "❌ Oh no, submitting the form failed 😔",
	submitted: "✅ Form successfully submitted! 🎉",
	submitting: "Submitting ...",
};
