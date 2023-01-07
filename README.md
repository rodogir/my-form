# form

## Features

**must haves**

- [x] isolated rendering
- [x] submit state
- [ ] form field state (touched, dirty, valid, error, ...)
  - [x] touched, dirty
  - [ ] valid, error
- [x] form values effects
- [x] rename values effects to `synchronized` like naming (syncFields, syncs, synchronizedFields)
- ~async effects~ => useEffect instead
- [ ] validation support with a function
- [ ] async validation
  - [ ] prevent submit while validating
- [x] prevent submit spamming
- [x] field array support
- [x] field array w/o object
- [x] submit count
- [ ] nested field arrays
- [ ] useFormSubmitButton: headless props for submit buttons (disabled depending on form state, supports value)
- [ ] useSelector: called on every form change but only returns if value is new

**nice to haves**

- [ ] keep gzip size below 3KiB
- [ ] disable submit button in "submitting" and "submitted" states
- [ ] debounce validation?
- [ ] typed values
- [ ] branded types (https://github.com/react-hook-form/react-hook-form/discussions/7354)
