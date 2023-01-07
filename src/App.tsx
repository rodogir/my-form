import { Hr } from "./examples/components";
import { FieldArray } from "./examples/FieldArray";
import { Simple } from "./examples/Simple";
import { SynchronizedFields } from "./examples/SynchronizedFields";

export function App() {
	return (
		<div className="flex flex-col gap-4 max-w-4xl mx-auto mt-3">
			<Simple />
			<Hr />
			<FieldArray />
			<Hr />
			<SynchronizedFields />
			<Hr />
		</div>
	);
}
