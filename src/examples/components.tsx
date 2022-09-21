import {
  ArrowUturnLeftIcon,
  PaperAirplaneIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { ReactNode, useId } from "react";
import { useFormField } from "../form/useForm";

interface TextInputFieldProps {
  name: string;
  label?: string;
}

export function TextInputField({ name, label }: TextInputFieldProps) {
  const props = useFormField(name);
  const id = useId();
  return (
    <div>
      {label && (
        <label htmlFor={id} className="text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        id={id}
        type="text"
        className="appearance-none block w-full h-11 px-3 py-2 text-gray-700 bg-white border-2 border-gray-200 rounded-md focus:border-teal-400 focus:ring-teal-300 focus:ring-opacity-40 focus:outline-none focus:ring"
        {...props}
      />
    </div>
  );
}

export function SubmitButton({
  name,
  value,
  children,
}: {
  name: string;
  value: string;
  children?: ReactNode;
}) {
  const { onChange } = useFormField(name);
  return (
    <button
      type="submit"
      name={name}
      value={value}
      onClick={onChange}
      className="px-3 py-2 font-medium tracking-wide capitalize transition-colors duration-300 transform bg-white border-2 border-teal-500 rounded hover:bg-teal-100 focus:outline-none focus:ring focus:ring-teal-300 focus:ring-opacity-80 text-teal-700"
    >
      {children ?? <PaperAirplaneIcon className="h-5 w-5" />}
    </button>
  );
}

export function ResetButton({
  children,
  onClick,
}: {
  children?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-2 font-medium tracking-wide capitalize transition-colors duration-300 transform bg-white border-2 border-rose-500 rounded hover:bg-rose-100 focus:outline-none focus:ring focus:ring-rose-300 focus:ring-opacity-80 text-rose-700"
    >
      {children ?? <ArrowUturnLeftIcon className="h-5 w-5" />}
    </button>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-gray-800 capitalize mb-6">
        {title}
      </h1>
      {children}
    </section>
  );
}

export function Buttons({ children }: { children: ReactNode }) {
  return <div className="flex gap-2 justify-end">{children}</div>;
}

export function AddItemButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-11 px-3 py-2 tracking-wide capitalize transition-colors duration-300 transform bg-white border-2 border-gray-200 rounded hover:bg-gray-300 text-gray-700 focus:border-teal-400 focus:ring-teal-300 focus:ring-opacity-40 focus:outline-none focus:ring flex items-center"
    >
      <PlusIcon className="h-5 w-5 inline mr-2" /> {children}
    </button>
  );
}

export function RemoveItemButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-11 px-3 py-2 tracking-wide capitalize transition-colors duration-300 transform bg-white border-2 border-gray-200 rounded hover:bg-gray-300 text-gray-700 focus:border-teal-400 focus:ring-teal-300 focus:ring-opacity-40 focus:outline-none focus:ring flex items-center"
    >
      <TrashIcon className="h-5 w-5" />
    </button>
  );
}

export function Hr() {
  return <hr className="my-10 border-gray-200 dark:border-gray-300" />;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-gray-500 dark:text-gray-400">{children}</p>;
}
