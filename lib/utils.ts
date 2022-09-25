export function get<T extends object>(object: T, path: Path<T>): any {
  return getByPathArray(object, path.split("."));
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("get", () => {
    const object = { a: { b: { c: "TEST" } } };
    expect(get(object, "a")).toEqual(object.a);
    expect(get(object, "a.b")).toEqual(object.a.b);
    expect(get(object, "a.b.c")).toBe(object.a.b.c);

    const array = ["a", "b", "c"];
    expect(get(array, "0")).toEqual(array[0]);
    expect(get(array, "1")).toEqual(array[1]);
    expect(get(array, "2")).toEqual(array[2]);
    expect(get(array, "3")).toEqual(undefined);

    const mixed = { a: { b: [{ c: 1 }, { c: 2 }] } };
    expect(get(mixed, "a")).toEqual(mixed.a);
    expect(get(mixed, "a.b")).toEqual(mixed.a.b);
    expect(get(mixed, "a.b.0")).toEqual(mixed.a.b[0]);
    expect(get(mixed, "a.b.1")).toEqual(mixed.a.b[1]);
    expect(get(mixed, "a.b.0.c")).toBe(mixed.a.b[0].c);
    expect(get(mixed, "a.b.1.c")).toBe(mixed.a.b[1].c);
    expect(get(mixed, "a.b.2.c")).toBe(undefined);
  });
}

function getByPathArray<O extends object>(object: O, path: string[]): any {
  return path.reduce((res, prop) => (res as any)?.[prop], object);
}

export function set<T extends Record<string, unknown>>(
  object: T,
  path: Path<T>,
  value: unknown
): T {
  const pathSegments = path.split(".");
  const tail = pathSegments.pop();

  const objectToUpdate =
    pathSegments.length > 0 ? getByPathArray(object, pathSegments) : object;

  if (tail) {
    objectToUpdate[tail] = value;
  }

  return object;
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("set", () => {
    const object = { a: { b: { c: "TEST" } } };
    expect(set(object, "a", "1")).toEqual({ a: "1" });
  });
}

export type Path<T> = T extends ReadonlyArray<infer V>
  ? IsTuple<T> extends true
    ? {
        [K in TupleKeys<T>]-?: PathRecursion<K & string, T[K]>;
      }[TupleKeys<T>]
    : PathRecursion<`${number}`, V>
  : {
      [K in keyof T]-?: PathRecursion<K & string, T[K]>;
    }[keyof T];

export type PathRecursion<K extends string, V> = V extends
  | Primitive
  | BrowserNativeObject
  ? `${K & string}`
  : `${K & string}` | `${K}.${Path<V>}`;

export type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint;

export type BrowserNativeObject = Date | FileList | File;

export type IsTuple<T extends ReadonlyArray<unknown>> =
  number extends T["length"] ? false : true;

export type TupleKeys<T extends ReadonlyArray<unknown>> = Exclude<
  keyof T,
  keyof unknown[]
>;
