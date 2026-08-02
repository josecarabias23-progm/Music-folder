from pathlib import Path
import sqlite3

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / 'music-folder.sqlite'
SCHEMA_PATH = BASE_DIR / 'schema.sql'
SEED_PATH = BASE_DIR / 'seed.sql'


def run_sql_file(connection: sqlite3.Connection, sql_path: Path) -> None:
    sql = sql_path.read_text(encoding='utf-8')
    connection.executescript(sql)


if __name__ == '__main__':
    if DB_PATH.exists():
        DB_PATH.unlink()

    connection = sqlite3.connect(DB_PATH)
    try:
        run_sql_file(connection, SCHEMA_PATH)
        run_sql_file(connection, SEED_PATH)
        connection.commit()
        print(f'Base creada en: {DB_PATH}')
        print('Tablas disponibles:')
        for (name,) in connection.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"):
            print(f'- {name}')
    finally:
        connection.close()
