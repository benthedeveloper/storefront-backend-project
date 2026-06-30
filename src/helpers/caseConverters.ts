export function toCamelCase(obj: Record<string, any>): Record<string, any> {
  const camelCased: Record<string, any> = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    camelCased[camelKey] = obj[key];
  }
  return camelCased;
}
