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

  addCleanup(logic: TeardownLogic): this;

  close(): void;

  observe(): Observable<S>;

  toJSON(): S;
}

export interface RootStore<S extends object = {}, A extends Action<any> = AnyAction<any>> extends Store<S, A> {
  add<K extends keyof S>(key: K, store: Store<S[K], AnyAction<any>>): void;
}
