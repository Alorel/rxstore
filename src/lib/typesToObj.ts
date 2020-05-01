import {Action} from '../types/Action';

/** @internal */
export interface TypesObj {
  [k: string]: any;

  [i: number]: any;
}

/** @internal */
export function typesToObj(types: Action['type'][]): TypesObj {
  return types
    .reduce<TypesObj>(
      (acc, type) => {
        acc[type] = true;

        return acc;
      },
      {}
    );
}
