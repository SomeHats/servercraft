exports.up = function(knex) {
  return knex.schema.createTable('access_keys', function(table) {
    table.uuid('id').primary().index().notNullable();
    table.uuid('user_id').index().notNullable().references('id').inTable('users');
    table.timestamps();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('accessKeys');
};
