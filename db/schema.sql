PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    password_hash TEXT,
    first_name TEXT,
    last_name TEXT,
    bio TEXT,
    profile_picture_url TEXT,
    role TEXT,
    instrument_primary TEXT,
    instrument_secondary TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    organization_type TEXT,
    founder_id TEXT,
    profile_picture_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(founder_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS organization_members (
    organization_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT,
    PRIMARY KEY (organization_id, user_id),
    FOREIGN KEY(organization_id) REFERENCES organizations(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS instruments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    family TEXT NOT NULL,
    transposition TEXT,
    is_transposing INTEGER DEFAULT 0,
    range_json TEXT NOT NULL,
    concert_range_json TEXT NOT NULL,
    clef_json TEXT NOT NULL,
    dynamic_range_json TEXT NOT NULL,
    techniques_json TEXT NOT NULL,
    maintenance_tips TEXT,
    historical_info TEXT,
    notable_repertoire_json TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scores (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    composer TEXT NOT NULL,
    arranger TEXT,
    owner_id TEXT,
    organization_id TEXT,
    file_url TEXT,
    file_format TEXT,
    file_size INTEGER,
    instrument_role TEXT,
    key_signature TEXT,
    time_signature TEXT,
    duration_minutes INTEGER,
    difficulty_level TEXT,
    tags_json TEXT,
    is_public INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(owner_id) REFERENCES users(id),
    FOREIGN KEY(organization_id) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS score_instruments (
    score_id TEXT NOT NULL,
    instrument_id TEXT NOT NULL,
    PRIMARY KEY(score_id, instrument_id),
    FOREIGN KEY(score_id) REFERENCES scores(id),
    FOREIGN KEY(instrument_id) REFERENCES instruments(id)
);

CREATE TABLE IF NOT EXISTS rehearsal_logs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT,
    date_text TEXT,
    time_text TEXT,
    venue TEXT,
    attendees_count INTEGER,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rehearsal_participants (
    rehearsal_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    present INTEGER DEFAULT 1,
    PRIMARY KEY(rehearsal_id, user_id),
    FOREIGN KEY(rehearsal_id) REFERENCES rehearsal_logs(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS forum_threads (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    meta TEXT,
    category TEXT,
    likes INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forum_comments (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL,
    author TEXT NOT NULL,
    date_text TEXT,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(thread_id) REFERENCES forum_threads(id)
);
