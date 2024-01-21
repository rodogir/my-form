export type FormValues = Record<string, unknown>;

export type FieldName<T, TDepth extends any[] = []> = TDepth["length"] extends 5
	? never
	: T extends object
	  ? {
				[K in keyof T]: T[K] extends ReadonlyArray<infer U>
					?
							| `${K & string}`
							| (U extends object
									? `${K & string}.${number}.${FieldName<U, [...TDepth, any]> &
											string}`
									: never)
					: T[K] extends object
					  ?
								| `${K & string}`
								| `${K & string}.${FieldName<T[K], [...TDepth, any]> & string}`
					  : `${K & string}`;
		  }[keyof T]
	  : never;

export type FieldValue<T, TProp> = T extends Record<string | number, any>
	? TProp extends `${infer TBranch}.${infer TDeepProp}`
		? FieldValue<T[TBranch], TDeepProp>
		: T[TProp & string]
	: never;

export type TypedFieldName<TValues, TFieldValue> = {
	[K in FieldName<TValues>]: NonNullable<
		FieldValue<TValues, K>
	> extends TFieldValue
		? K
		: never;
}[FieldName<TValues>];
