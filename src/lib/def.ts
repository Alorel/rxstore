const dprop = Object.defineProperty; //tslint:disable-line:no-unbound-method

/** @internal */
export function def(obj: any, prop: PropertyKey, value: any): void {
  dprop(obj, prop, {value});
}

/** @internal */
export function defMutable(obj: any, prop: PropertyKey, value: any): void {
  dprop(obj, prop, {
    configurable: true,
    value,
    writable: true
  });
}

/** @internal */
export function defVisible(obj: any, prop: PropertyKey, value: any): void {
  dprop(obj, prop, {
    enumerable: true,
    value
  });
}
