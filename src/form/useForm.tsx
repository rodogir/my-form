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
  const stateRef = useRef({
    values: defaultValues,
  });

  const publishState = (nextState: FormState) => {
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
        const nextState = {
          ...stateRef.current,
          values: { ...stateRef.current.values, [name]: value },
        };
        publishState(nextState);
      },
      defaultValues: initialValuesRef.current,
    }),
    []
  );
}

type FormInstance = ReturnType<typeof useForm>;
type FormValues = Record<string, any>;
type Subscriber = () => void;
interface FormState {
  values: FormValues;
}

// function createFormState(defaultValues: any) {
//   return {
//     values: defaultValues,
//   };
// }

const FormContext = createContext<FormInstance>({
  defaultValues: {},
  setValue: () => {},
  store: {
    getSnapshot: () => ({ values: {} }),
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
}

export function Form({ id, formInstance, children, onSubmit }: FormProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { values } = formInstance.store.getSnapshot();
    onSubmit(values);
  };
  return (
    <FormContext.Provider value={formInstance}>
      <form id={id} onSubmit={handleSubmit}>
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
