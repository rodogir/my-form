import { useFormMeta } from "../../lib/main";

export function waitFor(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

export function FormStateMessage({ values }: { values: unknown }) {
	const { state, submitCount } = useFormMeta();
	return (
		<>
			{state === "submitting" && <p>Submitting ...</p>}
			{state === "submitted" && (
				<>
					<p>✅ Form successfully submitted. submit count: {submitCount}</p>
					<details>
						<summary data-testid="toggle-submitted-values">
							Submitted values
						</summary>
						<pre
							data-testid="submitted-values"
							data-values={JSON.stringify(values)}
						>
							{JSON.stringify(values, undefined, 2)}
						</pre>
					</details>
				</>
			)}
			{state === "error" && <p>❌ Oh no, submitting the form failed 😔</p>}
		</>
	);
}
