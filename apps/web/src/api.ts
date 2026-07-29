export interface ScoreItem {
  id: string;
  title: string;
  composer: string;
  ensemble: string;
  category: 'Orquesta' | 'Cámara' | 'Solista' | 'Coro';
  difficulty?: string;
  isFavorite?: boolean;
  type?: string;
  owner?: string;
}

export interface InstrumentItem {
  id: string;
  name: string;
  family: 'Cuerdas' | 'Viento madera' | 'Viento metal' | 'Percusión' | 'Teclado';
  icon: string;
  clef?: string;
  transposition?: string;
  description?: string;
}

export interface RehearsalRecord {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  venue: string;
  attendeesCount?: number;
  notes?: string;
}

export interface ForumComment {
  id: string;
  author: string;
  date: string;
  content: string;
}

export interface ForumThread {
  id: string;
  title: string;
  author: string;
  meta: string;
  category: 'Repertorio' | 'Técnica' | 'Recursos' | 'Gestión';
  likes: number;
  comments: ForumComment[];
}

const API_BASE = 'http://localhost:3001/api/v1';

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
      ...options,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

// Fallback initial states if API server is not running
const fallbackScores: ScoreItem[] = [
  { id: '1', title: 'Sinfonía n.º 5', composer: 'L. van Beethoven', ensemble: 'Orquesta completa', category: 'Orquesta', difficulty: 'Avanzado', isFavorite: true },
  { id: '2', title: 'Danzón n.º 2', composer: 'Arturo Márquez', ensemble: 'Orquesta completa', category: 'Orquesta', difficulty: 'Intermedio', isFavorite: true },
  { id: '3', title: 'Las cuatro estaciones', composer: 'A. Vivaldi', ensemble: 'Cuerdas', category: 'Cámara', difficulty: 'Intermedio', isFavorite: false },
  { id: '4', title: 'El amor brujo', composer: 'M. de Falla', ensemble: 'Orquesta completa', category: 'Orquesta', difficulty: 'Avanzado', isFavorite: false },
  { id: '5', title: 'Clair de Lune', composer: 'C. Debussy', ensemble: 'Piano solo', category: 'Solista', difficulty: 'Fácil', isFavorite: true },
  { id: '6', title: 'Suite Holberg', composer: 'E. Grieg', ensemble: 'Cuerdas', category: 'Cámara', difficulty: 'Intermedio', isFavorite: false },
];

const fallbackInstruments: InstrumentItem[] = [
  { id: 'violin', name: 'Violín', family: 'Cuerdas', icon: '♩', clef: 'Sol (G)', transposition: 'En Do (no transpone)', description: 'Instrumento de cuerda frotada agudo, voz principal de la sección de cuerdas.' },
  { id: 'violonchelo', name: 'Violonchelo', family: 'Cuerdas', icon: '♭', clef: 'Fa (F) / Tenor', transposition: 'En Do (no transpone)', description: 'Instrumento de cuerda frotada grave de cálido timbre lírico.' },
  { id: 'flauta', name: 'Flauta traversa', family: 'Viento madera', icon: '♬', clef: 'Sol (G)', transposition: 'En Do (no transpone)', description: 'Instrumento de viento madera metálico con sonido brillante y agudo.' },
  { id: 'trompa', name: 'Trompa (Corno)', family: 'Viento metal', icon: '♮', clef: 'Sol / Fa', transposition: 'En Fa (suena 5ª justa abajo)', description: 'Instrumento de viento metal con timbre noble y gran rango dinámico.' },
  { id: 'timbales', name: 'Timbales', family: 'Percusión', icon: '◒', clef: 'Fa (F)', transposition: 'Afinación determinada', description: 'Set de tambores afinables por pedal, columna rítmica y armónica.' },
  { id: 'arpa', name: 'Arpa', family: 'Cuerdas', icon: '', clef: 'Sol / Fa', transposition: 'En Do (con pedales)', description: 'Instrumento de 47 cuerdas pulsadas y 7 pedales de afinación.' },
];

