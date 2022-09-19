export function setIn<T extends Record<string, unknown>>(
  object: T,
  path: string,
  value: unknown
): T {
  var stack = path.split(".");

  while (stack.length > 1) {
    object = object[stack.shift()];
  }

  object[stack.shift()] = value;
  return object;
}

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${"" extends P ? "" : "."}${P}`
    : never
  : never;

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, ...0[]];

type Paths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ? `${K}` | Join<K, Paths<T[K], Prev[D]>>
        : never;
    }[keyof T]
  : "";

type Leaves<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
  ? { [K in keyof T]-?: Join<K, Leaves<T[K], Prev[D]>> }[keyof T]
  : "";

export function getIn<O extends object>(object: O, path: Paths<O>): any {
  return path.split(".").reduce((res, prop) => (res as any)?.[prop], object);
}
