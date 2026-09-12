DELETE FROM forum_comments;
DELETE FROM forum_threads;
DELETE FROM rehearsal_logs;
DELETE FROM score_instruments;
DELETE FROM scores;
DELETE FROM instruments;
DELETE FROM organization_members;
DELETE FROM organizations;
DELETE FROM users;

INSERT INTO users (id, email, username, password_hash, first_name, last_name, bio, profile_picture_url, role, instrument_primary, instrument_secondary, is_active)
VALUES
  ('dir-1', 'director1@musicfolder.test', 'director1', 'demo123', 'Ana', 'Molina', 'Directora artística', NULL, 'Director / Conductor', 'Pista', NULL, 1),
  ('mus-1', 'musico1@musicfolder.test', 'musico1', 'demo123', 'Tomás', 'Bianchi', 'Violinista', NULL, 'Músico / Instrumentista', 'Violín', 'Piano', 1);

INSERT INTO instruments (
  id, name, family, transposition, is_transposing,
  range_json, concert_range_json, clef_json, dynamic_range_json,
  techniques_json, maintenance_tips, historical_info, notable_repertoire_json
)
VALUES
  (
    'violin',
    'Violín',
    'strings',
    'En Do (no transpone)',
    0,
    '{"lowest_note":"G3","highest_note":"E7"}',
    '{"lowest_note":"G3","highest_note":"E7"}',
    '["treble"]',
    '{"softest":"pp","loudest":"ff"}',
    '["legato","staccato","pizzicato"]',
    'Limpiar la resina tras el uso.',
    'Instrumento principal de cuerda frotada.',
    '["Concierto para violín","Sinfonía n° 5"]'
  ),
  (
    'piano',
    'Piano',
    'keyboard',
    'En Do (no transpone)',
    0,
    '{"lowest_note":"A0","highest_note":"C8"}',
    '{"lowest_note":"A0","highest_note":"C8"}',
    '["treble","bass"]',
    '{"softest":"ppp","loudest":"fff"}',
    '["legato","staccato","pedal"]',
    'Afinación periódica y limpieza del teclado.',
    'Instrumento polifónico de gran rango.',
    '["Claro de luna","Patética"]'
  );

INSERT INTO scores (
  id, title, composer, arranger, owner_id, organization_id, file_url, file_format,
  file_size, instrument_role, key_signature, time_signature, duration_minutes,
  difficulty_level, tags_json, is_public
)
VALUES
  ('score-1', 'Sinfonía n.º 5', 'L. van Beethoven', NULL, 'dir-1', NULL, 'https://example.com/scores/score-1.pdf', 'pdf', 1240000, 'Orquesta completa', 'C minor', '4/4', 30, 'advanced', '["clásica","orquesta"]', 1),
  ('score-2', 'Danzón n.º 2', 'Arturo Márquez', NULL, 'dir-1', NULL, 'https://example.com/scores/score-2.pdf', 'pdf', 800000, 'Orquesta completa', 'D major', '3/4', 25, 'intermediate', '["latino","orquesta"]', 1);

INSERT INTO rehearsal_logs (id, title, type, date_text, time_text, venue, attendees_count, notes)
VALUES
  ('rehearsal-1', 'Ensayo general', 'General', 'Jueves, 31 de julio', '19:00-22:00', 'Auditorio Manuel de Falla', 46, 'Revisar tutti en compás 45'),
  ('rehearsal-2', 'Seccionales de cuerdas', 'Seccional', 'Lunes, 28 de julio', '18:00-20:00', 'Sala de Ensayo B', 18, 'Trabajar articulación staccato');

INSERT INTO forum_threads (id, title, author, meta, category, likes)
VALUES
  ('thread-1', 'Recomendaciones para programar música latinoamericana', 'Valentina Ruiz', 'Hace 2 h', 'Repertorio', 15),
  ('thread-2', '¿Cómo trabajan las dinámicas en seccionales?', 'Martín López', 'Ayer', 'Técnica', 8);

INSERT INTO forum_comments (id, thread_id, author, date_text, content)
VALUES
  ('comment-1', 'thread-1', 'Martín López', 'Hace 1 h', 'Recomiendo incluir piezas de Arturo Márquez y Silvestre Revueltas.'),
  ('comment-2', 'thread-2', 'Carlos Mendonça', 'Ayer', 'Usamos afinadores con espectrómetro y metrónomo subdividido.');