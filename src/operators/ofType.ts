import {EMPTY, OperatorFunction} from 'rxjs';
import {filter, switchMapTo} from 'rxjs/operators';
import {TypesObj, typesToObj} from '../lib/typesToObj';
import {Action} from '../types/Action';

type T = Action['type'];

/** @internal */
function filterForOne<I extends Action<any>, O extends I = I>(type: T): OperatorFunction<I, O> {
  return filter((a): a is O => a.type === type);
}

/** @internal */
function filterForTwo<I extends Action<any>, O extends I = I>(t1: T, t2: T): OperatorFunction<I, O> {
  return filter((a): a is O => a.type === t1 || a.type === t2);
}

/** @internal */
export function filterForMany<I extends Action<any>, O extends I = I>(types: TypesObj): OperatorFunction<I, O> {
  return filter((a): a is O => a.type in types);
}

/** Filter actions by type */
export function ofType<I extends Action<any>, O extends I = I>(
  ...types: Action['type'][]
): OperatorFunction<I, O> {
  switch (types.length) {
    case 0:
      return switchMapTo(EMPTY);
    case 1:
      return filterForOne(types[0]);
    case 2:
      return filterForTwo(types[0], types[1]);
    default:
      return filterForMany(typesToObj(types));
  }
}
