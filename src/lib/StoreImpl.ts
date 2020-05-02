import {Action, AnyAction} from '../types/Action';
import {ActionReducers} from '../types/ActionReducers';
import {AbstractStore} from './AbstractStore';
import {resolveSubscription} from './resolveSubscription';

/** @internal */
export class StoreImpl<S = any, A extends Action<any> = AnyAction<any>>
  extends AbstractStore<S, A> {

  public constructor(defaultState: S, reducers: ActionReducers<A, S>) {
    super(defaultState, reducers);

    const sub = resolveSubscription(this.state$, this.actions$, this.reducers$);
    if (sub) {
      this.addCleanup(sub);
    }
  }
}
