DELETE FROM forum_comments;
DELETE FROM forum_threads;
DELETE FROM rehearsal_logs;
DELETE FROM score_instruments;
DELETE FROM scores;
DELETE FROM instruments;
DELETE FROM organization_members;
DELETE FROM organizations;
DELETE FROM users;

INSERT INTO instruments (id, name, family, transposition, is_transposing, range_json, concert_range_json, clef_json, dynamic_range_json, techniques_json, maintenance_tips, historical_info, notable_repertoire_json)
VALUES
('violin', 'Violín', 'strings', 'En Do (no transpone)', 0, '{"lowest_note":"G3","highest_note":"E7"}', '{"lowest_note":"G3","highest_note":"E7"}', '["treble"]', '{"softest":"ppp","loudest":"fff"}', '["vibrato","tremolo","pizzicato","harmonics"]', 'Mantener cuerdas secas y revisar el puente.', 'El violín es uno de los pilares de la orquesta y el cuarteto de cuerdas.', '["Concierto para violín en La menor","Cuatro estaciones"]'),
('violonchelo', 'Violonchelo', 'strings', 'En Do (no transpone)', 0, '{"lowest_note":"C2","highest_note":"A5"}', '{"lowest_note":"C2","highest_note":"A5"}', '["bass","tenor"]', '{"softest":"pp","loudest":"fff"}', '["vibrato","spiccato","arco legato"]', 'Revisar la afinación del puente cada seis meses.', 'El violonchelo aporta la base lírica de la sección de cuerdas.', '["El sueño de una noche de verano"]'),
('flauta', 'Flauta traversa', 'winds', 'En Do (no transpone)', 0, '{"lowest_note":"C4","highest_note":"D7"}', '{"lowest_note":"C4","highest_note":"D7"}', '["treble"]', '{"softest":"pp","loudest":"fff"}', '["staccato","legato","trill"]', 'Lavar la cabeza y revisar la embocadura.', 'La flauta traversa es un instrumento de gran claridad y brillo.', '["Sonata en la menor"]'),
('trompa', 'Trompa (Corno)', 'brass', 'En Fa (suena 5ª justa abajo)', 1, '{"lowest_note":"F2","highest_note":"C6"}', '{"lowest_note":"F2","highest_note":"C6"}', '["treble","bass"]', '{"softest":"pp","loudest":"fff"}', '["muting","lip trills","stopped notes"]', 'Limpiar la boquilla y revisar la válvula.', 'La trompa se usa por su timbre noble y su gran rango dinámico.', '["Sinfonía n.° 6"]'),
('timbales', 'Timbales', 'percussion', 'Afinación determinada', 0, '{"lowest_note":"F2","highest_note":"C4"}', '{"lowest_note":"F2","highest_note":"C4"}', '["bass"]', '{"softest":"pp","loudest":"fff"}', '["roll","pedal changes","accent"]', 'Controlar la humedad de los parches.', 'Los timbales son una pieza central de la percusión orquestal.', '["Concerto para timbales"]'),
('arpa', 'Arpa', 'keyboard', 'En Do (con pedales)', 0, '{"lowest_note":"C2","highest_note":"G7"}', '{"lowest_note":"C2","highest_note":"G7"}', '["treble","bass"]', '{"softest":"pp","loudest":"fff"}', '["glissando","arpeggios","pedal control"]', 'Ajustar afinación y revisar pedales.', 'El arpa combina la resonancia de cuerdas con la expresividad del teclado.', '["Concierto para arpa"]');

INSERT INTO scores (id, title, composer, arranger, owner_id, organization_id, file_url, file_format, file_size, instrument_role, key_signature, time_signature, duration_minutes, difficulty_level, tags_json, is_public)
VALUES
('1', 'Sinfonía n.º 5', 'L. van Beethoven', NULL, NULL, NULL, 'https://example.com/scores/1.pdf', 'pdf', 1200000, 'Orquesta completa', 'C minor', '4/4', 42, 'advanced', '["Classical","Orchestra"]', 1),
('2', 'Danzón n.º 2', 'Arturo Márquez', NULL, NULL, NULL, 'https://example.com/scores/2.pdf', 'pdf', 800000, 'Orquesta completa', 'D major', '3/4', 34, 'intermediate', '["Latin","Orchestra"]', 1),
('3', 'Las cuatro estaciones', 'A. Vivaldi', NULL, NULL, NULL, 'https://example.com/scores/3.musicxml', 'musicxml', 600000, 'Cuerdas', 'A major', '4/4', 28, 'intermediate', '["Classical","Strings"]', 0),
('4', 'El amor brujo', 'M. de Falla', NULL, NULL, NULL, 'https://example.com/scores/4.pdf', 'pdf', 1100000, 'Orquesta completa', 'D minor', '3/4', 37, 'advanced', '["Spanish","Orchestra"]', 1),
('5', 'Clair de Lune', 'C. Debussy', NULL, NULL, NULL, 'https://example.com/scores/5.pdf', 'pdf', 420000, 'Piano solo', 'D♭ major', '6/8', 17, 'beginner', '["Impressionist","Solo"]', 1),
('6', 'Suite Holberg', 'E. Grieg', NULL, NULL, NULL, 'https://example.com/scores/6.pdf', 'pdf', 690000, 'Cuerdas', 'G major', '4/4', 20, 'intermediate', '["Nordic","Strings"]', 0);

INSERT INTO rehearsal_logs (id, title, type, date_text, time_text, venue, attendees_count, notes)
VALUES
('1', 'Ensayo general', 'General', 'Jueves, 31 de julio', '19:00–22:00', 'Auditorio Manuel de Falla', 46, 'Revisar pasajes de Beethoven Mvt 2'),
('2', 'Seccionales de cuerdas', 'Seccional', 'Lunes, 28 de julio', '18:00–20:00', 'Sala de Ensayo B', 18, 'Trabajar afinación de violines II'),
('3', 'Concierto de cámara', 'Concierto', 'Sábado, 02 de agosto', '20:30–22:30', 'Sala Principal', 52, 'Código de vestimenta: Frac / Vestido negro');

INSERT INTO forum_threads (id, title, author, meta, category, likes)
VALUES
('1', 'Recomendaciones para programar música latinoamericana', 'Valentina Ruiz', 'Hace 2 h', 'Repertorio', 15),
('2', '¿Cómo trabajan las dinámicas en seccionales?', 'Martín López', 'Ayer', 'Técnica', 8),
('3', 'Recursos para preparar una audición de violín', 'Elena Torres', 'Hace 2 días', 'Recursos', 24);

INSERT INTO forum_comments (id, thread_id, author, date_text, content)
VALUES
('c1', '1', 'Martín López', 'Hace 1 h', 'Recomiendo incluir piezas de Arturo Márquez y Silvestre Revueltas.'),
('c2', '1', 'Elena Torres', 'Hace 30 min', 'También los arreglos de Piazzolla para cuerdas funcionan excelentemente.'),
('c3', '2', 'Carlos Mendonça', 'Ayer', 'Usamos afinadores con espectrómetro y metrónomo subdividido.');
