export const list = params => {
  if (params.length === 1) {
    return params[0];
  }
  let last = params.pop();
  return `${params.join(', ')} and ${last}`;
}

export class ValidationError extends Error {
  constructor(errors) {
    let params = list(errors.map(({param}) => param));
    super(`Invalid ${params}`);
    this.status = 400;
  }
}

export const wrap = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

export const camelize = (str) => str.replace(/[-_]([a-zA-Z])/g, (m, c) => c.toUpperCase());

export const snakeify = (str) => str.replace(/([a-z])([A-Z])/g, (m, l, u) => `${l}_${u.toLowerCase()}`);

export const mapObj = (obj, fn) => {
  let newObj = {};
  for (let key in obj) {
    let [newKey, newVal] = fn(key, obj[key]);
    newObj[newKey] = newVal;
  }
  return newObj;
}
