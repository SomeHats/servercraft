exports.up = function(knex) {
  return knex.schema.createTable('worlds', function(table) {
    table.string('id').primary().index();
    table.string('owner_id').index().references('id').inTable('users');
    table.string('name');
    table.string('message');
    table.string('version');
    table.timestamps();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('worlds');
};
