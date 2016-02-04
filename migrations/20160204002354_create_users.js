exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.uuid('id').primary().index().notNullable();
    table.string('name').index().notNullable();
    table.string('display_name').notNullable();
    table.timestamps();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
