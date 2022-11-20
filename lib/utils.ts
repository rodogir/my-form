export function get<T extends object>(object: T, path: Path<T>): any {
  return getByPathArray(object, pathToArray(path));
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
    expect(get(mixed, "a.b.0.c")).toBe(mixed.a.b[0]?.c);
    expect(get(mixed, "a.b.1.c")).toBe(mixed.a.b[1]?.c);
    expect(get(mixed, "a.b.2.c")).toBe(undefined);
  });
}

function pathToArray(path: string) {
  return path.split(".");
}

function getByPathArray<T extends object>(object: T, path: string[]): any {
  return path.reduce((res, prop) => (res as any)?.[prop], object);
}

export function set<T extends Record<string, unknown> | unknown[]>(
  object: T,
  path: Path<T>,
  value: unknown
): T {
  return setByPathArray(object, pathToArray(path), value);
}

export function setByPathArray<T extends Record<string, unknown> | unknown[]>(
  object: T,
  pathArray: string[],
  value: unknown
): T {
  const head = pathArray.slice(0, -1);
  const tail = pathArray.slice(-1)[0];

  if (!tail) {
    return object;
  }

  const objectToUpdate = getByPathArray(object, head);
  const updated = Array.isArray(objectToUpdate)
    ? (() => {
        const copy = [...objectToUpdate];
        copy[Number.parseInt(tail, 10)] = value;
        return copy;
      })()
    : { ...objectToUpdate, [tail]: value };

  if (head.length === 0) {
    return updated;
  }
  return setByPathArray(object, head, updated);
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("set", () => {
    const object = { a: { b: { c: "TEST" } } };
    expect(set(object, "a", "1")).toEqual({ a: "1" });
    expect(set(object, "a.b", "1")).toEqual({ a: { b: "1" } });
    expect(set(object, "a.b.c", "1")).toEqual({ a: { b: { c: "1" } } });

    const array = ["a", "b", "c"];
    expect(set(array, "0", "A")).toEqual(["A", "b", "c"]);
    expect(set(array, "1", "B")).toEqual(["a", "B", "c"]);

    const mixed = { a: { b: [{ c: 1 }, { c: 2 }] } };
    expect(set(mixed, "a.b.0", "A")).toEqual({
      a: { b: ["A", { c: 2 }] },
    });
    expect(set(mixed, "a.b.1.c", 10)).toEqual({
      a: { b: [{ c: 1 }, { c: 10 }] },
    });
  });
}

export function pipe<T>(...fns: ((value: T) => T)[]): (value: T) => T {
  return (x: T) => fns.reduce((v, f) => f(v), x);
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
