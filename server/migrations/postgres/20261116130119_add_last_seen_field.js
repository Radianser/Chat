/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.alterTable('users', (table) => {
        table.timestamp('last_seen_at', { useTz: true }) // ✅ timestamptz
             .defaultTo(knex.fn.now()); // ✅ теперь база сама подставит время
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.alterTable('users', (table) => {
        table.dropColumn('last_seen_at');
    });
}