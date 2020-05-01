/** @internal */
export function isObject<T extends object = { [k: string]: any }>(v: any): v is T {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}
