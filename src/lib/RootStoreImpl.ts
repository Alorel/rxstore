import {BehaviorSubject, merge} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {Action, AnyAction} from '../types/Action';
import {RootStore, Store} from '../types/Store';
import {AbstractStore} from './AbstractStore';
import {Child, childrenToState} from './childrenToState';
import {def, defMutable} from './def';
import {isObject} from './isObject';

const _children: unique symbol = Symbol('Children');
const _childHandlers: unique symbol = Symbol('childHandlers');

/** @internal */
export class RootStoreImpl<S extends object = {}, A extends Action<any> = AnyAction<any>>
  extends AbstractStore<S, A>
  implements RootStore<S, A> {

  private readonly [_children]: BehaviorSubject<Child[]>;

  private [_childHandlers]: {
    [k: string]: Store;
    [i: number]: Store;
  };

  public constructor() {
    super({} as any, {});

    const children$ = new BehaviorSubject<Child[]>([]);

    def(this, _children, children$);

    this
      .addCleanup(
        children$
          .pipe(
            tap(children => {
              const handlers: RootStoreImpl[typeof _childHandlers] = {};
              for (const [, child] of children) {
                for (const actionName of Object.keys(child.reducers$)) {
                  handlers[actionName] = child;
                }
              }
              defMutable(this, _childHandlers, handlers);
            }),
            switchMap(childrenToState)
          )
          .subscribe((newState: S): void => {
            this.state$.next(newState);
          })
      )
      .addCleanup(
        children$
          .pipe(
            switchMap(children => merge(...children.map(c => c[1].actions())))
          )
          .subscribe((v: AnyAction) => {
            this.actions$.next(v as A);
          })
      );
  }

  /** @inheritDoc */
  public add<K extends keyof S>(key: K, store: Store<S[K], AnyAction<any>>): void {
    this.checkAddable(key, store);
    const children = this[_children].value.slice();
    children.push([key as string, store as AbstractStore]);
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

  public dispatch(action: A): void {
    if (this[_childHandlers][action.type]) {
      this[_childHandlers][action.type].dispatch(action);
    } else {
      super.dispatch(action);
    }
  }

  private checkAddable<K extends keyof S>(key: K, store: Store<S[K]>): void {
    if (!store || !(store as AbstractStore).reducers$) {
      throw new Error('Only stores created by this library are supported at the moment.');
    }
    const currState = this.getState();

    if (!isObject(currState)) {
      throw new Error(`The store's state is not an object - cannot add ${key}.`);
    } else if (key in currState) {
      throw new Error(`Conflict: the store already has the ${key} key.`);
    }
  }
}
