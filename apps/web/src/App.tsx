import { useEffect, useState } from 'react';
import { api, ForumThread, InstrumentItem, RehearsalRecord, ScoreItem } from './api';

type View = 'inicio' | 'biblioteca' | 'ensayos' | 'instrumentos' | 'foro';

const nav: Array<{ id: View; icon: string; label: string }> = [
  { id: 'inicio', icon: '⌂', label: 'Inicio' },
  { id: 'biblioteca', icon: '♫', label: 'Biblioteca' },
  { id: 'ensayos', icon: '◷', label: 'Ensayos' },
  { id: 'instrumentos', icon: '◉', label: 'Instrumentos' },
  { id: 'foro', icon: '◌', label: 'Comunidad' },
];

const titles: Record<View, [string, string]> = {
  inicio: ['Buenos días, Valentina', 'Aquí está el pulso de tu agrupación para hoy.'],
  biblioteca: ['Biblioteca de partituras', 'Organiza, encuentra y comparte el repertorio de tu ensamble.'],
  ensayos: ['Gestión de ensayos', 'Planifica cada encuentro y mantén a tu agrupación sincronizada.'],
  instrumentos: ['Enciclopedia de instrumentos', 'Conoce las voces que dan vida a tu ensamble.'],
  foro: ['Foro de la comunidad', 'Comparte conocimiento con músicos y directores.'],
};

const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem('music-folder-user');
  return raw ? JSON.parse(raw) : null;
};

