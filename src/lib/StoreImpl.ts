import {Subscription} from 'rxjs';
import {Action, AnyAction} from '../types/Action';
import {ActionReducers} from '../types/ActionReducers';
import {Store} from '../types/Store';
import {AbstractStore} from './AbstractStore';
import {def} from './def';
import {observeAdded} from './observeAdded';
import {resolveSubscription} from './resolveSubscription';

const _sub$: unique symbol = Symbol('Action Subscription');

/** @internal */
export class StoreImpl<S = any, A extends Action<any> = AnyAction<any>>
  extends AbstractStore<S, A> {

  private readonly [_sub$]: Subscription;

  public constructor(defaultState: S, reducers: ActionReducers<A, S>) {
    super(defaultState, reducers);

    def(this, _sub$, resolveSubscription(this.state$, this.actions$, this.reducers$));
  }

  /** @inheritDoc */
  public add<K extends keyof S>(key: K, store: Store<S[K], AnyAction<any>>): void {
    this.checkAddable(key, store);

    this[_sub$].add(
      store.observe()
        .pipe(observeAdded())
        .subscribe(([old, curr]) => {
          const state = this.getState();

          this.state$.next(old === curr ? state : {
            ...state,
            [key]: curr
          });
        })
    );
  }

  /** @inheritDoc */
  public close(): void {
    this[_sub$].unsubscribe();
    super.close();
  }
}
