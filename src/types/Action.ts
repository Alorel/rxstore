export interface Action<T extends string | number = string> {
  type: T;
}

export interface PayloadAction<P, T extends string | number = string> extends Action<T> {
  payload: P;
}

export interface AnyAction<T extends string | number = string> extends Action<T> {
  [k: string]: any;

  [i: number]: any;
}
