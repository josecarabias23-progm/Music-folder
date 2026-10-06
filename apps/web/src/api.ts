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

export interface NotificationItem {
  id: string;
  type: 'rehearsal_scheduled' | 'sheet_uploaded' | 'attendance_marked' | 'student_joined';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetId?: string;
  metadata?: {
    author?: string;
    venue?: string;
    date?: string;
    ensemble?: string;
    status?: 'presente' | 'ausente' | 'justificado';
  };
}

export interface GroupItem {
  id: string;
  name: string;
  description?: string | null;
  type?: string;
  visibility?: string;
  join_code?: string;
  is_join_code_active?: boolean;
  owner?: { id?: string; name?: string; email?: string };
}

export interface GroupMember {
  id: string;
  role?: string;
  status?: string;
  user?: { id?: string; name?: string; email?: string };
  group?: GroupItem;
}

export interface GroupLibraryItem {
  id: string;
  title: string;
  description?: string | null;
  type?: string;
  file_url?: string | null;
  uploaded_by?: { id?: string; name?: string; email?: string } | null;
}

export interface GroupRehearsalItem {
  id: string;
  title: string;
  date?: string | null;
  time?: string | null;
  location?: string | null;
  agenda?: string | null;
  notes?: string | null;
  created_by?: { id?: string; name?: string; email?: string } | null;
}

export interface GroupCommunityPost {
  id: string;
  title: string;
  content: string;
  visibility?: string;
  author?: { id?: string; name?: string; email?: string } | null;
}

const API_BASE = ((import.meta as any).env?.VITE_API_URL || 'https://music-folder-api.onrender.com');
const STORAGE_KEY = 'music-folder-session';

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed) return null;
    return parsed.token || (parsed.user && parsed.user.token) || null;
  } catch {
    return null;
  }
}

// Cache en memoria con TTL y deduplicación de llamadas simultáneas (in-flight request sharing)
interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

const responseCache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();
const DEFAULT_TTL_MS = 30_000; // 30 segundos de caché para peticiones GET

export function clearApiCache(pattern?: string | RegExp) {
  if (!pattern) {
    responseCache.clear();
    return;
  }
  for (const key of responseCache.keys()) {
    if (typeof pattern === 'string' ? key.includes(pattern) : pattern.test(key)) {
      responseCache.delete(key);
    }
  }
}

