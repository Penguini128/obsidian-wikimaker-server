export function mergeJson(obj1, obj2) {
    const result = { ...obj1 };
  
    for (const key of Object.keys(obj2)) {
      if (obj2[key] instanceof Object && key in obj1) {
        result[key] = mergeJson(obj1[key], obj2[key]);
      } else {
        result[key] = obj2[key];
      }
    }
  
    return result;
}