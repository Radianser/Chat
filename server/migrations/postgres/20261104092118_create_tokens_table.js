/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.createTable('tokens', (table) => {
        table.increments('id').primary();
        table.string('value').notNullable().unique();
        table.integer('user_id').unsigned().notNullable().references('id').inTable('users');
        table.timestamps(true, true);
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.dropTableIfExists('tokens');
}