async function fetchJSON<T>(endpoint: string, options?: RequestInit, ttlMs: number = DEFAULT_TTL_MS): Promise<T | null> {
  const method = (options?.method || 'GET').toUpperCase();
  const isGet = method === 'GET';
  const cacheKey = `${method}:${endpoint}`;

  // Para peticiones de mutación (POST, PUT, PATCH, DELETE), invalidar únicamente la caché del dominio afectado
  if (!isGet) {
    const domain = endpoint.split('/')[1];
    if (domain) {
      clearApiCache(domain);
    } else {
      clearApiCache();
    }
  }

  // 1. Verificar si hay un resultado válido en caché (solo para GET)
  if (isGet && ttlMs > 0) {
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < ttlMs) {
      return cached.data as T;
    }
  }

  // 2. Verificar si hay una petición idéntica en vuelo (In-Flight Request Deduplication)
  if (isGet && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey) as Promise<T | null>;
  }

  // 3. Ejecutar petición HTTP registrando y compartiendo la promesa de forma síncrona de inmediato
  const requestPromise = (async (): Promise<T | null> => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options?.headers as Record<string, string> || {}),
      };

      const token = getAuthToken();
      if (token && !headers['Authorization'] && !headers['authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (!res.ok) return null;
      const data = await res.json();

      if (isGet && ttlMs > 0 && data !== null) {
        responseCache.set(cacheKey, { timestamp: Date.now(), data });
      }

      return data as T;
    } catch (err: any) {
      if (err?.name === 'AbortError' && isGet) {
        const cached = responseCache.get(cacheKey);
        if (cached) {
          return cached.data as T;
        }
      }
      return null;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  if (isGet) {
    inFlightRequests.set(cacheKey, requestPromise);
  }

  return requestPromise;
}

// Fallback initial states if API server is not running
const fallbackScores: (ScoreItem & { groupId?: string })[] = [
  { id: '1', groupId: 'group-1', title: 'Sinfonía N.º 5 en Do menor, Op. 67', composer: 'Ludwig van Beethoven', ensemble: 'Orquesta Sinfónica Juvenil', category: 'Orquesta', difficulty: 'Avanzado', isFavorite: true, owner: 'Orquesta Sinfónica Juvenil' },
  { id: '3', groupId: 'group-1', title: 'El lago de los cisnes, Op. 20 (Suite)', composer: 'Piotr Ilich Tchaikovsky', ensemble: 'Orquesta Sinfónica Juvenil', category: 'Orquesta', difficulty: 'Avanzado', isFavorite: true, owner: 'Orquesta Sinfónica Juvenil' },
  { id: '4', groupId: 'group-1', title: 'Danzón N.º 2', composer: 'Arturo Márquez', ensemble: 'Orquesta Sinfónica Juvenil', category: 'Orquesta', difficulty: 'Intermedio', isFavorite: true, owner: 'Orquesta Sinfónica Juvenil' },
  { id: '5', groupId: 'group-2', title: 'Las cuatro estaciones - Primavera, Op. 8 N.º 1', composer: 'Antonio Vivaldi', ensemble: 'Ensamble de Cámara Barroco', category: 'Cámara', difficulty: 'Intermedio', isFavorite: true, owner: 'Ensamble Barroco' },
  { id: '6', groupId: 'group-2', title: 'Suite Holberg, Op. 40', composer: 'Edvard Grieg', ensemble: 'Ensamble de Cámara Barroco', category: 'Cámara', difficulty: 'Intermedio', isFavorite: false, owner: 'Ensamble Barroco' },
  { id: '2', groupId: 'group-2', title: "Serenata N.º 6 'Serenata Notturna', K. 239", composer: 'Wolfgang Amadeus Mozart', ensemble: 'Ensamble de Cámara Barroco', category: 'Cámara', difficulty: 'Intermedio', isFavorite: true, owner: 'Ensamble Barroco' },
];

const fallbackInstruments: InstrumentItem[] = [
  { id: 'violin', name: 'Violín', family: 'Cuerdas', icon: '♩', clef: 'Sol (G)', transposition: 'En Do (no transpone)', description: 'Instrumento de cuerda frotada agudo, voz principal de la sección de cuerdas.' },
  { id: 'violonchelo', name: 'Violonchelo', family: 'Cuerdas', icon: '♭', clef: 'Fa (F) / Tenor', transposition: 'En Do (no transpone)', description: 'Instrumento de cuerda frotada grave de cálido timbre lírico.' },
  { id: 'flauta', name: 'Flauta traversa', family: 'Viento madera', icon: '♬', clef: 'Sol (G)', transposition: 'En Do (no transpone)', description: 'Instrumento de viento madera metálico con sonido brillante y agudo.' },
  { id: 'trompa', name: 'Trompa (Corno en Fa)', family: 'Viento metal', icon: '♮', clef: 'Sol / Fa', transposition: 'En Fa (suena 5ª justa abajo)', description: 'Instrumento de viento metal con timbre noble y gran rango dinámico.' },
  { id: 'timbales', name: 'Timbales', family: 'Percusión', icon: '◒', clef: 'Fa (F)', transposition: 'Afinación determinada', description: 'Set de tambores afinables por pedal, columna rítmica y armónica.' },
  { id: 'arpa', name: 'Arpa', family: 'Cuerdas', icon: '✦', clef: 'Sol / Fa', transposition: 'En Do (con pedales)', description: 'Instrumento de 47 cuerdas pulsadas y 7 pedales de afinación.' },
];

const fallbackRecords: (RehearsalRecord & { groupId?: string })[] = [
  { id: '1', groupId: 'group-1', title: 'Ensayo General - Programa Sinfónico Temporada Apertura', type: 'General', date: 'Próximo miércoles 20:00 hs', time: '20:00–23:00', venue: 'Sala Principal Manuel de Falla', attendeesCount: 58, notes: '58 músicos confirmados (94.2%) · Beethoven Mvt I & IV, Tchaikovsky y Danzón 2.' },
  { id: '2', groupId: 'group-1', title: 'Lectura de Cuerdas y Metales - Movimientos I y II', type: 'Seccional', date: 'Mañana 18:30 hs', time: '18:30–21:00', venue: 'Sala Seccional B', attendeesCount: 24, notes: 'Ajuste de pasajes veloces en Violines I y balance de cornos' },
  { id: '3', groupId: 'group-2', title: 'Ensayo de Cámara Barroco y Clave', type: 'General', date: 'Viernes 17:00 hs', time: '17:00–19:30', venue: 'Aula Magna de Música', attendeesCount: 14, notes: '14 músicos (Cuerdas y Clavecín continuo) · Vivaldi Primavera y Grieg' },
  { id: '4', groupId: 'group-2', title: 'Ensayo Seccional de Cuerdas - Vivaldi y Grieg', type: 'Seccional', date: 'Sábado 10:00 hs', time: '10:00–12:30', venue: 'Sala Seccional A', attendeesCount: 12, notes: 'Balance de articulaciones barrocas y violonchelo solo' },
];

const fallbackThreads: (ForumThread & { groupId?: string })[] = [
  {
    id: '1',
    groupId: 'group-1',
    title: 'Indicaciones de arcos para compases 45-60 (Violines I)',
    author: 'Maestro Carlos Mendonça',
    meta: 'Hace 1 h',
    category: 'Técnica',
    likes: 18,
    comments: [
      { id: 'c1', author: 'Elena Torres (Jefa de Cuerda)', date: 'Hace 30 min', content: 'Confirmado. Aplicamos staccato en punta de arco desde el compás 48 en adelante.' },
    ],
  },
  {
    id: '2',
    groupId: 'group-1',
    title: 'Ajuste de afinación y transposición de cornos en movimiento III',
    author: 'Roberto Valls',
    meta: 'Hace 3 h',
    category: 'Repertorio',
    likes: 12,
    comments: [
      { id: 'c2', author: 'Roberto Valls (Corno Principal)', date: 'Hace 1 h', content: 'Utilizaremos la bomba en Fa para mantener el timbre cálido en la sección central.' },
    ],
  },
  {
    id: '3',
    groupId: 'group-2',
    title: 'Ornamentación y articulación del continuo en Vivaldi Primavera',
    author: 'Sofía Rossi',
    meta: 'Ayer',
    category: 'Gestión',
    likes: 22,
    comments: [
      { id: 'c3', author: 'Tomas Rivas (Clavecín)', date: 'Hace 2 h', content: 'Revisado. Mantendremos el trino en cadencia final de Violín I.' },
    ],
  },
];

const fallbackNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'rehearsal_scheduled',
    title: 'Ensayo General - Sinfonía N.º 5 (Beethoven)',
    message: 'Mañana a las 10:00 AM - Sala Principal',
    timestamp: 'Hace 10 min',
    read: false,
    targetId: '1',
    metadata: {
      date: 'Mañana a las 10:00 AM',
      venue: 'Sala Principal',
      author: 'Dirección Musical',
    },
  },
  {
    id: 'notif-2',
    type: 'sheet_uploaded',
    title: 'Danzón n.º 2 - Arturo Márquez',
    message: 'Partituras actualizadas. Oboe, Violín I',
    timestamp: 'Hace 2 horas',
    read: false,
    targetId: '2',
    metadata: {
      ensemble: 'Orquesta Completa',
      author: 'Sofía Rossi',
    },
  },
];

