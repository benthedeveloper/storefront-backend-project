export const toCamelCase = (obj: Record<string, unknown>): Record<string, unknown> => {
  const camelCased: Record<string, unknown> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      camelCased[camelKey] = obj[key];
    }
  }

  return camelCased;
};
