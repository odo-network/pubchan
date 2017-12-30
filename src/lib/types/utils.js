/* @flow */

type AsNonMaybeObject = <O>(O) => $ObjMap<O, <T>(T) => $NonMaybeType<T>>;

/*
  { one: void | string, two: void | number, three?: string } -->
  { one: string, two: number, three?: string }
*/
export type $NonMaybeObject<O> = $Call<AsNonMaybeObject, O>;

/*
  { one: void | string, two: void | number, three?: string } -->
  {| +one: void | string, +two: void | number, +three?: string |}
*/
export type $ExactReadOnly<O> = $ReadOnly<$Exact<O>>;

type AsStrictObject = <O>(O) => $ExactReadOnly<$NonMaybeObject<O>>;

/*
  { one: void | string, two: void | number, three?: string } -->
  {| +one: string, +two: number, +three?: string |}
*/
export type $StrictObject<O> = $Call<AsStrictObject, O>;

/*
  { one: string, two: number, three?: string } -->
  { +one?: string, +two?: number, +three?: string }
*/
export type $ReadOnlyShape<O> = $ReadOnly<$Shape<O>>;

/*
  string -->
  Array<string> | string
*/
export type $TypeOrArray<T> = Array<T> | T;

/*
  Array<string> | string -->
  string
*/
export type $NonArrayType<A> = $Call<<T>(Array<T> | T) => T, A>;
