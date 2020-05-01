import {Action, AnyAction} from '../types/Action';
import {ActionReducers} from '../types/ActionReducers';
import {RootStore, Store} from '../types/Store';
import {RootStoreImpl} from './RootStoreImpl';
import {StoreImpl} from './StoreImpl';

function createStore<S = any, A extends Action<any> = AnyAction<any>>(
  defaultState: S,
  reducers: ActionReducers<A, S>
): Store<S, A> {
  return new StoreImpl<S, A>(defaultState, reducers);
}

/** Same as createStore, but doesn't take any reducers or state of its own */
function createRootStore<S extends object = {}, A extends Action<any> = AnyAction<any>>(): RootStore<S, A> {
  return new RootStoreImpl<S, A>();
}

export {createStore, createRootStore};
