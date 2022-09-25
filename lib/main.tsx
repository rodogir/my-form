import { produce } from "immer";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { useEvent } from "./useEvent";
import { get, set } from "./utils";

export interface UseFormOptions {
  defaultValues: FormValues;
  effects?: Record<string, FormEffect>;
}

export function useForm({ defaultValues, effects }: UseFormOptions) {
  const subscribersRef = useRef(new Set<Subscriber>());
  const stateRef = useRef<FormStateValue>({
    values: defaultValues,
    arrays: findFieldArrays(defaultValues),
    state: "valid",
    submitCount: 0,
  });

  const publishState = useEvent((nextState: FormStateValue) => {
    stateRef.current = nextState;
    subscribersRef.current.forEach((fn) => fn());
  });

  const getEffects = useEvent(() => effects);

  const initialValuesRef = useRef(defaultValues);

  const update = useEvent((updater: (current: FormStateValue) => void) => {
    const nextState = produce(stateRef.current, updater);
    publishState(nextState);
  });

  const store = useMemo(
    () => ({
      getSnapshot: () => stateRef.current,
      subscribe: (listener: () => void) => {
        subscribersRef.current.add(listener);
        return () => {
          subscribersRef.current.delete(listener);
        };
      },
    }),
    []
  );

  return useMemo(
    () => ({
      store,
      update,
      getValues: () => store.getSnapshot().values,
      setValue: (name: string, value: any) => {
        const effcts = getEffects();
        update((current) => {
          set(current.values, name, value);
          effcts?.[name]?.(value, {
            getValues: () => store.getSnapshot().values,
            setValue: (n: string, v: string) => set(current.values, n, v),
          });
        });
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
      reset: (values: FormValues = initialValuesRef.current) => {
        const currentState = stateRef.current;
        publishState({
          state: "valid",
          values,
          arrays: findFieldArrays(values),
          submitCount: currentState.submitCount,
        });
      },
    }),
    [getEffects, publishState, store, update]
  );
}

// todo: add support for nested fields
function findFieldArrays(values: FormValues) {
  return Object.entries(values).reduce<FieldArrayState>(
    (acc, [name, value]) => {
      if (Array.isArray(value)) {
        acc[name] = { fields: value.map(() => ({ key: generateRandId() })) };
      }
      return acc;
    },
    {}
  );
}

function generateRandId() {
  return (Math.random() * 10 ** 10).toFixed(0);
}

type FormInstance = ReturnType<typeof useForm>;
type FormValues = Record<string, any>;
type FieldArrayState = Record<string, { fields: { key: string }[] }>;
type Subscriber = () => void;
type FormState = "valid" | "submitted" | "submitting" | "error";
type FormEffect = (
  value: string,
  form: Pick<FormInstance, "getValues" | "setValue">
) => void;

interface FormStateValue {
  values: FormValues;
  arrays: FieldArrayState;
  state: FormState;
  submitCount: number;
}

const FormContext = createContext<FormInstance>({
  defaultValues: {},
  getValues: () => ({}),
  setValue: () => {},
  setState: () => {},
  reset: () => {},
  update: () => {},
  store: {
    getSnapshot: () => ({
      values: {},
      arrays: {},
      state: "valid",
      submitCount: 0,
    }),
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

export function useFormField(name: string) {
  const { setValue } = useFormContext();
  const value = useFieldValue(name);

  return {
    name,
    value,
    // todo: add support for non event (maybe use a separate hook for cleaner code)
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      setValue(name, event.currentTarget.value);
    },
  };
}

function useFieldValue(name: string) {
  const { store } = useFormContext();
  return useSyncExternalStore(store.subscribe, () =>
    get(store.getSnapshot().values, name)
  );
}

export function useCheckbox(name: string) {
  const { setValue } = useFormContext();
  const checked = useFieldValue(name);

  return {
    name,
    checked,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      setValue(name, event.currentTarget.checked);
    },
  };
}

export function useFormStateField(
  field: keyof FormStateValue,
  instance?: FormInstance
) {
  const contextForm = useFormContext();
  const { store } = instance ?? contextForm;

  return useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot()[field]
  );
}

export function useFormState(instance?: FormInstance) {
  return useFormStateField("state", instance);
}

export function useSubmitCount(instance?: FormInstance) {
  return useFormStateField("submitCount", instance);
}

export function useFieldArray(name: string, instance?: FormInstance) {
  const contextForm = useFormContext();
  const { store, update } = instance ?? contextForm;

  const arrays = useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot().arrays[name]
  );

  return {
    fields: arrays.fields.map(({ key }, idx) => ({
      key,
      name: `${name}.${idx}`,
    })),
    append: useEvent((value) => {
      update((current) => {
        current.values[name].push(value);
        current.arrays[name].fields.push({ key: generateRandId() });
      });
    }),
    remove: useEvent((index: number) => {
      update((current) => {
        current.values[name].splice(index, 1);
        current.arrays[name].fields.splice(index, 1);
      });
    }),
  };
}
