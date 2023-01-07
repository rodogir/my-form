import { ReactNode } from "react";
import { FormMetaState } from "../../lib/form-state";
import { useFormMeta } from "../../lib/main";

export function waitFor(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

export function FormStateMessage({ values }: { values: unknown }) {
	const { state, submitCount } = useFormMeta();
	const hasValues = Boolean(values) && state === "submitted";
	return (
		<aside>
			<h3 data-testid="form-state" data-form-state={state}>
				{messages[state]}
			</h3>
			<p>Submit count: {submitCount}</p>
			{hasValues && <SubmittedValues values={values} />}
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

function SubmittedValues({ values }: { values: unknown }) {
	return (
		<details>
			<summary data-testid="toggle-submitted-values">Submitted values</summary>
			<pre data-testid="submitted-values" data-values={JSON.stringify(values)}>
				{JSON.stringify(values, undefined, 2)}
			</pre>
		</details>
	);
}
