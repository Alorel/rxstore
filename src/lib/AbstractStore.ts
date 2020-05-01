import {BehaviorSubject, EMPTY, noop, Observable, of, Subject, TeardownLogic, Unsubscribable} from 'rxjs';
import {skip} from 'rxjs/operators';
import {Action, AnyAction} from '../types/Action';
import {ActionReducers} from '../types/ActionReducers';
import {Store} from '../types/Store';
import {def, defVisible} from './def';
import {isObject} from './isObject';

//tslint:disable:no-this-assignment
// Assigning to this for better minification

const _actions$: unique symbol = Symbol('Actions');
const _state$: unique symbol = Symbol('State');
const _subs: unique symbol = Symbol('State Subscriptions');

/** @internal */
export abstract class AbstractStore<S = any, A extends Action<any> = AnyAction<any>>
  implements Store<S, A> {
  /** @inheritDoc */
  public readonly isClosed = false;

  public readonly reducers$: Readonly<ActionReducers<A, S>>;

  protected readonly actions$: Subject<A> = new Subject<A>();

  protected readonly state$: BehaviorSubject<S>;

  private readonly [_actions$]: Observable<A>;

  private readonly [_subs]: Unsubscribable[] = [];

  private readonly [_state$]: Observable<S>;

  public constructor(defaultState: S, reducers: ActionReducers<A, S>) {
    const frozenReducers = Object.freeze({...reducers});
    const state$ = new BehaviorSubject<S>(defaultState);
    const actions$ = new Subject<A>();

    const self = this;

    def(self, 'state$', state$);
    def(self, _state$, state$.asObservable());
    def(self, 'actions$', actions$);
    def(self, _actions$, actions$.asObservable());
    def(self, 'reducers$', frozenReducers);

    self.dispatch = self.dispatch.bind(self);
  }

  /** @inheritDoc */
  public actions(): Observable<A> {
    return this[_actions$];
  }

  /** @inheritDoc */
  public abstract add<K extends keyof S>(key: K, _store: Store<S[K]>): void;

  /** @inheritDoc */
  public addCleanup(logic: TeardownLogic): void {
    if (!logic) {
      return;
    } else if ('unsubscribe' in logic) {
      this[_subs].push(logic);
    } else if (typeof logic === 'function') {
      this[_subs].push({unsubscribe: logic as () => void});
    } else {
      throw new TypeError('Invalid teardown logic');
    }
  }

  /** @inheritDoc */
  public close(): void {
    const self = this;

    self.state$.complete();
    self.actions$.complete();
    for (const s of self[_subs]) {
      s.unsubscribe();
    }
    self[_subs].splice(0, self[_subs].length);

    const currState = self.getState();

    defVisible(self, 'actions', () => EMPTY);
    defVisible(self, 'add', (key: string): never => {
      throw new Error(`The store is closed - cannot add ${key}.`);
    });
    // Keep argument so the arg can show up in debug mode
    defVisible(self, 'addCleanup', (_logic: TeardownLogic) => {
      throw new Error('The store is closed - cannot add cleanup logic');
    });
    defVisible(self, 'close', noop);
    defVisible(self, 'dispatch', noop);
    defVisible(self, 'isClosed', true);
    defVisible(self, 'getState', () => currState);
    defVisible(self, 'observe', () => of(currState));
    defVisible(self, 'subscribe', () => noop);

    const json = self.toJSON();
    defVisible(self, 'toJSON', () => json);
  }

  /** @inheritDoc */
  public dispatch(action: A): void {
    this.actions$.next(action);
  }

  /** @inheritDoc */
  public getState(): S {
    return this.state$.value;
  }

  /** @inheritDoc */
  public observe(): Observable<S> {
    return this[_state$];
  }

  /** @inheritDoc */
  public subscribe(listener: () => void): () => void {
    const sub = this.observe().pipe(skip(1))
      .subscribe(() => {
        listener();
      });
    this[_subs].push(sub);

    return () => {
      const idx = this[_subs].indexOf(sub);
      if (idx !== -1) {
        this[_subs].splice(idx, 1);
      }
      sub.unsubscribe();
    };
  }

  /** @internal */
  public toJSON(): S {
    return this.getState();
  }

  protected checkAddable<K extends keyof S>(key: K, _store: Store<S[K]>): void {
    // Only do sense-checking here. Extending classes must implement logic.
    const currState = this.getState();

    if (!isObject(currState)) {
      throw new Error(`The store's state is not an object - cannot add ${key}.`);
    } else if (key in currState) {
      throw new Error(`Conflict: the store already has the ${key} key.`);
    }
  }
}