export const fallbackGroups: GroupItem[] = [
  {
    id: 'group-1',
    name: 'Orquesta Sinfónica Juvenil',
    description: 'Agrupación sinfónica principal de repertorio clásico, romántico y latinoamericano.',
    type: 'ensemble',
    visibility: 'private',
    join_code: 'SINF-92X',
    is_join_code_active: true,
    owner: { id: 'user-dir-1', name: 'Maestro Carlos Mendonça', email: 'director@musicfolder.app' },
  },
  {
    id: 'group-2',
    name: 'Ensamble de Cámara Barroco',
    description: 'Ensamble especializado en interpretación histórica (Cuerdas y Clavecín).',
    type: 'ensemble',
    visibility: 'private',
    join_code: 'BAR-44K',
    is_join_code_active: true,
    owner: { id: 'user-dir-2', name: 'Sofía Rossi', email: 'sofia.rossi@musicfolder.app' },
  },
];

export const fallbackGroupMembers: Record<string, GroupMember[]> = {
  'group-1': [
    {
      id: 'm1',
      role: 'director',
      status: 'active',
      user: { id: 'user-dir-1', name: 'Maestro Carlos Mendonça', email: 'director@musicfolder.app', instrument_primary: 'Director' },
    },
    {
      id: 'm2',
      role: 'section_leader',
      status: 'active',
      user: { id: 'u2', name: 'Elena Torres', email: 'elena.torres@musicfolder.app', instrument_primary: 'Violín I' },
    },
    {
      id: 'm3',
      role: 'musician',
      status: 'active',
      user: { id: 'u3', name: 'Mateo Ruiz', email: 'mateo.ruiz@musicfolder.app', instrument_primary: 'Violín II' },
    },
    {
      id: 'm4',
      role: 'musician',
      status: 'active',
      user: { id: 'u4', name: 'Lucía Morales', email: 'lucia.morales@musicfolder.app', instrument_primary: 'Violonchelo' },
    },
    {
      id: 'm4b',
      role: 'musician',
      status: 'active',
      user: { id: 'u4b', name: 'Agustín Benítez', email: 'agustin.b@musicfolder.app', instrument_primary: 'Viola' },
    },
    {
      id: 'm4c',
      role: 'musician',
      status: 'active',
      user: { id: 'u4c', name: 'Camila Soria', email: 'camila.s@musicfolder.app', instrument_primary: 'Contrabajo' },
    },
    {
      id: 'm5',
      role: 'section_leader',
      status: 'active',
      user: { id: 'u5', name: 'Clara Fernández', email: 'clara.f@musicfolder.app', instrument_primary: 'Flauta traversa' },
    },
    {
      id: 'm5b',
      role: 'musician',
      status: 'active',
      user: { id: 'u5b', name: 'Matías Rossi', email: 'matias.r@musicfolder.app', instrument_primary: 'Oboe' },
    },
    {
      id: 'm5c',
      role: 'musician',
      status: 'active',
      user: { id: 'u5c', name: 'Sofía Blanco', email: 'sofia.b@musicfolder.app', instrument_primary: 'Clarinete' },
    },
    {
      id: 'm6',
      role: 'section_leader',
      status: 'active',
      user: { id: 'u6', name: 'Roberto Valls', email: 'roberto.valls@musicfolder.app', instrument_primary: 'Trompa (Corno en Fa)' },
    },
    {
      id: 'm6b',
      role: 'musician',
      status: 'active',
      user: { id: 'u6b', name: 'Javier Giménez', email: 'javier.g@musicfolder.app', instrument_primary: 'Trompeta' },
    },
    {
      id: 'm6c',
      role: 'musician',
      status: 'active',
      user: { id: 'u6c', name: 'Nicolás Castro', email: 'nicolas.c@musicfolder.app', instrument_primary: 'Trombón' },
    },
    {
      id: 'm7',
      role: 'section_leader',
      status: 'active',
      user: { id: 'u7', name: 'Gabriel Silva', email: 'gabriel.s@musicfolder.app', instrument_primary: 'Timbales' },
    },
    {
      id: 'm7b',
      role: 'musician',
      status: 'active',
      user: { id: 'u7b', name: 'Mariana Ortiz', email: 'mariana.o@musicfolder.app', instrument_primary: 'Arpa' },
    },
  ],
  'group-2': [
    {
      id: 'm21',
      role: 'director',
      status: 'active',
      user: { id: 'user-dir-2', name: 'Sofía Rossi', email: 'sofia.rossi@musicfolder.app', instrument_primary: 'Directora' },
    },
    {
      id: 'm22',
      role: 'section_leader',
      status: 'active',
      user: { id: 'u22', name: 'Martín Paez', email: 'martin.p@musicfolder.app', instrument_primary: 'Violín I' },
    },
    {
      id: 'm22b',
      role: 'musician',
      status: 'active',
      user: { id: 'u22b', name: 'Beatriz Luna', email: 'beatriz.l@musicfolder.app', instrument_primary: 'Violín II' },
    },
    {
      id: 'm23',
      role: 'section_leader',
      status: 'active',
      user: { id: 'u23', name: 'Andrés Vega', email: 'andres.v@musicfolder.app', instrument_primary: 'Viola' },
    },
    {
      id: 'm24',
      role: 'musician',
      status: 'active',
      user: { id: 'u24', name: 'Valeria Gomez', email: 'valeria.g@musicfolder.app', instrument_primary: 'Violonchelo' },
    },
    {
      id: 'm24b',
      role: 'musician',
      status: 'active',
      user: { id: 'u24b', name: 'Joaquín Peralta', email: 'joaquin.p@musicfolder.app', instrument_primary: 'Contrabajo' },
    },
    {
      id: 'm25',
      role: 'section_leader',
      status: 'active',
      user: { id: 'u25', name: 'Tomas Rivas', email: 'tomas.r@musicfolder.app', instrument_primary: 'Clavecín' },
    },
  ],
};

