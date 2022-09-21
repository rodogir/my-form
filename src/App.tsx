import { Hr } from "./examples/components";
import { Effects } from "./examples/Effects";
import { FieldArray } from "./examples/FieldArray";
import { Simple } from "./examples/Simple";

export function App() {
  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto mt-3">
      <Simple />
      <Hr />
      <FieldArray />
      <Hr />
      <Effects />
      <Hr />
    </div>
  );
}
