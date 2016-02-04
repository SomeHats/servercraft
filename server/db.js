import knex from 'knex';
import createDebug from 'debug';
import Bookshelf from 'bookshelf';
import jwt from 'jsonwebtoken';
import {camelize, snakeify, mapObj} from './utils';

let debug = createDebug('servercraft:db');

// Create database connection
export let db = knex({
  client: 'sqlite3',
  connection: {
    filename: process.env.SERVERCRAFT_DB || './servercraft.sqlite'
  },
  debug: process.env.NODE_ENV !== 'production'
});
let bookshelf = Bookshelf(db);

// Extend bookshelf's default model with some extras - debug logging, timestamps on by default,
// formatting, and static Model.exists(id) + Model.byId(id) functions
let BaseModel = bookshelf.Model.extend({
  initialize() {
    'created destroyed fetched saved updated'.split(' ').forEach(name =>
      this.on(name, (model) => debug(`${this.tableName}:${name}:id ${model.id}`)));
  },

  hasTimestamps: ['createdAt', 'updatedAt'],

  // Convert snake_case to camelCase when we recieve stuff from the database
  parse(attrs) {
    return mapObj(attrs, (key, value) => [camelize(key), value]);
  },

  // Convert camelCase to snake_case when sending stuff to the database
  format(attrs) {
    return mapObj(attrs, (key, value) => [snakeify(key), value]);
  }
}, {
  async exists(id) {
    return !!(await this.where({id}).fetch({require: false, columns: 'id'}));
  },

  byId(id, options) {
    return this.where({id}, options);
  }
});

export let User = BaseModel.extend({
  tableName: 'users',

  accessKeys() {
    return this.hasMany(AccessKey);
  },

  format(attrs) {
    if (attrs.name) attrs.name = attrs.name.toLowerCase();
    return BaseModel.prototype.format(attrs);
  }
});

export let AccessKey = BaseModel.extend({
  tableName: 'access_keys',

  user() {
    return this.belongsTo(User);
  },

  getToken(clientToken, secret) {
    return jwt.sign({clientToken, accessToken: this.id}, secret, {issuer: 'servercraft'});
  }
});
