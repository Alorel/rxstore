import {BehaviorSubject, merge, Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {Action, AnyAction} from '../types/Action';
import {RootStore, Store} from '../types/Store';
import {AbstractStore} from './AbstractStore';
import {def} from './def';
import {observeAdded} from './observeAdded';

const _children: unique symbol = Symbol('Children');

type Child = [string | number, Store];

/** @internal */
export class RootStoreImpl<S extends object = {}, A extends Action<any> = AnyAction<any>>
  extends AbstractStore<S, A>
  implements RootStore<S, A> {

  private readonly [_children]: BehaviorSubject<Child[]>;

  public constructor() {
    super({} as any, {});

    const children$ = new BehaviorSubject<Child[]>([]);

    def(this, _children, children$);

    children$
      .pipe(
        switchMap((children): Observable<S> => {
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
        })
      )
      .subscribe((newState: S): void => {
        this.state$.next(newState);
      });
  }

  /** @inheritDoc */
  public add<K extends keyof S>(key: K, store: Store<S[K], AnyAction<any>>): void {
    this.checkAddable(key, store);
    const children = this[_children].value.slice();
    children.push([key as string, store]);
    this[_children].next(children);
  }

  /** @inheritDoc */
  public close(): void {
    const children = this[_children];
    const value = children.value;

    for (const child of value) {
      child[1].close();
    }

    children.complete();
    value.splice(0, value.length);
    super.close();
  }
}
