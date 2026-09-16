import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

const uuidPk = () =>
  new TableColumn({ name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' });

const timestamps = () => [
  new TableColumn({ name: 'created_at', type: 'timestamp', default: 'now()' }),
  new TableColumn({ name: 'updated_at', type: 'timestamp', default: 'now()' }),
];

/**
 * Migración inicial: crea el esquema completo de Music Folder.
 *
 * Es IDEMPOTENTE (`createTable(..., true)`): cada tabla se crea sólo si no existe.
 * Esto permite aplicarla sin riesgos tanto sobre una base vacía como sobre la base
 * de producción, donde las tablas ya fueron creadas por `synchronize` antes de la
 * Fase 2 (no se altera ninguna tabla existente ni se pierden datos).
 *
 * Los PK `uuid` usan `gen_random_uuid()`, disponible en el núcleo de PostgreSQL 13+
 * (el proyecto usa 15), por lo que no dependen de la extensión `uuid-ossp`.
 *
 * Para cambios futuros, generar la migración en lugar de tocar este archivo:
 *   npm --workspace apps/api run migration:generate -- src/migrations/<Nombre>
 */
export class InitialSchema1789600000000 implements MigrationInterface {
  name = 'InitialSchema1789600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Best-effort: algunas bases heredadas tienen defaults `uuid_generate_v4()`.
    // Si el usuario de la base no puede crear extensiones, se continúa igualmente.
    try {
      await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    } catch (error) {
      console.warn(`[InitialSchema] No se pudo crear la extensión uuid-ossp: ${(error as Error).message}`);
    }

    for (const table of this.tables()) {
      await queryRunner.createTable(table, true);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Se eliminan en orden inverso para respetar las claves foráneas.
    for (const table of [...this.tables()].reverse()) {
      await queryRunner.dropTable(table.name, true);
    }
  }

  private tables(): Table[] {
    return [
      new Table({
        name: 'users',
        columns: [
          new TableColumn({ name: 'id', type: 'varchar', isPrimary: true }),
          new TableColumn({ name: 'email', type: 'varchar', isUnique: true }),
          new TableColumn({ name: 'username', type: 'varchar', isUnique: true, isNullable: true }),
          new TableColumn({ name: 'password_hash', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'first_name', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'last_name', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'bio', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'profile_picture_url', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'role', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'instrument_primary', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'instrument_secondary', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'is_active', type: 'boolean', default: true }),
          ...timestamps(),
        ],
      }),

      new Table({
        name: 'instruments',
        columns: [
          new TableColumn({ name: 'id', type: 'varchar', isPrimary: true }),
          new TableColumn({ name: 'name', type: 'varchar' }),
          new TableColumn({ name: 'family', type: 'varchar' }),
          new TableColumn({ name: 'transposition', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'is_transposing', type: 'boolean', default: false }),
          new TableColumn({ name: 'range', type: 'text', isNullable: true }),
          new TableColumn({ name: 'concert_range', type: 'text', isNullable: true }),
          new TableColumn({ name: 'clef', type: 'text', isNullable: true }),
          new TableColumn({ name: 'dynamic_range', type: 'text', isNullable: true }),
          new TableColumn({ name: 'techniques', type: 'text', isNullable: true }),
          new TableColumn({ name: 'maintenance_tips', type: 'text', isNullable: true }),
          new TableColumn({ name: 'historical_info', type: 'text', isNullable: true }),
          new TableColumn({ name: 'notable_repertoire', type: 'text', isNullable: true }),
          ...timestamps(),
        ],
      }),

      new Table({
        name: 'scores',
        columns: [
          new TableColumn({ name: 'id', type: 'varchar', isPrimary: true }),
          new TableColumn({ name: 'title', type: 'varchar' }),
          new TableColumn({ name: 'composer', type: 'varchar' }),
          new TableColumn({ name: 'arranger', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'owner_id', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'organization_id', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'file_url', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'file_format', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'file_size', type: 'bigint', isNullable: true }),
          new TableColumn({ name: 'instrument_role', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'key_signature', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'time_signature', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'duration_minutes', type: 'int', isNullable: true }),
          new TableColumn({ name: 'difficulty_level', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'tags', type: 'text', isNullable: true }),
          new TableColumn({ name: 'is_public', type: 'boolean', default: false }),
          ...timestamps(),
        ],
      }),

      new Table({
        name: 'rehearsal_logs',
        columns: [
          new TableColumn({ name: 'id', type: 'varchar', isPrimary: true }),
          new TableColumn({ name: 'title', type: 'varchar' }),
          new TableColumn({ name: 'type', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'date_text', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'time_text', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'venue', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'attendees_count', type: 'int', isNullable: true }),
          new TableColumn({ name: 'notes', type: 'text', isNullable: true }),
          ...timestamps(),
        ],
      }),

      new Table({
        name: 'forum_threads',
        columns: [
          new TableColumn({ name: 'id', type: 'varchar', isPrimary: true }),
          new TableColumn({ name: 'title', type: 'varchar' }),
          new TableColumn({ name: 'author', type: 'varchar' }),
          new TableColumn({ name: 'meta', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'category', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'likes', type: 'int', default: 0 }),
          ...timestamps(),
        ],
      }),

      new Table({
        name: 'forum_comments',
        columns: [
          new TableColumn({ name: 'id', type: 'varchar', isPrimary: true }),
          new TableColumn({ name: 'thread_id', type: 'varchar' }),
          new TableColumn({ name: 'author', type: 'varchar' }),
          new TableColumn({ name: 'date_text', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'content', type: 'text' }),
          ...timestamps(),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['thread_id'],
            referencedTableName: 'forum_threads',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),

      new Table({
        name: 'notifications',
        columns: [
          uuidPk(),
          new TableColumn({ name: 'user_id', type: 'uuid', isNullable: true }),
          new TableColumn({ name: 'type', type: 'varchar', length: '50' }),
          new TableColumn({ name: 'title', type: 'varchar', length: '150' }),
          new TableColumn({ name: 'message', type: 'text' }),
          new TableColumn({ name: 'read', type: 'boolean', default: false }),
          new TableColumn({ name: 'target_id', type: 'uuid', isNullable: true }),
          new TableColumn({ name: 'metadata', type: 'text', isNullable: true }),
          ...timestamps(),
        ],
      }),

      new Table({
        name: 'groups',
        columns: [
          uuidPk(),
          new TableColumn({ name: 'name', type: 'varchar', length: '120' }),
          new TableColumn({ name: 'description', type: 'text', isNullable: true }),
          new TableColumn({ name: 'type', type: 'varchar', default: "'ensemble'" }),
          new TableColumn({ name: 'visibility', type: 'varchar', default: "'private'" }),
          new TableColumn({ name: 'owner_id', type: 'varchar' }),
          new TableColumn({ name: 'join_code', type: 'varchar', length: '12', isUnique: true }),
          new TableColumn({ name: 'is_join_code_active', type: 'boolean', default: true }),
          ...timestamps(),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['owner_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),

      new Table({
        name: 'group_members',
        columns: [
          uuidPk(),
          new TableColumn({ name: 'group_id', type: 'uuid' }),
          new TableColumn({ name: 'user_id', type: 'varchar' }),
          new TableColumn({ name: 'role', type: 'varchar', default: "'student'" }),
          new TableColumn({ name: 'status', type: 'varchar', default: "'active'" }),
          new TableColumn({ name: 'joined_at', type: 'timestamp', default: 'now()' }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['group_id'],
            referencedTableName: 'groups',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),

      new Table({
        name: 'group_library_items',
        columns: [
          uuidPk(),
          new TableColumn({ name: 'group_id', type: 'uuid' }),
          new TableColumn({ name: 'title', type: 'varchar', length: '200' }),
          new TableColumn({ name: 'description', type: 'text', isNullable: true }),
          new TableColumn({ name: 'type', type: 'varchar', default: "'score'" }),
          new TableColumn({ name: 'file_url', type: 'text', isNullable: true }),
          new TableColumn({ name: 'uploaded_by', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'created_at', type: 'timestamp', default: 'now()' }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['group_id'],
            referencedTableName: 'groups',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['uploaded_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
        ],
      }),

      new Table({
        name: 'group_rehearsals',
        columns: [
          uuidPk(),
          new TableColumn({ name: 'group_id', type: 'uuid' }),
          new TableColumn({ name: 'title', type: 'varchar', length: '200' }),
          new TableColumn({ name: 'date', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'time', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'location', type: 'varchar', isNullable: true }),
          new TableColumn({ name: 'agenda', type: 'text', isNullable: true }),
          new TableColumn({ name: 'notes', type: 'text', isNullable: true }),
          new TableColumn({ name: 'created_by', type: 'varchar', isNullable: true }),
          ...timestamps(),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['group_id'],
            referencedTableName: 'groups',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['created_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
        ],
      }),

      new Table({
        name: 'group_community_posts',
        columns: [
          uuidPk(),
          new TableColumn({ name: 'group_id', type: 'uuid' }),
          new TableColumn({ name: 'author_id', type: 'varchar' }),
          new TableColumn({ name: 'title', type: 'varchar', length: '200' }),
          new TableColumn({ name: 'content', type: 'text' }),
          new TableColumn({ name: 'visibility', type: 'varchar', default: "'group'" }),
          new TableColumn({ name: 'created_at', type: 'timestamp', default: 'now()' }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['group_id'],
            referencedTableName: 'groups',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['author_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
    ];
  }
}