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
        const nextState: FormStateValue = {
          ...stateRef.current,
          state,
        };
        publishState(nextState);
      },
      defaultValues: initialValuesRef.current,
      reset: () => {
        publishState({
          state: "valid",
          values: initialValuesRef.current,
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
    getSnapshot: () => ({ values: {}, state: "valid" }),
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

export function useFormState(instance?: FormInstance) {
  const contextForm = useFormContext();
  const { store } = instance ?? contextForm;

  return useSyncExternalStore(store.subscribe, () => {
    return store.getSnapshot().state;
  });
}
