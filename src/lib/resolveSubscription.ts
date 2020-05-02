import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {ofType} from '../operators/ofType';
import {Action} from '../types/Action';
import {ActionReducers} from '../types/ActionReducers';

/** @internal */
export function resolveSubscription<A extends Action<any>, S>(
  state$: BehaviorSubject<S>,
  actions$: Observable<A>,
  reducers: ActionReducers<A, S>
): Subscription | null {
  const keys = Object.keys(reducers);
  if (!keys.length) {
    return null;
  }

  return actions$
    .pipe(
      ofType(...keys),
      map((action: A): S => reducers[action.type](state$.value, action)),
      catchError((e: any, s) => {
        console.error('Reducer error', e);

        return s;
      })
    )
    .subscribe(updatedState => {
      state$.next(updatedState);
    });
}
