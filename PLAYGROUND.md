# Playground

This is where I toy with some ideas.

## Validation

```tsx
function Example() {
  const form = useForm({
    // can be a function that takes all values and returns ValidationErrors
    validate: () => {},
    // given a map, the form is able to validate per field
    validate: { 
      givenNames: (value) => {},
      lastName: (value) => {},
    },
    // support for schema libraries can be supported by writing an adaptor
    validate: superstructValidator(schema),
    defaultValues: {
      givenNames: "",
      lastName: "",
    }
  });

  // we could also support per field validation
  // idea: useFormField keeps validate function as event and registers it to the form in an effect 
  const field = useFormField("givenNames", { validate: () => {}})
}
```


