import {
  ChangeEvent,
  createContext,
  FormEvent,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { makeSubject, pipe, subscribe } from "wonka";

export interface UseFormOptions {
  defaultValues: FormValues;
}

export function useForm({ defaultValues }: UseFormOptions) {
  const stateSubjectRef = useRef(makeSubject<FormState>());
  const currentStateRef = useRef({
    values: defaultValues,
  });

  useEffect(() => {
    const { unsubscribe } = pipe(
      stateSubjectRef.current.source,
      subscribe((state) => (currentStateRef.current = state))
    );
    return unsubscribe;
  }, []);
  const initialValuesRef = useRef(defaultValues);
  return useMemo(
    () => ({
      store: {
        getSnapshot: () => currentStateRef.current,
        subscribe: (listener: () => void) => {
          const { unsubscribe } = pipe(
            stateSubjectRef.current.source,
            subscribe(listener)
          );
          return unsubscribe;
        },
      },
      subject: stateSubjectRef.current,
      setValue: (name: string, value: any) => {
        const newValues = { ...currentStateRef.current.values, [name]: value };
        stateSubjectRef.current.next({
          ...currentStateRef.current,
          values: newValues,
        });
      },
      defaultValues: initialValuesRef.current,
    }),
    []
  );
}

type FormInstance = ReturnType<typeof useForm>;
type FormValues = Record<string, any>;
interface FormState {
  values: FormValues;
}

function createFormState(defaultValues: any) {
  return {
    values: defaultValues,
  };
}

const FormContext = createContext<FormInstance>({
  defaultValues: {},
  subject: makeSubject(),
  store: {
    getSnapshot: () => ({ values: {} }),
    subscribe: () => () => {},
  },
  setValue: () => {},
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
    () => store.getSnapshot().values[name]
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
