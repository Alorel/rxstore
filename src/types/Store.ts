import {Observable, TeardownLogic} from 'rxjs';
import {Action, AnyAction} from './Action';

export interface BaseStore<S = any, A extends Action<any> = AnyAction<any>> {
  dispatch(action: A): void;

  getState(): S;

  subscribe(listener: () => void): () => void;
}

export interface Store<S = any, A extends Action<any> = AnyAction<any>> extends BaseStore<S, A> {
  readonly isClosed: boolean;

  actions(): Observable<A>;

  add<K extends keyof S>(key: K, store: Store<S[K], AnyAction<any>>): void;

  addCleanup(logic: TeardownLogic): void;

  close(): void;

  observe(): Observable<S>;

  toJSON(): S;
}

export type RootStore<S extends object = {}, A extends Action<any> = AnyAction<any>> = Store<S, A>;
