import {Action} from './Action';

export type ActionReducer<A extends Action<any>, S> = (state: S, action: A) => S;

export interface ActionReducers<A extends Action<any>, S> {
  [stringActionName: string]: ActionReducer<A, S>;

  [numberActionName: number]: ActionReducer<A, S>;
}

console.log('foo');