const fallbackRecords: RehearsalRecord[] = [
  { id: '1', title: 'Ensayo general', type: 'General', date: 'Jueves, 31 de julio', time: '19:00–22:00', venue: 'Auditorio Manuel de Falla', attendeesCount: 46, notes: 'Revisar pasajes de Beethoven Mvt 2' },
  { id: '2', title: 'Seccionales de cuerdas', type: 'Seccional', date: 'Lunes, 28 de julio', time: '18:00–20:00', venue: 'Sala de Ensayo B', attendeesCount: 18, notes: 'Trabajar afinación de violines II' },
  { id: '3', title: 'Concierto de cámara', type: 'Concierto', date: 'Sábado, 02 de agosto', time: '20:30–22:30', venue: 'Sala Principal', attendeesCount: 52, notes: 'Código de vestimenta: Frac / Vestido negro' },
];

const fallbackThreads: ForumThread[] = [
  {
    id: '1',
    title: 'Recomendaciones para programar música latinoamericana',
    author: 'Valentina Ruiz',
    meta: 'Hace 2 h',
    category: 'Repertorio',
    likes: 15,
    comments: [
      { id: 'c1', author: 'Martín López', date: 'Hace 1 h', content: 'Recomiendo incluir piezas de Arturo Márquez y Silvestre Revueltas.' },
      { id: 'c2', author: 'Elena Torres', date: 'Hace 30 min', content: 'También los arreglos de Piazzolla para cuerdas funcionan excelentemente.' },
    ],
  },
  {
    id: '2',
    title: '¿Cómo trabajan las dinámicas en seccionales?',
    author: 'Martín López',
    meta: 'Ayer',
    category: 'Técnica',
    likes: 8,
    comments: [
      { id: 'c3', author: 'Carlos Mendonça', date: 'Ayer', content: 'Usamos afinadores con espectrómetro y metrónomo subdividido.' },
    ],
  },
  {
    id: '3',
    title: 'Recursos para preparar una audición de violín',
    author: 'Elena Torres',
    meta: 'Hace 2 días',
    category: 'Recursos',
    likes: 24,
    comments: [],
  },
];

export const api = {
  async getScores(): Promise<ScoreItem[]> {
    const data = await fetchJSON<ScoreItem[]>('/sheets');
    return data || fallbackScores;
  },
  async createScore(payload: Partial<ScoreItem>): Promise<ScoreItem> {
    const data = await fetchJSON<ScoreItem>('/sheets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data || {
      id: String(Date.now()),
      title: payload.title || 'Nueva obra',
      composer: payload.composer || 'Anónimo',
      ensemble: payload.ensemble || 'Orquesta completa',
      category: (payload.category as any) || 'Orquesta',
      difficulty: payload.difficulty || 'Intermedio',
      isFavorite: false,
    };
  },
  async deleteScore(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/sheets/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  async getInstruments(): Promise<InstrumentItem[]> {
    const data = await fetchJSON<InstrumentItem[]>('/instruments');
    return data || fallbackInstruments;
  },

  async getRecords(): Promise<RehearsalRecord[]> {
    const data = await fetchJSON<RehearsalRecord[]>('/records');
    return data || fallbackRecords;
  },
  async createRecord(payload: Partial<RehearsalRecord>): Promise<RehearsalRecord> {
    const data = await fetchJSON<RehearsalRecord>('/records', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data || {
      id: String(Date.now()),
      title: payload.title || 'Nuevo ensayo',
      type: payload.type || 'General',
      date: payload.date || 'Próxima fecha',
      time: payload.time || '19:00 - 21:00',
      venue: payload.venue || 'Sala Principal',
      attendeesCount: 0,
      notes: payload.notes || '',
    };
  },

  async getThreads(): Promise<ForumThread[]> {
    const data = await fetchJSON<ForumThread[]>('/forums/threads');
    return data || fallbackThreads;
  },
  async createThread(payload: Partial<ForumThread>): Promise<ForumThread> {
    const data = await fetchJSON<ForumThread>('/forums/threads', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data || {
      id: String(Date.now()),
      title: payload.title || 'Nueva publicación',
      author: payload.author || 'Músico',
      meta: 'Hace un momento',
      category: (payload.category as any) || 'Repertorio',
      likes: 0,
      comments: [],
    };
  },
  async addComment(threadId: string, author: string, content: string): Promise<ForumThread | null> {
    return await fetchJSON<ForumThread>(`/forums/threads/${threadId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ author, content }),
    });
  },
  async likeThread(threadId: string): Promise<ForumThread | null> {
    return await fetchJSON<ForumThread>(`/forums/threads/${threadId}/like`, {
      method: 'POST',
    });
  },
};
