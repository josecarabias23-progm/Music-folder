-- Esquema PostgreSQL para Music Folder

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    bio TEXT,
    profile_picture_url VARCHAR(512),
    role VARCHAR(100),
    instrument_primary VARCHAR(100),
    instrument_secondary VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    organization_type VARCHAR(100),
    founder_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    profile_picture_url VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organization_members (
    organization_id VARCHAR(255) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100),
    PRIMARY KEY (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS instruments (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    family VARCHAR(100) NOT NULL,
    transposition VARCHAR(100),
    is_transposing BOOLEAN DEFAULT FALSE,
    range JSONB NOT NULL,
    concert_range JSONB NOT NULL,
    clef JSONB NOT NULL,
    dynamic_range JSONB NOT NULL,
    techniques JSONB NOT NULL,
    maintenance_tips TEXT,
    historical_info TEXT,
    notable_repertoire JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scores (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    composer VARCHAR(255) NOT NULL,
    arranger VARCHAR(255),
    owner_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    organization_id VARCHAR(255) REFERENCES organizations(id) ON DELETE SET NULL,
    file_url VARCHAR(512),
    file_format VARCHAR(50),
    file_size BIGINT,
    instrument_role VARCHAR(100),
    key_signature VARCHAR(50),
    time_signature VARCHAR(50),
    duration_minutes INTEGER,
    difficulty_level VARCHAR(50),
    tags JSONB,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS score_instruments (
    score_id VARCHAR(255) NOT NULL REFERENCES scores(id) ON DELETE CASCADE,
    instrument_id VARCHAR(100) NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
    PRIMARY KEY(score_id, instrument_id)
);

CREATE TABLE IF NOT EXISTS rehearsal_logs (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    date_text VARCHAR(100),
    time_text VARCHAR(100),
    venue VARCHAR(255),
    attendees_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rehearsal_participants (
    rehearsal_id VARCHAR(255) NOT NULL REFERENCES rehearsal_logs(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    present BOOLEAN DEFAULT TRUE,
    PRIMARY KEY(rehearsal_id, user_id)
);

CREATE TABLE IF NOT EXISTS forum_threads (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    meta VARCHAR(100),
    category VARCHAR(100),
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forum_comments (
    id VARCHAR(255) PRIMARY KEY,
    thread_id VARCHAR(255) NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
    author VARCHAR(255) NOT NULL,
    date_text VARCHAR(100),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

