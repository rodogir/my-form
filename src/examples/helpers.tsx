import { useFormState, useSubmitCount } from "../../lib/main";

export function waitFor(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function FormStateMessage() {
  const state = useFormState();
  const submitCount = useSubmitCount();
  return (
    <>
      {state === "submitting" && <p>Submitting ...</p>}
      {state === "submitted" && (
        <p>✅ Form successfully submitted. submit count: {submitCount}</p>
      )}
      {state === "error" && <p>❌ Oh no, submitting the form failed 😔</p>}
    </>
  );
}
