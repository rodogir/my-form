export function get<O extends object>(object: O, path: Paths<O>): any {
  return getByPathArray(object, path.split("."));
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("get", () => {
    const object = { a: { b: { c: "TEST" } } };
    expect(get(object, "a")).toEqual(object.a);
    expect(get(object, "a.b")).toEqual(object.a.b);
    expect(get(object, "a.b.c")).toBe(object.a.b.c);
    expect(get(object, "a.b.c.d")).toBe(undefined);

    const array = ["a", "b", "c"];
    expect(get(array, "0")).toEqual(array[0]);
    expect(get(array, "1")).toEqual(array[1]);
    expect(get(array, "2")).toEqual(array[2]);

    const mixed = { a: { b: [{ c: 1 }, { c: 2 }] } };
    expect(get(mixed, "a")).toEqual(mixed.a);
    expect(get(mixed, "a.b")).toEqual(mixed.a.b);
    expect(get(mixed, "a.b.0")).toEqual(mixed.a.b[0]);
    expect(get(mixed, "a.b.1")).toEqual(mixed.a.b[1]);
    expect(get(mixed, "a.b.0.c")).toBe(mixed.a.b[0].c);
    expect(get(mixed, "a.b.1.c")).toBe(mixed.a.b[1].c);
    expect(get(mixed, "a.b.1.c.d")).toBe(undefined);
  });
}

function getByPathArray<O extends object>(object: O, path: string[]): any {
  return path.reduce((res, prop) => (res as any)?.[prop], object);
}

export function set<T extends Record<string, unknown>>(
  object: T,
  path: string,
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
