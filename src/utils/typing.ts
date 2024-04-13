export function getStronglyTypedKeys<T extends object>(object: T): (keyof T)[] {
  return Object.keys(object) as (keyof T)[];
}

export function getStronglyTypedEntries<T extends object>(
  object: T
): [keyof T, T[keyof T]][] {
  return Object.entries(object) as [keyof T, T[keyof T]][];
}

export function getStronglyTypedValues<T extends object>(
  object: T
): T[keyof T][] {
  return Object.values(object) as T[keyof T][];
}
