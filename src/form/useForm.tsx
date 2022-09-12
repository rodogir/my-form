import {
  ChangeEvent,
  createContext,
  FormEvent,
  ReactNode,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

export interface UseFormOptions {
  defaultValues: FormValues;
}

export function useForm({ defaultValues }: UseFormOptions) {
  const subscribersRef = useRef(new Set<Subscriber>());
  const stateRef = useRef<FormStateValue>({
    values: defaultValues,
    state: "valid",
    submitCount: 0,
  });

  const publishState = (nextState: FormStateValue) => {
    stateRef.current = nextState;
    subscribersRef.current.forEach((fn) => fn());
  };

  const initialValuesRef = useRef(defaultValues);
  return useMemo(
    () => ({
      store: {
        getSnapshot: () => stateRef.current,
        subscribe: (listener: () => void) => {
          subscribersRef.current.add(listener);
          return () => {
            subscribersRef.current.delete(listener);
          };
        },
      },
      setValue: (name: string, value: any) => {
        const nextState: FormStateValue = {
          ...stateRef.current,
          values: { ...stateRef.current.values, [name]: value },
        };
        publishState(nextState);
      },
      setState: (state: FormState) => {
        const currentState = stateRef.current;
        const nextState: FormStateValue = {
          ...stateRef.current,
          state,
          submitCount:
            state === "submitted" && currentState.state !== "submitted"
              ? currentState.submitCount + 1
              : currentState.submitCount,
        };
        publishState(nextState);
      },
      defaultValues: initialValuesRef.current,
      reset: () => {
        const currentState = stateRef.current;
        publishState({
          state: "valid",
          values: initialValuesRef.current,
          submitCount: currentState.submitCount,
        });
      },
    }),
    []
  );
}

type FormInstance = ReturnType<typeof useForm>;
type FormValues = Record<string, any>;
type Subscriber = () => void;
type FormState = "valid" | "submitted" | "submitting" | "error";
interface FormStateValue {
  values: FormValues;
  state: FormState;
  submitCount: number;
}

// function createFormState(defaultValues: any) {
//   return {
//     values: defaultValues,
//   };
// }

const FormContext = createContext<FormInstance>({
  defaultValues: {},
  setValue: () => {},
  setState: () => {},
  reset: () => {},
  store: {
    getSnapshot: () => ({ values: {}, state: "valid", submitCount: 0 }),
    subscribe: () => () => {},
  },
});

function useFormContext() {
  return useContext(FormContext);
}

interface FormProps {
  id: string;
  formInstance: FormInstance;
  children?: ReactNode;
  onSubmit: (values: any) => void;
  className?: string;
}

export function Form({
  id,
  formInstance,
  children,
  onSubmit,
  className,
}: FormProps) {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { values, state } = formInstance.store.getSnapshot();
    if (state === "submitted" || state === "submitting") {
      return;
    }
    formInstance.setState("submitting");
    await onSubmit(values);
  };
  return (
    <FormContext.Provider value={formInstance}>
      <form id={id} onSubmit={handleSubmit} className={className}>
        {children}
      </form>
    </FormContext.Provider>
  );
}

type FormValue = "string";

export function useFormField(name: string) {
  const { store, setValue } = useFormContext();
  const value = useSyncExternalStore(
    store.subscribe,
    // todo: support nested values
    () => {
      return store.getSnapshot().values[name];
    }
  );

  return {
    name,
    value,
    // todo: add support for non event (maybe use a separate hook for cleaner code)
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      setValue(name, event.target.value);
    },
  };
}

export function useFormStateField(
  field: keyof FormStateValue,
  instance?: FormInstance
) {
  const contextForm = useFormContext();
  const { store } = instance ?? contextForm;

  return useSyncExternalStore(store.subscribe, () => {
    return store.getSnapshot()[field];
  });
}

export function useFormState(instance?: FormInstance) {
  return useFormStateField("state", instance);
}

export function useSubmitCount(instance?: FormInstance) {
  return useFormStateField("submitCount", instance);
}