export const fallbackGroupLibrary: Record<string, GroupLibraryItem[]> = {
  'group-1': [
    { id: 'gl-1', title: 'Sinfonía N.º 5 en Do menor, Op. 67 (Particellas Completas)', description: 'Beethoven - Edición crítica de ensayo para cuerdas y metales', type: 'score' },
    { id: 'gl-2', title: 'Danzón N.º 2 - Márquez (Guión Director)', description: 'Partitura general anotada por el director con guías de tempo', type: 'score' },
    { id: 'gl-3', title: 'El lago de los cisnes, Op. 20 (Suite)', description: 'Tchaikovsky - Material de referencia para ensamble sinfónico', type: 'score' },
  ],
  'group-2': [
    { id: 'gl-21', title: "Serenata N.º 6 'Serenata Notturna', K. 239", description: 'Mozart - Particella de Violín I Solo y Clave', type: 'score' },
    { id: 'gl-22', title: 'Las cuatro estaciones - Primavera', description: 'Vivaldi - Partitura de cámara para ensamble barroco', type: 'score' },
  ],
};

export const fallbackGroupRehearsals: Record<string, GroupRehearsalItem[]> = {
  'group-1': [
    { id: 'gr-1', title: 'Ensayo General - Programa Sinfónico Temporada Apertura', date: 'Próximo miércoles 20:00 hs', time: '20:00–23:00', location: 'Sala Principal Manuel de Falla', agenda: 'Beethoven Op. 67 Mvt I & IV, Márquez Danzón 2' },
    { id: 'gr-2', title: 'Lectura de Cuerdas y Metales', date: 'Mañana 18:30 hs', time: '18:30–21:00', location: 'Sala Seccional B', agenda: 'Ajuste de pasajes veloces en Violines I y balance de cornos' },
  ],
  'group-2': [
    { id: 'gr-21', title: 'Ensayo de Cámara Barroco', date: 'Viernes 17:00 hs', time: '17:00–19:30', location: 'Aula Magna de Música', agenda: 'Mozart K. 239 y Vivaldi Primavera' },
  ],
};

