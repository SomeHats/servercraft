export const formatError = error => {
  if (typeof error === 'string') return error;
  if (error && error.data && error.data.message) return error.data.message;
  if (error && error.message) return error.message;
  return 'Unknown error';
};

export const find = (arr, cond) => {
  for (let item of arr) {
    if (cond(item)) return item;
  }
  return undefined;
}
