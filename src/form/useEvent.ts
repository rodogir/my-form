import { useCallback, useLayoutEffect, useRef } from "react";

// Based on https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md#internal-implementation
// TODO: Deprecate as soon as `useEvent` is released.
export function useEvent<Args extends any[], Ret>(
  callback: (...args: Args) => Ret
) {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback((...args: Args) => {
    const fn = callbackRef.current;
    return fn(...args);
  }, []);
}