export const fallbackGroupPosts: Record<string, GroupCommunityPost[]> = {
  'group-1': [
    { id: 'gp-1', title: 'Indicaciones de arcos para compases 45-60 (Violines I)', content: 'Confirmado staccato en punta de arco desde el compás 48 en adelante para equilibrar con los timbales.', author: { name: 'Maestro Carlos Mendonça' } },
    { id: 'gp-2', title: 'Afinación de cornos en movimiento III', content: 'Utilizaremos la bomba en Fa para mantener el timbre cálido en la sección central.', author: { name: 'Roberto Valls' } },
  ],
  'group-2': [
    { id: 'gp-21', title: 'Apertura de inscripciones para el Ensamble Barroco', content: 'Bienvenidos todos a la nueva temporada de música de cámara.', author: { name: 'Sofía Rossi' } },
  ],
};

export const api = {
  async getScores(options?: RequestInit): Promise<ScoreItem[]> {
    const data = await fetchJSON<ScoreItem[]>('/sheets', options);
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
    const headers: Record<string, string> = {};
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/sheets/${id}`, { method: 'DELETE', headers });
    return res.ok;
  },

  async uploadScoreFile(id: string, file: File): Promise<any | null> {
    try {
      const fd = new FormData();
      fd.append('file', file, file.name);
      const headers: Record<string, string> = {};
      const token = getAuthToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/sheets/${id}/upload`, {
        method: 'POST',
        headers,
        body: fd,
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  getScoreDownloadUrl(id: string) {
    return `${API_BASE}/sheets/${id}/download`;
  },
  async searchPublicScores(q: string, options?: RequestInit) {
    return await fetchJSON<any[]>(`/public-scores/search?q=${encodeURIComponent(q)}`, options);
  },

  async importPublicScore(payload: { title: string; composer?: string; pdfUrl?: string; sourceUrl?: string; instrumentation?: string }) {
    return await fetchJSON<any>('/public-scores/import', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getInstruments(options?: RequestInit): Promise<InstrumentItem[]> {
    const data = await fetchJSON<InstrumentItem[]>('/instruments', options);
    return data || fallbackInstruments;
  },

  async getRecords(options?: RequestInit): Promise<RehearsalRecord[]> {
    const data = await fetchJSON<RehearsalRecord[]>('/records', options);
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

  async getThreads(options?: RequestInit): Promise<ForumThread[]> {
    const data = await fetchJSON<ForumThread[]>('/forums/threads', options);
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

  async getGroups(options?: RequestInit): Promise<GroupItem[]> {
    const data = await fetchJSON<GroupItem[]>('/groups', options);
    return data && data.length > 0 ? data : fallbackGroups;
  },

  async getUserGroups(userId: string, options?: RequestInit): Promise<GroupItem[]> {
    const data = await fetchJSON<GroupItem[]>(`/groups/user/${userId}`, options);
    return data && data.length > 0 ? data : fallbackGroups;
  },

  async createGroup(payload: { name: string; description?: string; type?: string; visibility?: string; ownerId: string }): Promise<GroupItem | null> {
    const data = await fetchJSON<GroupItem>('/groups', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data) return data;

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'ORQ-';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];

    const newGroup: GroupItem = {
      id: `group-${Date.now()}`,
      name: payload.name,
      description: payload.description || 'Canal privado de orquesta/ensamble',
      type: payload.type || 'ensemble',
      visibility: payload.visibility || 'private',
      join_code: code,
      is_join_code_active: true,
      owner: { id: payload.ownerId, name: 'Director (Tú)', email: 'director@musicfolder.app' },
    };

    fallbackGroups.unshift(newGroup);
    fallbackGroupMembers[newGroup.id] = [
      {
        id: `m-owner-${Date.now()}`,
        role: 'director',
        status: 'active',
        user: { id: payload.ownerId, name: 'Director (Tú)', email: 'director@musicfolder.app', instrument_primary: 'Director' },
      },
    ];

    return newGroup;
  },

  async joinGroup(payload: { userId: string; code: string }): Promise<GroupMember | null> {
    const data = await fetchJSON<GroupMember>('/groups/join', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data) return data;

    const cleanCode = (payload.code || '').trim().toUpperCase();
    let targetGroup = fallbackGroups.find((g) => g.join_code === cleanCode);

    if (!targetGroup) {
      targetGroup = {
        id: `group-code-${cleanCode}`,
        name: `Orquesta Ensamble (${cleanCode})`,
        description: 'Canal privado de orquesta unido por código de acceso.',
        type: 'ensemble',
        visibility: 'private',
        join_code: cleanCode,
        is_join_code_active: true,
        owner: { id: 'dir-joined', name: 'Dirección del Canal', email: 'director@canal.app' },
      };
      fallbackGroups.unshift(targetGroup);
    }

    const newMember: GroupMember = {
      id: `member-${Date.now()}`,
      role: 'musician',
      status: 'active',
      user: { id: payload.userId, name: 'Músico Registrado', email: 'musico@musicfolder.app', instrument_primary: 'Violín I' },
      group: targetGroup,
    };

    if (!fallbackGroupMembers[targetGroup.id]) {
      fallbackGroupMembers[targetGroup.id] = [];
    }
    fallbackGroupMembers[targetGroup.id].push(newMember);

    return newMember;
  },

  async regenerateGroupCode(groupId: string, userId: string): Promise<GroupItem | null> {
    const data = await fetchJSON<GroupItem>(`/groups/${groupId}/regenerate-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (data) return data;

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'ORQ-';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];

    const targetGroup = fallbackGroups.find((g) => g.id === groupId);
    if (targetGroup) {
      targetGroup.join_code = code;
      return targetGroup;
    }
    return null;
  },

  async getGroupMembers(groupId: string, options?: RequestInit): Promise<GroupMember[]> {
    const data = await fetchJSON<GroupMember[]>(`/groups/${groupId}/members`, options);
    if (data && data.length > 0) return data;
    return (
      fallbackGroupMembers[groupId] || [
        {
          id: 'm-def-1',
          role: 'director',
          status: 'active',
          user: { id: 'u-dir', name: 'Maestro Director', email: 'director@musicfolder.app', instrument_primary: 'Director' },
        },
        {
          id: 'm-def-2',
          role: 'musician',
          status: 'active',
          user: { id: 'u-mus', name: 'Elena Torres', email: 'elena@musicfolder.app', instrument_primary: 'Violín I' },
        },
      ]
    );
  },

  async getGroupLibrary(groupId: string, _userId?: string, options?: RequestInit): Promise<GroupLibraryItem[]> {
    const data = await fetchJSON<GroupLibraryItem[]>(`/groups/${groupId}/library`, options);
    if (data && data.length > 0) return data;
    return fallbackGroupLibrary[groupId] || [
      { id: 'gl-def', title: 'Particella de Referencia', description: 'Repertorio del ensamble', type: 'score' },
    ];
  },

  async createGroupLibraryItem(
    groupId: string,
    payload: { userId?: string; title: string; description?: string; type?: string; file_url?: string; uploaded_by?: string },
  ): Promise<GroupLibraryItem | null> {
    const data = await fetchJSON<GroupLibraryItem>(`/groups/${groupId}/library`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data) return data;

    const item: GroupLibraryItem = {
      id: `gl-${Date.now()}`,
      title: payload.title,
      description: payload.description || '',
      type: payload.type || 'score',
    };
    if (!fallbackGroupLibrary[groupId]) fallbackGroupLibrary[groupId] = [];
    fallbackGroupLibrary[groupId].unshift(item);
    return item;
  },

  async getGroupRehearsals(groupId: string, _userId?: string, options?: RequestInit): Promise<GroupRehearsalItem[]> {
    const data = await fetchJSON<GroupRehearsalItem[]>(`/groups/${groupId}/rehearsals`, options);
    if (data && data.length > 0) return data;
    return fallbackGroupRehearsals[groupId] || [];
  },

  async createGroupRehearsal(
    groupId: string,
    payload: { title: string; date?: string; time?: string; location?: string; agenda?: string; notes?: string; created_by?: string },
  ): Promise<GroupRehearsalItem | null> {
    const data = await fetchJSON<GroupRehearsalItem>(`/groups/${groupId}/rehearsals`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data) return data;

    const item: GroupRehearsalItem = {
      id: `gr-${Date.now()}`,
      title: payload.title,
      date: payload.date || 'Próxima fecha',
      time: payload.time || '20:00 hs',
      location: payload.location || 'Sala Principal',
      agenda: payload.agenda || '',
    };
    if (!fallbackGroupRehearsals[groupId]) fallbackGroupRehearsals[groupId] = [];
    fallbackGroupRehearsals[groupId].unshift(item);
    return item;
  },

  async getGroupCommunity(groupId: string, _userId?: string, options?: RequestInit): Promise<GroupCommunityPost[]> {
    const data = await fetchJSON<GroupCommunityPost[]>(`/groups/${groupId}/community`, options);
    if (data && data.length > 0) return data;
    return fallbackGroupPosts[groupId] || [];
  },

  async createGroupPost(
    groupId: string,
    payload: { title: string; content: string; authorId?: string; visibility?: string },
  ): Promise<GroupCommunityPost | null> {
    const data = await fetchJSON<GroupCommunityPost>(`/groups/${groupId}/community`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data) return data;

    const item: GroupCommunityPost = {
      id: `gp-${Date.now()}`,
      title: payload.title,
      content: payload.content,
      visibility: payload.visibility || 'group',
    };
    if (!fallbackGroupPosts[groupId]) fallbackGroupPosts[groupId] = [];
    fallbackGroupPosts[groupId].unshift(item);
    return item;
  },

  async getNotifications(userId?: string, options?: RequestInit): Promise<NotificationItem[]> {
    const endpoint = userId ? `/notifications?userId=${encodeURIComponent(userId)}` : '/notifications';
    const data = await fetchJSON<NotificationItem[]>(endpoint, options);
    return data || fallbackNotifications;
  },

  async markNotificationAsRead(id: string): Promise<boolean> {
    const res = await fetchJSON<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' });
    return res ? res.success : true;
  },

  async markAllNotificationsAsRead(userId?: string): Promise<boolean> {
    const res = await fetchJSON<{ success: boolean }>(userId ? `/notifications/read-all?userId=${encodeURIComponent(userId)}` : '/notifications/read-all', { method: 'PATCH' });
    return res ? res.success : true;
  },

  async registerUser(payload: { name: string; email: string; password: string; role?: string; instrument_primary?: string }) {
    const data = await fetchJSON<{ success: boolean; message?: string; user: any; token?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data;
  },

  async loginUser(payload: { email: string; password: string }) {
    const data = await fetchJSON<{ success: boolean; message?: string; user: any; token?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data;
  },
};
