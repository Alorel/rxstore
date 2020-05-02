import {merge, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {AbstractStore} from './AbstractStore';
import {observeAdded} from './observeAdded';

/** @internal */
export type Child = [string | number, AbstractStore];

/** @internal */
export function childrenToState<S extends object>(children: Child[]): Observable<S> {
  let outState: S = {} as any;

  if (!children.length) {
    return of(outState as any);
  }

  const mapped: Observable<S>[] = children
    .map(([key, store]): Observable<S> => {
      return store.observe()
        .pipe(
          observeAdded(),
          map(([old, curr]): typeof outState => {
            if (old !== curr) {
              outState = {...outState, [key]: curr};
            }

            return outState;
          })
        );
    });

  return merge(...mapped);
}
