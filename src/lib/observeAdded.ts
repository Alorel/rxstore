import {OperatorFunction, pipe} from 'rxjs';
import {pairwise, startWith} from 'rxjs/operators';

const NO_VALUE: any = Symbol();

/**
 * Emit a value nothing else can emit, start deduping and maintaining object refs
 * @internal
 */
export function observeAdded<T>(): OperatorFunction<T, [T, T]> {
  return pipe(
    startWith<T>(NO_VALUE as T),
    pairwise<T>()
  );
}