export default function App() {
  const [view, setView] = useState<View>('inicio');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => typeof window !== 'undefined' && Boolean(window.localStorage.getItem('music-folder-user')));
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(() => getStoredUser());
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Data states
  const [scores, setScores] = useState<ScoreItem[]>([]);
  const [instruments, setInstruments] = useState<InstrumentItem[]>([]);
  const [records, setRecords] = useState<RehearsalRecord[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);

  // Filter states
  const [scoreFilter, setScoreFilter] = useState('Todos');
  const [scoreSearch, setScoreSearch] = useState('');
  const [instFilter, setInstFilter] = useState('Todos');
  const [instSearch, setInstSearch] = useState('');
  const [forumFilter, setForumFilter] = useState('Todos los temas');

  // Modal states
  const [showUploadScoreModal, setShowUploadScoreModal] = useState(false);
  const [showNewRecordModal, setShowNewRecordModal] = useState(false);
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);

  // Detail Modal states
  const [selectedScore, setSelectedScore] = useState<ScoreItem | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentItem | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<RehearsalRecord | null>(null);
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);

  // Form inputs
  const [newScore, setNewScore] = useState({ title: '', composer: '', ensemble: 'Orquesta completa', category: 'Orquesta', difficulty: 'Intermedio' });
  const [newRecord, setNewRecord] = useState({ title: '', type: 'General', date: '', time: '19:00–21:00', venue: 'Auditorio Manuel de Falla', notes: '' });
  const [newThread, setNewThread] = useState({ title: '', author: 'Valentina Ruiz', category: 'Repertorio', content: '' });
  const [commentText, setCommentText] = useState('');
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantMessages, setAssistantMessages] = useState([
    { id: 'welcome', role: 'assistant', text: 'Hola, soy tu asistente musical. Puedo ayudarte a revisar repertorio, ensayos o comunidad.' },
  ]);

  // Initial Load
  useEffect(() => {
    api.getScores().then(setScores);
    api.getInstruments().then(setInstruments);
    api.getRecords().then(setRecords);
    api.getThreads().then(setThreads);
  }, []);

  // Actions
  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScore.title) return;
    const added = await api.createScore(newScore as any);
    setScores([added, ...scores]);
    setNewScore({ title: '', composer: '', ensemble: 'Orquesta completa', category: 'Orquesta', difficulty: 'Intermedio' });
    setShowUploadScoreModal(false);
  };

  const handleDeleteScore = async (id: string) => {
    await api.deleteScore(id);
    setScores(scores.filter((s) => s.id !== id));
    setSelectedScore(null);
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.title) return;
    const added = await api.createRecord(newRecord);
    setRecords([added, ...records]);
    setNewRecord({ title: '', type: 'General', date: '', time: '19:00–21:00', venue: 'Auditorio Manuel de Falla', notes: '' });
    setShowNewRecordModal(false);
  };

  const handleAddThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThread.title) return;
    const added = await api.createThread(newThread as any);
    if (newThread.content) {
      await api.addComment(added.id, newThread.author, newThread.content);
    }
    const updatedThreads = await api.getThreads();
    setThreads(updatedThreads);
    setNewThread({ title: '', author: 'Valentina Ruiz', category: 'Repertorio', content: '' });
    setShowNewThreadModal(false);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !commentText.trim()) return;
    const updated = await api.addComment(selectedThread.id, 'Valentina Ruiz', commentText);
    if (updated) {
      setSelectedThread(updated);
      setThreads(threads.map((t) => (t.id === updated.id ? updated : t)));
    }
    setCommentText('');
  };

  const handleLikeThread = async (id: string) => {
    const updated = await api.likeThread(id);
    if (updated) {
      if (selectedThread?.id === id) setSelectedThread(updated);
      setThreads(threads.map((t) => (t.id === id ? updated : t)));
    }
  };

  const getAssistantReply = (input: string) => {
    const normalized = input.toLowerCase();

    if (normalized.includes('ensayo') || normalized.includes('agenda')) {
      return 'Puedo ayudarte a revisar los ensayos agendados. En la sección Ensayos podés ver fechas, horarios y lugar.';
    }

    if (normalized.includes('partitura') || normalized.includes('biblioteca') || normalized.includes('repertorio')) {
      return 'La biblioteca centraliza las partituras activas del ensamble. Si querés, podés explorar la sección Biblioteca y filtrar por categoría.';
    }

    if (normalized.includes('foro') || normalized.includes('comunidad') || normalized.includes('publicación')) {
      return 'El foro sirve para compartir recursos, dudas y recomendaciones entre la comunidad musical. Podés abrir la sección Comunidad desde el menú.';
    }

    if (normalized.includes('instrumento') || normalized.includes('cuerda') || normalized.includes('viento')) {
      return 'La sección Instrumentos te ayuda a consultar familias e información útil de cada instrumento del ensamble.';
    }

    return 'Puedo orientarte sobre repertorio, ensayos, foro e instrumentos. Decime qué parte de la app querés revisar.';
  };

  const handleAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantInput.trim()) return;

    const userQuestion = assistantInput.trim();
    const nextMessages = [
      ...assistantMessages,
      { id: String(Date.now()), role: 'user', text: userQuestion },
      { id: String(Date.now() + 1), role: 'assistant', text: getAssistantReply(userQuestion) },
    ];

    setAssistantMessages(nextMessages);
    setAssistantInput('');
  };

  // Filtered lists
  const filteredScores = scores.filter((s) => {
    const matchCat =
      scoreFilter === 'Todos'
        ? true
        : scoreFilter === 'Favoritos'
        ? s.isFavorite
        : s.category === scoreFilter || s.ensemble?.includes(scoreFilter);
    const matchSearch =
      s.title.toLowerCase().includes(scoreSearch.toLowerCase()) ||
      s.composer.toLowerCase().includes(scoreSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredInstruments = instruments.filter((i) => {
    const matchCat = instFilter === 'Todos' ? true : i.family.includes(instFilter);
    const matchSearch = i.name.toLowerCase().includes(instSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredThreads = threads.filter((t) => {
    if (forumFilter === 'Todos los temas') return true;
    return t.category === forumFilter;
  });

  const [heading, subheading] = titles[view];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setLoginError('Ingresá tu email y contraseña para entrar.');
      return;
    }

    const name = loginForm.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    const user = { name: name || 'Músico', email: loginForm.email.trim() };

    window.localStorage.setItem('music-folder-user', JSON.stringify(user));
    setCurrentUser(user);
    setIsLoggedIn(true);
    setLoginError('');
  };

  const handleLogout = () => {
    window.localStorage.removeItem('music-folder-user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginForm({ email: '', password: '' });
  };

  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <div className="login-layout">
          <div className="login-visual">
            <div className="stitch-pill">Stitch • Studio</div>
            <div className="login-visual-title">Tu centro de repertorio, ensayos y comunidad.</div>
            <div className="login-visual-copy">
              Organiza partituras, coordina fuentes sonoras, arma ensayos y comparte el pulso de tu ensamble desde una sola vista.
            </div>
            <div className="login-feature-grid">
              <div className="feature-card">
                <strong>Biblioteca</strong>
                <span>Partituras y repertorio</span>
              </div>
              <div className="feature-card">
                <strong>Ensayos</strong>
                <span>Agenda y seguimiento</span>
              </div>
              <div className="feature-card">
                <strong>Foro</strong>
                <span>Comunidad musical activa</span>
              </div>
            </div>
          </div>

          <div className="login-card">
            <div className="login-brand">𝄞 Music Folder</div>
            <h1>Iniciar sesión</h1>
            <p>Accedé con tu cuenta para continuar en la biblioteca, ensayos y comunidad.</p>
            <form className="login-form" onSubmit={handleLogin}>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="usuario@musicfolder.dev"
                />
              </label>
              <label>
                <span>Contraseña</span>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                />
              </label>
              {loginError && <small className="login-error">{loginError}</small>}
              <button type="submit" className="primary login-submit">Entrar</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={menuOpen ? 'sidebar open' : 'sidebar'}>
        <div className="brand">
          <span>𝄞</span>
          <strong>Music Folder</strong>
        </div>
        <nav>
          {nav.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? 'active' : ''}
              onClick={() => {
                setView(item.id);
                setMenuOpen(false);
              }}
            >
              <i>{item.icon}</i>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="avatar">{currentUser?.name?.charAt(0)?.toUpperCase() || 'V'}</div>
          <div>
            <b>{currentUser?.name || 'Valentina Ruiz'}</b>
            <small>{currentUser?.email || 'Directora'}</small>
          </div>
          <button className="logout-link" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </aside>

      {/* Main Container */}
      <main>
        <header>
          <button className="menu" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>
          <div className="crumb">
            Music Folder <span>/</span> {nav.find((x) => x.id === view)?.label}
          </div>
          <div className="header-actions">
            <button title="Búsqueda rápida">⌕</button>
            <button title="Notificaciones">♧</button>
            <div className="avatar">{currentUser?.name?.charAt(0)?.toUpperCase() || 'V'}</div>
            <button className="btn-secondary" onClick={handleLogout}>Salir</button>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <h1>{heading}</h1>
              <p>{subheading}</p>
            </div>
            {view === 'biblioteca' && (
              <button className="primary" onClick={() => setShowUploadScoreModal(true)}>
                + Subir partitura
              </button>
            )}
            {view === 'ensayos' && (
              <button className="primary" onClick={() => setShowNewRecordModal(true)}>
                + Nuevo ensayo
              </button>
            )}
            {view === 'foro' && (
              <button className="primary" onClick={() => setShowNewThreadModal(true)}>
                + Crear publicación
              </button>
            )}
          </div>

          {/* VISTA: INICIO */}
          {view === 'inicio' && (
            <>
              <section className="hero">
                <div>
                  <p className="eyebrow">ORQUESTA DE CÁMARA</p>
                  <h2>Tu música, siempre en orden.</h2>
                  <p>Centraliza partituras, ensayos y conversaciones en un mismo lugar.</p>
                  <button className="primary" onClick={() => setView('biblioteca')}>
                    Explorar biblioteca
                  </button>
                </div>
                <div className="hero-note">𝄞</div>
              </section>

              <section className="metrics">
                <article style={{ cursor: 'pointer' }} onClick={() => setView('biblioteca')}>
                  <b>{scores.length}</b>
                  <span>Partituras activas</span>
                </article>
                <article style={{ cursor: 'pointer' }} onClick={() => setView('ensayos')}>
                  <b>{records.length}</b>
                  <span>Ensayos agendados</span>
                </article>
                <article style={{ cursor: 'pointer' }} onClick={() => setView('foro')}>
                  <b>{threads.length}</b>
                  <span>Publicaciones en Comunidad</span>
                </article>
              </section>

              <section className="two-col">
                <article className="panel">
                  <div className="panel-title">
                    <h2>Próximos ensayos</h2>
                    <button onClick={() => setView('ensayos')}>Ver calendario →</button>
                  </div>
                  {records.map((r) => (
                    <div className="agenda" key={r.id} onClick={() => setSelectedRecord(r)} style={{ cursor: 'pointer' }}>
                      <b>
                        {r.date.split(',')[1]?.trim() || r.date}
                      </b>
                      <span>
                        <strong>{r.title}</strong>
                        <br />
                        {r.time} · {r.venue}
                      </span>
                    </div>
                  ))}
                </article>

                <article className="panel">
                  <div className="panel-title">
                    <h2>Actividad reciente</h2>
                    <button onClick={() => setView('foro')}>Ver foro →</button>
                  </div>
                  <p className="activity">✦ Valentina subió <b>Sinfonía n.º 5</b></p>
                  <p className="activity">✦ Se agendó el <b>Ensayo General</b></p>
                  <p className="activity">✦ Hay {threads.reduce((acc, t) => acc + (t.comments?.length || 0), 0)} respuestas en la Comunidad</p>
                </article>
              </section>
            </>
          )}

          <button className="assistant-fab" onClick={() => setAssistantOpen((prev) => !prev)}>
            ✦ Asistente
          </button>

          {assistantOpen && (
            <div className="assistant-panel">
              <div className="assistant-header">
                <div className="assistant-title-wrap">
                  <div className="assistant-avatar">✦</div>
                  <div>
                    <strong>Asistente virtual</strong>
                    <small>Online ahora</small>
                  </div>
                </div>
                <button className="close-btn" onClick={() => setAssistantOpen(false)} aria-label="Cerrar asistente">×</button>
              </div>
              <div className="assistant-messages">
                {assistantMessages.map((message) => (
                  <div key={message.id} className={`assistant-message ${message.role}`}>
                    {message.text}
                  </div>
                ))}
              </div>
              <form className="assistant-form" onSubmit={handleAssistantSubmit}>
                <input
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  placeholder="Preguntá por ensayos, repertorio o comunidad..."
                />
                <button type="submit" className="primary">Enviar</button>
              </form>
            </div>
          )}

          {/* VISTA: BIBLIOTECA */}
          {view === 'biblioteca' && (
            <>
              <div className="filters">
                {['Todos', 'Orquesta', 'Cámara', 'Favoritos'].map((cat) => (
                  <button
                    key={cat}
                    className={scoreFilter === cat ? 'selected' : ''}
                    onClick={() => setScoreFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
                <input
                  aria-label="Buscar partituras"
                  placeholder="Buscar por obra o compositor..."
                  value={scoreSearch}
                  onChange={(e) => setScoreSearch(e.target.value)}
                />
              </div>

              <section className="score-grid">
                {filteredScores.map((score, i) => (
                  <article
                    className="score-card"
                    key={score.id}
                    onClick={() => setSelectedScore(score)}
                  >
                    <div className={`cover cover-${i % 6}`}>𝄞</div>
                    <div>
                      <h3>{score.title}</h3>
                      <p>{score.composer}</p>
                      <span>{score.ensemble}</span>
                    </div>
                    <button className="more" title="Ver detalles">•••</button>
                  </article>
                ))}
                {filteredScores.length === 0 && (
                  <p style={{ gridColumn: '1 / -1', color: '#6b6c76', textAlign: 'center', padding: '40px' }}>
                    No se encontraron partituras con los filtros seleccionados.
                  </p>
                )}
              </section>
            </>
          )}

          {/* VISTA: ENSAYOS */}
          {view === 'ensayos' && (
            <>
              {records.length > 0 && (
                <section className="schedule">
                  <div>
                    <p className="eyebrow">PRÓXIMO ENSAYO</p>
                    <h2>{records[0].title}</h2>
                    <p>{records[0].date} · {records[0].time}</p>
                    <p>{records[0].venue}</p>
                  </div>
                  <button className="primary" onClick={() => setSelectedRecord(records[0])}>
                    Ver detalles
                  </button>
                </section>
              )}

              <section className="two-col">
                <article className="panel">
                  <h2>Agenda de Ensayos</h2>
                  {records.map((r) => (
                    <div
                      className="agenda"
                      key={r.id}
                      onClick={() => setSelectedRecord(r)}
                      style={{ cursor: 'pointer' }}
                    >
                      <b>{r.date.split(' ')[1] || r.date}</b>
                      <span>
                        <strong>{r.title}</strong> ({r.type})
                        <br />
                        {r.time} · {r.venue}
                      </span>
                    </div>
                  ))}
                </article>

                <article className="panel">
                  <h2>Asistencia y Registro</h2>
                  <div className="attendance">
                    <b>92%</b>
                    <span>
                      Promedio del mes
                      <br />
                      46 músicos confirmados
                    </span>
                  </div>
                </article>
              </section>
            </>
          )}

          {/* VISTA: INSTRUMENTOS */}
          {view === 'instrumentos' && (
            <>
              <div className="filters">
                {['Todos', 'Cuerdas', 'Viento madera', 'Viento metal', 'Percusión'].map((cat) => (
                  <button
                    key={cat}
                    className={instFilter === cat ? 'selected' : ''}
                    onClick={() => setInstFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
                <input
                  aria-label="Buscar instrumentos"
                  placeholder="Buscar un instrumento..."
                  value={instSearch}
                  onChange={(e) => setInstSearch(e.target.value)}
                />
              </div>

              <section className="instrument-grid">
                {filteredInstruments.map((inst) => (
                  <article
                    className="instrument"
                    key={inst.id}
                    onClick={() => setSelectedInstrument(inst)}
                  >
                    <div>{inst.icon || '♩'}</div>
                    <p className="eyebrow">{inst.family}</p>
                    <h2>{inst.name}</h2>
                    <a
                      href="#detalle"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedInstrument(inst);
                      }}
                    >
                      Explorar ficha →
                    </a>
                  </article>
                ))}
              </section>
            </>
          )}

          {/* VISTA: COMUNIDAD / FORO */}
          {view === 'foro' && (
            <>
              <div className="forum-head">
                <div className="filters">
                  {['Todos los temas', 'Repertorio', 'Técnica', 'Recursos', 'Gestión'].map((cat) => (
                    <button
                      key={cat}
                      className={forumFilter === cat ? 'selected' : ''}
                      onClick={() => setForumFilter(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <section className="forum-list">
                {filteredThreads.map((thread) => (
                  <article
                    className="post"
                    key={thread.id}
                    onClick={() => setSelectedThread(thread)}
                  >
                    <div className="avatar">{thread.author ? thread.author[0] : 'M'}</div>
                    <div style={{ flex: 1 }}>
                      <h2>{thread.title}</h2>
                      <p>
                        Por {thread.author} · {thread.meta} · {thread.comments?.length || 0} respuestas
                      </p>
                      <span>{thread.category}</span>
                    </div>
                    <button
                      className="like-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikeThread(thread.id);
                      }}
                    >
                      ♥ {thread.likes || 0}
                    </button>
                  </article>
                ))}
              </section>
            </>
          )}
        </div>
      </main>

      {/* MODAL: SUBIR PARTITURA */}
      {showUploadScoreModal && (
        <div className="modal-overlay" onClick={() => setShowUploadScoreModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>+ Agregar Nueva Partitura</h2>
              <button className="close-btn" onClick={() => setShowUploadScoreModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleAddScore}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Título de la Obra</label>
                  <input
                    required
                    placeholder="Ej. Sinfonía n.º 9 en Re menor"
                    value={newScore.title}
                    onChange={(e) => setNewScore({ ...newScore, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Compositor</label>
                  <input
                    required
                    placeholder="Ej. Ludwig van Beethoven"
                    value={newScore.composer}
                    onChange={(e) => setNewScore({ ...newScore, composer: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Agrupación / Ensamble</label>
                    <input
                      placeholder="Ej. Orquesta completa"
                      value={newScore.ensemble}
                      onChange={(e) => setNewScore({ ...newScore, ensemble: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Categoría</label>
                    <select
                      value={newScore.category}
                      onChange={(e) => setNewScore({ ...newScore, category: e.target.value as any })}
                    >
                      <option value="Orquesta">Orquesta</option>
                      <option value="Cámara">Cámara</option>
                      <option value="Solista">Solista</option>
                      <option value="Coro">Coro</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowUploadScoreModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary">
                  Guardar Partitura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO ENSAYO */}
      {showNewRecordModal && (
        <div className="modal-overlay" onClick={() => setShowNewRecordModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>+ Planificar Nuevo Ensayo</h2>
              <button className="close-btn" onClick={() => setShowNewRecordModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleAddRecord}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Título del Ensayo</label>
                  <input
                    required
                    placeholder="Ej. Ensayo de tutti / Seccional"
                    value={newRecord.title}
                    onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha</label>
                    <input
                      required
                      placeholder="Ej. Jueves, 05 de agosto"
                      value={newRecord.date}
                      onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Horario</label>
                    <input
                      placeholder="Ej. 19:00 - 21:30"
                      value={newRecord.time}
                      onChange={(e) => setNewRecord({ ...newRecord, time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Lugar / Sala</label>
                  <input
                    placeholder="Ej. Auditorio Manuel de Falla"
                    value={newRecord.venue}
                    onChange={(e) => setNewRecord({ ...newRecord, venue: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Notas de repertorio o indicación</label>
                  <textarea
                    rows={3}
                    placeholder="Pasajes a revisar, accesorios necesarios..."
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowNewRecordModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary">
                  Agendar Ensayo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA PUBLICACIÓN EN FORO */}
      {showNewThreadModal && (
        <div className="modal-overlay" onClick={() => setShowNewThreadModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>+ Crear Publicación en Comunidad</h2>
              <button className="close-btn" onClick={() => setShowNewThreadModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleAddThread}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Título del Tema</label>
                  <input
                    required
                    placeholder="Ej. Recomendaciones sobre arcos en Bach..."
                    value={newThread.title}
                    onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    value={newThread.category}
                    onChange={(e) => setNewThread({ ...newThread, category: e.target.value as any })}
                  >
                    <option value="Repertorio">Repertorio</option>
                    <option value="Técnica">Técnica</option>
                    <option value="Recursos">Recursos</option>
                    <option value="Gestión">Gestión</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Mensaje o pregunta inicial</label>
                  <textarea
                    rows={4}
                    placeholder="Escribe tu consulta para la comunidad de músicos..."
                    value={newThread.content}
                    onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowNewThreadModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary">
                  Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLE: PARTITURA */}
      {selectedScore && (
        <div className="modal-overlay" onClick={() => setSelectedScore(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedScore.title}</h2>
              <button className="close-btn" onClick={() => setSelectedScore(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p><strong>Compositor:</strong> {selectedScore.composer}</p>
              <p><strong>Ensamble:</strong> {selectedScore.ensemble}</p>
              <p><strong>Categoría:</strong> {selectedScore.category}</p>
              {selectedScore.difficulty && <p><strong>Dificultad:</strong> {selectedScore.difficulty}</p>}
              {selectedScore.owner && <p><strong>Biblioteca:</strong> {selectedScore.owner}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn-danger" onClick={() => handleDeleteScore(selectedScore.id)}>
                Eliminar
              </button>
              <button className="primary" onClick={() => alert(`Descargando partitura de ${selectedScore.title}...`)}>
                Descargar PDF ⬇
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE: INSTRUMENTO */}
      {selectedInstrument && (
        <div className="modal-overlay" onClick={() => setSelectedInstrument(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedInstrument.icon} {selectedInstrument.name}</h2>
              <button className="close-btn" onClick={() => setSelectedInstrument(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p><strong>Familia:</strong> {selectedInstrument.family}</p>
              {selectedInstrument.clef && <p><strong>Clave habitual:</strong> {selectedInstrument.clef}</p>}
              {selectedInstrument.transposition && <p><strong>Transposición:</strong> {selectedInstrument.transposition}</p>}
              {selectedInstrument.description && (
                <div style={{ background: '#f4f5fd', padding: '12px', borderRadius: '8px', marginTop: '10px' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#454652' }}>{selectedInstrument.description}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedInstrument(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE: ENSAYO */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedRecord.title}</h2>
              <button className="close-btn" onClick={() => setSelectedRecord(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p><strong>Fecha:</strong> {selectedRecord.date}</p>
              <p><strong>Horario:</strong> {selectedRecord.time}</p>
              <p><strong>Lugar:</strong> {selectedRecord.venue}</p>
              {selectedRecord.notes && (
                <div style={{ background: '#fff8e7', borderLeft: '4px solid #d4af37', padding: '12px', borderRadius: '4px', marginTop: '10px' }}>
                  <strong>Indicaciones:</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#454652' }}>{selectedRecord.notes}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedRecord(null)}>
                Cerrar
              </button>
              <button className="primary" onClick={() => alert('Asistencia confirmada para este ensayo')}>
                Confirmar mi Asistencia ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE: HILO DE FORO CON COMENTARIOS */}
      {selectedThread && (
        <div className="modal-overlay" onClick={() => setSelectedThread(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedThread.title}</h2>
              <button className="close-btn" onClick={() => setSelectedThread(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <small style={{ color: '#6b6c76' }}>
                  Por <strong>{selectedThread.author}</strong> · {selectedThread.meta}
                </small>
                <button className="like-btn" onClick={() => handleLikeThread(selectedThread.id)}>
                  ♥ {selectedThread.likes} Me gusta
                </button>
              </div>

              <hr style={{ border: 0, borderTop: '1px solid #edeeef', margin: '10px 0' }} />

              <h4 style={{ margin: '0 0 10px', color: '#1a237e' }}>Respuestas ({selectedThread.comments?.length || 0})</h4>

              {selectedThread.comments && selectedThread.comments.length > 0 ? (
                selectedThread.comments.map((c) => (
                  <div className="comment-box" key={c.id}>
                    <b>{c.author} <small style={{ color: '#888', fontWeight: 400 }}>· {c.date}</small></b>
                    <p>{c.content}</p>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '13px', color: '#888' }}>Aún no hay respuestas. Sé el primero en responder.</p>
              )}

              <form onSubmit={handleAddComment} style={{ marginTop: '16px' }}>
                <div className="form-group">
                  <label>Escribir una respuesta</label>
                  <textarea
                    rows={3}
                    placeholder="Comparte tu opinión o sugerencia..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                </div>
                <button type="submit" className="primary" style={{ marginTop: '10px', width: '100%' }}>
                  Enviar Respuesta
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
