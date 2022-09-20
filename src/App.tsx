import { FieldArray } from "./examples/FieldArray";
import { Simple } from "./examples/Simple";

export function App() {
  return (
    <div className="flex flex-col gap-4">
      <Simple />
      <FieldArray />
    </div>
  );
}
