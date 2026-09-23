import { useEffect, useRef, useState } from 'react';
import { api, ForumThread, GroupItem, InstrumentItem, NotificationItem, RehearsalRecord, ScoreItem } from './api';
import { initializeGoogleStitch, listGoogleStitchTools, StitchTool } from './stitch';
import { usePWA } from './usePWA';

type View = 'inicio' | 'biblioteca' | 'ensayos' | 'instrumentos' | 'foro';

type SessionUser = {
  id?: string;
  name: string;
  email: string;
  role?: string;
  instrument_primary?: string;
  token?: string;
};

type AssistantMessage = {
  id: number;
  role: 'assistant' | 'user';
  text: string;
};

const STORAGE_KEY = 'music-folder-session';
const NOTIFICATIONS_STORAGE_KEY = 'music-folder-notifications';

function getNotificationsStorageKey(userId?: string) {
  return userId ? `${NOTIFICATIONS_STORAGE_KEY}-${userId}` : `${NOTIFICATIONS_STORAGE_KEY}-guest`;
}

function getStoredUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed) return null;
    if (parsed.user) {
      return {
        ...parsed.user,
        token: parsed.token || parsed.user.token,
      };
    }
    return parsed as SessionUser;
  } catch {
    return null;
  }
}

function getStoredNotifications(userId?: string): NotificationItem[] {
  if (typeof window === 'undefined') return [];
  const key = getNotificationsStorageKey(userId);
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as NotificationItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeRoleValue(role?: string): string {
  return (role ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function isDirectorRole(role?: string): boolean {
  const normalized = normalizeRoleValue(role);
  if (!normalized) return false;

  return ['director', 'conductor', 'gestor', 'coordinador', 'administrador', 'jefe de cuerda'].some((token) => normalized.includes(token));
}

function getAssistantReply(input: string): string {
  const text = input.toLowerCase();

  if (text.includes('ensayo')) return 'Revisé tu agenda: conviene dejar un bloque de 30 minutos para la sección de cuerdas antes del ensayo general.';
  if (text.includes('partitura') || text.includes('biblioteca')) return 'La biblioteca está organizada por repertorio y categoría. Puedo ayudarte a encontrar una obra por estilo o ensamble.';
  if (text.includes('instrumento')) return 'Te recomiendo revisar la ficha del instrumento en la sección de instrumentos para consultar clave, transposición y uso.';
  if (text.includes('foro')) return 'En la comunidad puedes abrir una nueva discusión o responder a una publicación existente para coordinar ideas.';
  if (text.includes('notificacion') || text.includes('notificación')) return 'Puedes consultar el centro de notificaciones en la campana del menú superior para ver avisos de partituras, ensayos y asistencias.';

  return 'Puedo ayudarte a revisar repertorio, ensayos, asistencias y coordinación del grupo. ¿Qué quieres consultar?';
}

const nav: Array<{ id: View; icon: string; label: string }> = [
  { id: 'inicio', icon: '⌂', label: 'Inicio' },
  { id: 'biblioteca', icon: '♫', label: 'Biblioteca' },
  { id: 'ensayos', icon: '◷', label: 'Ensayos' },
  { id: 'instrumentos', icon: '◉', label: 'Instrumentos' },
  { id: 'foro', icon: '◌', label: 'Comunidad' },
];

const titles: Record<View, [string, string]> = {
  inicio: ['Buenos días', 'Aquí está el pulso de tu agrupación para hoy.'],
  biblioteca: ['Biblioteca de partituras', 'Organiza, encuentra y comparte el repertorio de tu ensamble.'],
  ensayos: ['Gestión de ensayos', 'Planifica cada encuentro y mantén a tu agrupación sincronizada.'],
  instrumentos: ['Enciclopedia de instrumentos', 'Conoce las voces que dan vida a tu ensamble.'],
  foro: ['Foro de la comunidad', 'Comparte conocimiento con músicos y directores.'],
};

function parseRehearsalDateBadge(dateStr: string): { day: string; sub: string } {
  if (!dateStr) return { day: '📅', sub: 'ENSAYO' };

  const str = dateStr.trim();
  const matchNum = str.match(/\b(\d{1,2})\b/);

  if (matchNum) {
    const day = matchNum[1];
    let sub = 'ENSAYO';
    if (/ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic/i.test(str)) {
      const monthMatch = str.match(/(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)/i);
      if (monthMatch) sub = monthMatch[1].toUpperCase();
    } else if (str.toLowerCase().includes('mañana')) {
      sub = 'MAÑANA';
    } else if (str.toLowerCase().includes('hoy')) {
      sub = 'HOY';
    } else {
      const wordMatch = str.replace(/\b\d{1,2}\b/g, '').trim().match(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]+/);
      if (wordMatch && wordMatch[0].length >= 3) {
        sub = wordMatch[0].substring(0, 3).toUpperCase();
      }
    }
    return { day, sub };
  }

  if (str.toLowerCase().includes('mañana')) return { day: '⚡', sub: 'MAÑANA' };
  if (str.toLowerCase().includes('hoy')) return { day: '📍', sub: 'HOY' };

  return { day: '📅', sub: str.substring(0, 4).toUpperCase() };
}

export default function App() {
  const { canInstall, promptInstall, hasUpdate, isUpdating, updateApp, checkForUpdates } = usePWA();
  const [view, setView] = useState<View>('inicio');
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(() => getStoredUser());
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Músico / Instrumentista',
    instrument_primary: 'Violín',
  });
  const [authError, setAuthError] = useState<string | null>(null);

  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([
    {
      id: 1,
      role: 'assistant',
      text: 'Hola, soy tu asistente de Music Folder. Puedo ayudarte con repertorio, ensayos, notificaciones y coordinación del grupo.',
    },
  ]);

  // Data states
  const [scores, setScores] = useState<ScoreItem[]>([]);
  const [instruments, setInstruments] = useState<InstrumentItem[]>([]);
  const [records, setRecords] = useState<RehearsalRecord[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isRefreshingGroups, setIsRefreshingGroups] = useState(false);

  const handleRefreshGroups = async () => {
    setIsRefreshingGroups(true);
    try {
      if (sessionUser?.id) {
        const userGroups = await api.getUserGroups(sessionUser.id);
        setGroups(userGroups || []);
        if (userGroups && userGroups.length > 0 && !selectedGroupId) {
          setSelectedGroupId(userGroups[0].id);
        }
      } else {
        const allGroups = await api.getGroups();
        setGroups(allGroups || []);
      }
    } catch (err) {
      console.error('Error refreshing groups:', err);
    } finally {
      setTimeout(() => setIsRefreshingGroups(false), 400);
    }
  };
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [groupLibrary, setGroupLibrary] = useState<any[]>([]);
  const [groupRehearsals, setGroupRehearsals] = useState<any[]>([]);
  const [groupPosts, setGroupPosts] = useState<any[]>([]);
  const selectedGroup = groups.find((group) => group.id === selectedGroupId) || null;
  const isGroupDirector = Boolean(
    selectedGroup &&
      ((selectedGroup.owner && selectedGroup.owner.id === sessionUser?.id) ||
        groupMembers.some((member) => member.user?.id === sessionUser?.id && isDirectorRole(member.role))),
  );
  const [groupForm, setGroupForm] = useState({ name: '', description: '', type: 'ensemble', visibility: 'private' });
  const [joinGroupCode, setJoinGroupCode] = useState('');
  const [groupStatus, setGroupStatus] = useState<string | null>(null);
  const [newGroupLibraryItem, setNewGroupLibraryItem] = useState({ title: '', description: '', type: 'score' });
  const [newGroupRehearsal, setNewGroupRehearsal] = useState({ title: '', date: '', time: '', location: '', agenda: '' });
  const [newGroupPost, setNewGroupPost] = useState({ title: '', content: '', visibility: 'group' });
  const [groupWorkspaceTab, setGroupWorkspaceTab] = useState<'resumen' | 'biblioteca' | 'ensayos' | 'comunidad'>('resumen');

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'todas' | 'ensayos' | 'partituras' | 'asistencia'>('todas');
  const [toastMessage, setToastMessage] = useState<{ title: string; body: string; icon: string } | null>(null);

  // Filter states
  const [scoreFilter, setScoreFilter] = useState('Todos');
  const [scoreSearch, setScoreSearch] = useState('');
  const [showPublicExplorer, setShowPublicExplorer] = useState(false);
  const [publicQuery, setPublicQuery] = useState('');
  const [publicResults, setPublicResults] = useState<any[]>([]);
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
  const [newScoreFile, setNewScoreFile] = useState<File | null>(null);
  const [newRecord, setNewRecord] = useState({ title: '', type: 'General', date: '', time: '19:00–21:00', venue: 'Auditorio Manuel de Falla', notes: '' });
  const [newThread, setNewThread] = useState({ title: '', author: '', category: 'Repertorio', content: '' });
  const [commentText, setCommentText] = useState('');

  // Ref guards para evitar peticiones redundantes en bucle
  const fetchedUserRef = useRef<string | null>(null);
  const fetchedMembersGroupRef = useRef<string | null>(null);
  const fetchedCommunityGroupRef = useRef<string | null>(null);
  const fetchedLibraryGroupRef = useRef<string | null>(null);
  const fetchedRehearsalsGroupRef = useRef<string | null>(null);

  // Initial Load (Solo datos globales del usuario autenticado)
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    // Guard: Only fetch protected dashboard endpoints when user session is active
    if (!sessionUser?.id) {
      setNotifications([]);
      fetchedUserRef.current = null;
      return;
    }

    // Evitar llamadas duplicadas si los datos del usuario ya fueron solicitados
    if (fetchedUserRef.current === sessionUser.id) {
      return;
    }
    fetchedUserRef.current = sessionUser.id;

    const reqOptions = { signal: controller.signal };

    // Paralelizar la carga inicial usando Promise.all para minimizar latencias y cascadas
    Promise.all([
      api.getScores(reqOptions),
      api.getInstruments(reqOptions),
      api.getRecords(reqOptions),
      api.getThreads(reqOptions),
      api.getUserGroups(sessionUser.id, reqOptions),
      api.getNotifications(sessionUser.id, reqOptions),
    ]).then(([scoresData, instsData, recordsData, threadsData, userGroupsData, notifsData]) => {
      if (!isMounted || controller.signal.aborted) return;

      if (scoresData) setScores(scoresData);
      if (instsData) setInstruments(instsData);
      if (recordsData) setRecords(recordsData);
      if (threadsData) setThreads(threadsData);
      if (userGroupsData) {
        setGroups(userGroupsData);
        if (userGroupsData.length > 0) {
          setSelectedGroupId((prev) => prev || userGroupsData[0].id);
        }
      }

      const storedNotifications = getStoredNotifications(sessionUser.id);
      if (storedNotifications.length > 0) {
        setNotifications(storedNotifications);
      } else if (notifsData && notifsData.length > 0) {
        setNotifications(notifsData);
      }
    }).catch((err) => {
      if (err?.name !== 'AbortError') {
        console.warn('Initial dashboard fetch interrupted', err);
      }
    });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [sessionUser?.id, sessionUser?.token]);

  // Carga inicial básica del grupo seleccionado (Solo Miembros para métricas de resumen)
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    if (!selectedGroupId || !sessionUser?.id) {
      fetchedMembersGroupRef.current = null;
      return;
    }

    if (fetchedMembersGroupRef.current === selectedGroupId) {
      return;
    }
    fetchedMembersGroupRef.current = selectedGroupId;

    api.getGroupMembers(selectedGroupId, { signal: controller.signal })
      .then((members) => {
        if (isMounted && !controller.signal.aborted) setGroupMembers(members || []);
      })
      .catch((err) => {
        if (isMounted && err?.name !== 'AbortError') setGroupMembers([]);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [selectedGroupId, sessionUser?.id]);

  // Carga bajo demanda por pestaña activa (Comunidad, Biblioteca, Ensayos)
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    if (!selectedGroupId || !sessionUser?.id) return;
    const reqOptions = { signal: controller.signal };

    if (groupWorkspaceTab === 'comunidad') {
      if (fetchedCommunityGroupRef.current === selectedGroupId) return;
      fetchedCommunityGroupRef.current = selectedGroupId;
      api.getGroupCommunity(selectedGroupId, undefined, reqOptions)
        .then((items) => {
          if (isMounted && !controller.signal.aborted) setGroupPosts(items || []);
        })
        .catch((err) => {
          if (isMounted && err?.name !== 'AbortError') setGroupPosts([]);
        });
    } else if (groupWorkspaceTab === 'biblioteca') {
      if (fetchedLibraryGroupRef.current === selectedGroupId) return;
      fetchedLibraryGroupRef.current = selectedGroupId;
      api.getGroupLibrary(selectedGroupId, undefined, reqOptions)
        .then((items) => {
          if (isMounted && !controller.signal.aborted) setGroupLibrary(items || []);
        })
        .catch((err) => {
          if (isMounted && err?.name !== 'AbortError') setGroupLibrary([]);
        });
    } else if (groupWorkspaceTab === 'ensayos') {
      if (fetchedRehearsalsGroupRef.current === selectedGroupId) return;
      fetchedRehearsalsGroupRef.current = selectedGroupId;
      api.getGroupRehearsals(selectedGroupId, undefined, reqOptions)
        .then((items) => {
          if (isMounted && !controller.signal.aborted) setGroupRehearsals(items || []);
        })
        .catch((err) => {
          if (isMounted && err?.name !== 'AbortError') setGroupRehearsals([]);
        });
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [selectedGroupId, groupWorkspaceTab, sessionUser?.id]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionUser?.id) {
        window.localStorage.setItem(getNotificationsStorageKey(sessionUser.id), JSON.stringify(notifications));
      } else {
        window.localStorage.removeItem(getNotificationsStorageKey());
      }
    }
  }, [notifications, sessionUser?.id]);

  // Toast Auto-Hide
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const isDirector = isDirectorRole(sessionUser?.role);

  const handleMarkAsRead = async (id: string) => {
    await api.markNotificationAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllAsRead = async () => {
    await api.markAllNotificationsAsRead(sessionUser?.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleRecordAttendance = (status: 'presente' | 'ausente' | 'justificado') => {
    if (!selectedRecord) return;

    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      type: 'attendance_marked',
      title: `Asistencia Registrada: ${status.toUpperCase()}`,
      message: selectedRecord.title,
      timestamp: 'Hace un momento',
      read: false,
      targetId: selectedRecord.id,
      metadata: {
        status,
        date: selectedRecord.date,
        author: sessionUser?.name || 'Músico',
      },
    };

    setNotifications((prev) => [notif, ...prev]);
    setSelectedRecord(null);
    setToastMessage({
      title: '✅ Asistencia Registrada',
      body: `Confirmaste asistencia como ${status} en "${selectedRecord.title}". Notificación enviada.`,
      icon: '✓',
    });
  };

  // Actions
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const email = loginForm.email.trim();
    if (!email || !loginForm.password) {
      setAuthError('Por favor, ingresá tu correo y contraseña.');
      return;
    }

    try {
      const res = await api.loginUser({ email, password: loginForm.password });
      if (res && res.user) {
        const token = res.token || (res.user as any).token;
        const nextUser: SessionUser = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          instrument_primary: res.user.instrument_primary,
          token,
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
        setSessionUser(nextUser);
      } else {
        const name = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
        const fallbackUser: SessionUser = { name, email, role: 'Músico' };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackUser));
        setSessionUser(fallbackUser);
      }
    } catch (err) {
      setAuthError('No se pudo iniciar sesión. Verificá tus datos.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const name = registerForm.name.trim();
    const email = registerForm.email.trim();
    const password = registerForm.password;
    const confirmPassword = registerForm.confirmPassword;

    if (!name || !email || !password || !confirmPassword) {
      setAuthError('Por favor, completá todos los campos obligatorios.');
      return;
    }

    if (password.length < 6) {
      setAuthError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setAuthError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const res = await api.registerUser({
        name,
        email,
        password,
        role: registerForm.role,
        instrument_primary: registerForm.instrument_primary,
      });

      if (res && res.user) {
        const token = res.token || (res.user as any).token;
        const newUser: SessionUser = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          instrument_primary: res.user.instrument_primary,
          token,
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        setSessionUser(newUser);
      } else {
        const fallbackUser: SessionUser = {
          name,
          email,
          role: registerForm.role,
          instrument_primary: registerForm.instrument_primary,
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackUser));
        setSessionUser(fallbackUser);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Error al guardar el usuario en el registro.');
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    fetchedUserRef.current = null;
    fetchedMembersGroupRef.current = null;
    fetchedCommunityGroupRef.current = null;
    fetchedLibraryGroupRef.current = null;
    fetchedRehearsalsGroupRef.current = null;
    setNotifications([]);
    setSessionUser(null);
    setView('inicio');
    setMenuOpen(false);
  };

  const handleCreateGroup = async () => {
    if (!sessionUser?.id || !groupForm.name.trim()) return;

    if (!isDirectorRole(sessionUser.role)) {
      setGroupStatus('Solo los perfiles de director pueden crear grupos.');
      return;
    }

    const created = await api.createGroup({
      name: groupForm.name.trim(),
      description: groupForm.description.trim(),
      type: groupForm.type,
      visibility: groupForm.visibility,
      ownerId: sessionUser.id,
    });

    if (created) {
      setGroups((prev) => [created, ...prev]);
      setGroupStatus(`Grupo creado correctamente. Código: ${created.join_code || 'N/A'}`);
      setGroupForm({ name: '', description: '', type: 'ensemble', visibility: 'private' });
    } else {
      setGroupStatus('No se pudo crear el grupo.');
    }
  };

  const handleJoinGroup = async () => {
    if (!sessionUser?.id || !joinGroupCode.trim()) return;

    const result = await api.joinGroup({ userId: sessionUser.id, code: joinGroupCode.trim() });

    if (result && result.group) {
      setGroupStatus(`Te uniste al grupo "${result.group.name}".`);
      setJoinGroupCode('');
      const refreshed = await api.getUserGroups(sessionUser.id);
      setGroups(refreshed);
      if (refreshed.length > 0) setSelectedGroupId(refreshed[0].id);
    } else {
      setGroupStatus('El código es inválido o no está activo.');
    }
  };

  const handleRegenerateGroupCode = async () => {
    if (!sessionUser?.id || !selectedGroupId) return;

    const updated = await api.regenerateGroupCode(selectedGroupId, sessionUser.id);
    if (updated) {
      setGroups((prev) => prev.map((group) => (group.id === selectedGroupId ? { ...group, join_code: updated.join_code } : group)));
      setGroupStatus(`Se renovó el código del grupo. Nuevo código: ${updated.join_code}`);
    }
  };

  const handleCreateGroupLibraryItem = async () => {
    if (!sessionUser?.id || !selectedGroupId || !newGroupLibraryItem.title.trim()) return;

    const created = await api.createGroupLibraryItem(selectedGroupId, {
      userId: sessionUser.id,
      title: newGroupLibraryItem.title.trim(),
      description: newGroupLibraryItem.description.trim(),
      type: newGroupLibraryItem.type,
      uploaded_by: sessionUser.id,
    });

    if (created) {
      setGroupLibrary((prev) => [created, ...prev]);
      setNewGroupLibraryItem({ title: '', description: '', type: 'score' });
    }
  };

  const handleCreateGroupRehearsal = async () => {
    if (!sessionUser?.id || !selectedGroupId || !newGroupRehearsal.title.trim()) return;

    const created = await api.createGroupRehearsal(selectedGroupId, {
      title: newGroupRehearsal.title.trim(),
      date: newGroupRehearsal.date,
      time: newGroupRehearsal.time,
      location: newGroupRehearsal.location,
      agenda: newGroupRehearsal.agenda,
      created_by: sessionUser.id,
    });

    if (created) {
      setGroupRehearsals((prev) => [created, ...prev]);
      setNewGroupRehearsal({ title: '', date: '', time: '', location: '', agenda: '' });
    }
  };

  const handleCreateGroupPost = async () => {
    if (!sessionUser?.id || !selectedGroupId || !newGroupPost.title.trim() || !newGroupPost.content.trim()) return;

    const created = await api.createGroupPost(selectedGroupId, {
      title: newGroupPost.title.trim(),
      content: newGroupPost.content.trim(),
      authorId: sessionUser.id,
      visibility: newGroupPost.visibility,
    });

    if (created) {
      setGroupPosts((prev) => [created, ...prev]);
      setNewGroupPost({ title: '', content: '', visibility: 'group' });
    }
  };

  const handleAssistantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = assistantInput.trim();
    if (!text) return;

    const userMessage: AssistantMessage = {
      id: Date.now(),
      role: 'user',
      text,
    };

    setAssistantMessages((prev) => [...prev, userMessage]);
    setAssistantInput('');

    window.setTimeout(() => {
      setAssistantMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: getAssistantReply(text),
        },
      ]);
    }, 180);
  };

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScore.title) return;
    const added = await api.createScore(newScore as any);
    // If a PDF file was selected, upload it
    if (newScoreFile && added?.id) {
      await api.uploadScoreFile(added.id, newScoreFile);
    }
    setScores([added, ...scores]);

    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      type: 'sheet_uploaded',
      title: `${newScore.title} - ${newScore.composer || 'Arturo Márquez'}`,
      message: `Partituras actualizadas. ${newScore.ensemble}`,
      timestamp: 'Hace un momento',
      read: false,
      targetId: added.id,
      metadata: {
        ensemble: newScore.ensemble,
        author: sessionUser?.name || 'Sofía Rossi',
      },
    };
    setNotifications((prev) => [notif, ...prev]);
    setToastMessage({
      title: '🎼 Partitura Publicada',
      body: `Notificación enviada a la agrupación sobre "${newScore.title}".`,
      icon: '🎼',
    });

    setNewScore({ title: '', composer: '', ensemble: 'Orquesta completa', category: 'Orquesta', difficulty: 'Intermedio' });
    setNewScoreFile(null);
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

    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      type: 'rehearsal_scheduled',
      title: `${newRecord.title}`,
      message: `${newRecord.date || 'Mañana a las 10:00 AM'} - ${newRecord.venue}`,
      timestamp: 'Hace un momento',
      read: false,
      targetId: added.id,
      metadata: {
        date: `${newRecord.date || 'Próxima fecha'} · ${newRecord.time}`,
        venue: newRecord.venue,
        author: sessionUser?.name || 'Dirección',
      },
    };
    setNotifications((prev) => [notif, ...prev]);
    setToastMessage({
      title: '🗓️ Ensayo Agendado',
      body: `Se ha notificado el ensayo "${newRecord.title}" a todos los integrantes.`,
      icon: '🗓️',
    });

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
    setNewThread({ title: '', author: sessionUser?.name || 'Músico', category: 'Repertorio', content: '' });
    setShowNewThreadModal(false);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !commentText.trim()) return;
    const authorName = sessionUser?.name || 'Músico';
    const updated = await api.addComment(selectedThread.id, authorName, commentText);
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

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'ensayos') return n.type === 'rehearsal_scheduled' || n.type === 'student_joined';
    if (notifFilter === 'partituras') return n.type === 'sheet_uploaded';
    if (notifFilter === 'asistencia') return n.type === 'attendance_marked' || n.type === 'student_joined';
    return true;
  });

  const [heading, subheading] = titles[view];
  const userName = sessionUser?.name ? sessionUser.name.split(' ')[0] : 'músico';
  const canCreateGroups = isDirector;
  const canSeeGroupCode = isDirector || isGroupDirector;
  const roleLabel = isDirector ? 'Director' : 'Músico';
  const roleHeroTitle = isDirector ? 'Tu dirección, sincronizada.' : 'Tu música, siempre en orden.';
  const roleHeroDescription = isDirector
    ? 'Controlá grupos, repertorio y ensayos desde un panel pensado para coordinar la agrupación.'
    : 'Consulta partituras, fechas de ensayo y la comunidad musical sin perder el pulso del grupo.';
  const roleHeroButton = isDirector ? 'Gestionar grupos' : 'Explorar biblioteca';
  const dynamicHeading = view === 'inicio' ? `Buenos días, ${userName}` : heading;

  if (!sessionUser) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="brand-lockup">
            <span>𝄞</span>
            <div>
              <strong>Music Folder</strong>
              <small>Tu cuaderno de ensayos y repertorio</small>
            </div>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
              }}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('register');
                setAuthError(null);
              }}
            >
              Crear cuenta
            </button>
          </div>

          {authError && <div className="auth-error-banner">⚠️ {authError}</div>}

          {authMode === 'login' ? (
            <>
              <div className="login-copy">
                <h1>Iniciá sesión</h1>
                <p>Accedé al panel de biblioteca, ensayos y comunidad musical.</p>
              </div>

              <form className="login-form" onSubmit={handleLogin}>
                <div className="login-field">
                  <label htmlFor="login-email">Correo electrónico</label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="ejemplo@musicfolder.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  />
                </div>

                <div className="login-field">
                  <label htmlFor="login-password">Contraseña</label>
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                </div>

                <button type="submit" className="primary login-submit">
                  Entrar
                </button>

                <p className="auth-switch-text">
                  ¿No tenés una cuenta todavía?{' '}
                  <button
                    type="button"
                    className="auth-link-button"
                    onClick={() => {
                      setAuthMode('register');
                      setAuthError(null);
                    }}
                  >
                    Registrate acá
                  </button>
                </p>
              </form>
            </>
          ) : (
            <>
              <div className="login-copy">
                <h1>Crear una cuenta</h1>
                <p>Sumate a la comunidad de Music Folder como músico, director o gestor.</p>
              </div>

              <form className="login-form" onSubmit={handleRegister}>
                <div className="login-field">
                  <label htmlFor="reg-name">Nombre y apellido</label>
                  <input
                    id="reg-name"
                    type="text"
                    placeholder="Valentina Ruiz"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  />
                </div>

                <div className="login-field">
                  <label htmlFor="reg-email">Correo electrónico</label>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="valentina@musicfolder.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  />
                </div>

                <div className="login-field-row">
                  <div className="login-field">
                    <label htmlFor="reg-role">Rol en la agrupación</label>
                    <select
                      id="reg-role"
                      className="auth-select"
                      value={registerForm.role}
                      onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                    >
                      <option value="Director / Conductor">Director / Conductor</option>
                      <option value="Músico / Instrumentista">Músico / Instrumentista</option>
                      <option value="Jefe de cuerda">Jefe de cuerda</option>
                      <option value="Archivista / Copista">Archivista / Copista</option>
                      <option value="Estudiante">Estudiante</option>
                    </select>
                  </div>

                  <div className="login-field">
                    <label htmlFor="reg-inst">Instrumento principal</label>
                    <input
                      id="reg-inst"
                      type="text"
                      placeholder="Violín, Flauta, Piano..."
                      value={registerForm.instrument_primary}
                      onChange={(e) => setRegisterForm({ ...registerForm, instrument_primary: e.target.value })}
                    />
                  </div>
                </div>

                <div className="login-field-row">
                  <div className="login-field">
                    <label htmlFor="reg-pass">Contraseña</label>
                    <input
                      id="reg-pass"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    />
                  </div>

                  <div className="login-field">
                    <label htmlFor="reg-confirm">Confirmar contraseña</label>
                    <input
                      id="reg-confirm"
                      type="password"
                      placeholder="Repetí la contraseña"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="primary login-submit">
                  Registrarme e Ingresar
                </button>

                <p className="auth-switch-text">
                  ¿Ya tenés una cuenta registrada?{' '}
                  <button
                    type="button"
                    className="auth-link-button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError(null);
                    }}
                  >
                    Iniciá sesión acá
                  </button>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`app-shell role-${isDirector ? 'director' : 'musician'}`} data-role={isDirector ? 'director' : 'musician'}>
      {/* PWA Floating Update Banner */}
      {hasUpdate && (
        <div className="pwa-update-banner">
          <div className="pwa-update-content">
            <span className="pwa-update-icon">⚡</span>
            <div>
              <strong>¡Nueva actualización disponible!</strong>
              <p>Hay una nueva versión de Music Folder lista. Cliqueá para actualizar el sitio inmediatamente.</p>
            </div>
          </div>
          <button className="pwa-update-action-btn" onClick={updateApp} disabled={isUpdating}>
            {isUpdating ? 'Actualizando...' : 'Actualizar sitio'}
          </button>
        </div>
      )}

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
          <div className="avatar" title="Cerrar sesión" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            {sessionUser.name[0]?.toUpperCase() || 'U'}
          </div>
          <div className="sidebar-user-info">
            <b>{sessionUser.name}</b>
            <small>{sessionUser.role || sessionUser.email}</small>
          </div>
          <button className="sidebar-logout-btn" title="Cerrar sesión" onClick={handleLogout}>
            ⇥ Salir
          </button>
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
            <span className={`role-badge ${isDirector ? 'director' : 'musician'}`}>{roleLabel}</span>

            {/* PWA Action Controls */}
            {canInstall && (
              <button
                className="pwa-install-btn"
                title="Instalar Music Folder en tu dispositivo"
                onClick={promptInstall}
              >
                📲 Instalar App
              </button>
            )}

            {hasUpdate && (
              <button
                className="pwa-update-btn-header"
                title="Nueva actualización lista. Cliqueá para actualizar."
                onClick={updateApp}
              >
                🔄 Actualizar App
              </button>
            )}

            <button
              title="Comprobar actualizaciones"
              onClick={checkForUpdates}
              className="pwa-check-updates-btn"
            >
              🔄
            </button>

            <button title="Búsqueda rápida">⌕</button>

            {/* Stitch UI Notification Bell Dropdown */}
            <div className="notification-bell-wrapper">
              <button
                className={`notification-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
                title="Notificaciones"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                🔔
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>

              {notificationsOpen && (
                <div className="notification-popover">
                  <div className="notif-header">
                    <div>
                      <strong>Notificaciones</strong>
                      <span className="notif-count-pill">{unreadCount} sin leer</span>
                    </div>
                    <div className="notif-header-actions">
                      {unreadCount > 0 && (
                        <button className="notif-read-all-btn" onClick={handleMarkAllAsRead}>
                          Marcar todo como leído
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button className="notif-clear-all-btn" onClick={handleClearAllNotifications}>
                          Vaciar todas
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="notif-filters">
                    <button
                      className={notifFilter === 'todas' ? 'active' : ''}
                      onClick={() => setNotifFilter('todas')}
                    >
                      Todas
                    </button>
                    <button
                      className={notifFilter === 'ensayos' ? 'active' : ''}
                      onClick={() => setNotifFilter('ensayos')}
                    >
                      Ensayos
                    </button>
                    <button
                      className={notifFilter === 'partituras' ? 'active' : ''}
                      onClick={() => setNotifFilter('partituras')}
                    >
                      Partituras
                    </button>
                    <button
                      className={notifFilter === 'asistencia' ? 'active' : ''}
                      onClick={() => setNotifFilter('asistencia')}
                    >
                      Asistencia
                    </button>
                  </div>

                  <div className="notif-list">
                    {filteredNotifications.length === 0 ? (
                      <div className="notif-empty">
                        <span>🔕</span>
                        <p>Sin notificaciones en esta categoría</p>
                      </div>
                    ) : (
                      filteredNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`notif-item ${notif.read ? 'read' : 'unread'} notif-${notif.type}`}
                          onClick={() => handleMarkAsRead(notif.id)}
                        >
                          <div className="notif-icon">
                            {notif.type === 'rehearsal_scheduled' && '🗓️'}
                            {notif.type === 'sheet_uploaded' && '🎼'}
                            {notif.type === 'attendance_marked' && '✅'}
                            {notif.type === 'student_joined' && '👤'}
                          </div>
                          <div className="notif-content">
                            <div className="notif-item-top">
                              <span className={`notif-tag tag-${notif.type}`}>
                                {notif.type === 'rehearsal_scheduled' && 'Ensayo'}
                                {notif.type === 'sheet_uploaded' && 'Partitura'}
                                {notif.type === 'attendance_marked' && 'Asistencia'}
                                {notif.type === 'student_joined' && 'Alumno'}
                              </span>
                              <span className="notif-time">{notif.timestamp}</span>
                            </div>
                            <strong>{notif.title}</strong>
                            <p>{notif.message}</p>
                          </div>
                          <div className="notif-actions">
                            <button
                              className="notif-delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notif.id);
                              }}
                              aria-label={`Eliminar notificación ${notif.title}`}
                              title={`Eliminar notificación ${notif.title}`}
                            >
                              ✕
                            </button>
                            {!notif.read && <div className="unread-dot" title="No leída" />}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="notif-footer">
                    <small>Sincronizado con MCP Stitch & Music Folder API</small>
                  </div>
                </div>
              )}
            </div>

            <button title="Asistente virtual" onClick={() => setAssistantOpen((open) => !open)}>✦</button>
            <button title="Cerrar sesión" onClick={handleLogout}>⇥</button>
            <div
              className="avatar"
              title={`${sessionUser.name} • Tocar para cerrar sesión`}
              onClick={handleLogout}
              style={{ cursor: 'pointer' }}
            >
              {sessionUser.name[0]?.toUpperCase() || 'V'}
            </div>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <h1>{dynamicHeading}</h1>
              <p>{subheading}</p>
            </div>
            <div className="page-heading-actions">
              {view === 'biblioteca' && (
                <>
                  <button className="primary" onClick={() => setShowUploadScoreModal(true)}>
                    + Subir partitura
                  </button>
                  <button className="btn-secondary" onClick={() => setShowPublicExplorer((s) => !s)}>
                    Explorar Dominio Público
                  </button>
                </>
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
          </div>

          {selectedGroupId && (
            <section className="panel" style={{ marginBottom: 18 }}>
              <div className="panel-title">
                <h2>{selectedGroup?.name || 'Grupo'}</h2>
                {isGroupDirector && (
                  <button className="btn-secondary" onClick={handleRegenerateGroupCode}>Renovar código</button>
                )}
              </div>

              <div className="filters group-workspace-tabs" style={{ margin: '12px 0' }}>
                {[
                  ['resumen', 'Resumen'],
                  ['biblioteca', 'Biblioteca'],
                  ['ensayos', 'Ensayos'],
                  ['comunidad', 'Comunidad'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    className={groupWorkspaceTab === key ? 'selected' : ''}
                    onClick={() => setGroupWorkspaceTab(key as any)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {groupWorkspaceTab === 'resumen' && (
                <>
                  <div className="form-row" style={{ marginBottom: 12 }}>
                    <div className="data-card">
                      <span>Grupo</span>
                      <strong>{selectedGroup?.name || 'Sin nombre'}</strong>
                    </div>
                    <div className="data-card">
                      <span>Código</span>
                      <strong>{canSeeGroupCode ? (selectedGroup?.join_code || '—') : 'Solo director'}</strong>
                    </div>
                    <div className="data-card">
                      <span>Rol</span>
                      <strong>{isGroupDirector || isDirector ? 'Director' : 'Músico'}</strong>
                    </div>
                  </div>

                  <div className="form-row" style={{ marginTop: 12 }}>
                    <div className="data-card">
                      <span>Miembros</span>
                      <strong>{groupMembers.length}</strong>
                    </div>
                    <div className="data-card">
                      <span>Biblioteca</span>
                      <strong>{groupLibrary.length}</strong>
                    </div>
                    <div className="data-card">
                      <span>Ensayos</span>
                      <strong>{groupRehearsals.length}</strong>
                    </div>
                    <div className="data-card">
                      <span>Mensajes</span>
                      <strong>{groupPosts.length}</strong>
                    </div>
                  </div>

                  <div className="panel-title" style={{ marginTop: 16 }}>
                    <h3>Miembros</h3>
                  </div>
                  <div className="stack-list">
                    {groupMembers.length === 0 ? <p>Sin miembros aún.</p> : groupMembers.map((member) => (
                      <div key={member.id} className="mini-card">
                        <strong>{member.user?.name || member.user?.email || 'Miembro'}</strong>
                        <small>{member.role || 'student'} · {member.status || 'active'}</small>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {groupWorkspaceTab === 'biblioteca' && (
                <>
                  <div className="form-row" style={{ marginBottom: 12 }}>
                    <input
                      value={newGroupLibraryItem.title}
                      onChange={(e) => setNewGroupLibraryItem({ ...newGroupLibraryItem, title: e.target.value })}
                      placeholder="Título de la partitura o recurso"
                    />
                    <input
                      value={newGroupLibraryItem.description}
                      onChange={(e) => setNewGroupLibraryItem({ ...newGroupLibraryItem, description: e.target.value })}
                      placeholder="Descripción"
                    />
                    <select value={newGroupLibraryItem.type} onChange={(e) => setNewGroupLibraryItem({ ...newGroupLibraryItem, type: e.target.value })}>
                      <option value="score">Partitura</option>
                      <option value="material">Material</option>
                      <option value="audio">Audio</option>
                    </select>
                    <button className="primary" onClick={handleCreateGroupLibraryItem}>Guardar</button>
                  </div>
                  <div className="stack-list">
                    {groupLibrary.length === 0 ? <p>Sin bibliografía todavía.</p> : groupLibrary.map((item) => (
                      <div key={item.id} className="mini-card">
                        <strong>{item.title}</strong>
                        <small>{item.description || 'Sin descripción'}</small>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {groupWorkspaceTab === 'ensayos' && (
                <>
                  <div className="form-row" style={{ marginBottom: 12 }}>
                    <input
                      value={newGroupRehearsal.title}
                      onChange={(e) => setNewGroupRehearsal({ ...newGroupRehearsal, title: e.target.value })}
                      placeholder="Título del ensayo"
                    />
                    <input
                      value={newGroupRehearsal.date}
                      onChange={(e) => setNewGroupRehearsal({ ...newGroupRehearsal, date: e.target.value })}
                      placeholder="Fecha"
                    />
                    <input
                      value={newGroupRehearsal.time}
                      onChange={(e) => setNewGroupRehearsal({ ...newGroupRehearsal, time: e.target.value })}
                      placeholder="Hora"
                    />
                    <input
                      value={newGroupRehearsal.location}
                      onChange={(e) => setNewGroupRehearsal({ ...newGroupRehearsal, location: e.target.value })}
                      placeholder="Lugar"
                    />
                    <button className="primary" onClick={handleCreateGroupRehearsal}>Programar</button>
                  </div>
                  <div className="stack-list">
                    {groupRehearsals.length === 0 ? <p>No hay ensayos programados.</p> : groupRehearsals.map((rehearsal) => (
                      <div key={rehearsal.id} className="mini-card">
                        <strong>{rehearsal.title}</strong>
                        <small>{rehearsal.date || 'Sin fecha'} · {rehearsal.time || 'Sin hora'} · {rehearsal.location || 'Sin lugar'}</small>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {groupWorkspaceTab === 'comunidad' && (
                <>
                  <div className="form-row" style={{ marginBottom: 12 }}>
                    <input
                      value={newGroupPost.title}
                      onChange={(e) => setNewGroupPost({ ...newGroupPost, title: e.target.value })}
                      placeholder="Título del mensaje"
                    />
                    <select value={newGroupPost.visibility} onChange={(e) => setNewGroupPost({ ...newGroupPost, visibility: e.target.value })}>
                      <option value="group">Grupo</option>
                      <option value="director">Director</option>
                    </select>
                  </div>
                  <textarea
                    rows={4}
                    value={newGroupPost.content}
                    onChange={(e) => setNewGroupPost({ ...newGroupPost, content: e.target.value })}
                    placeholder="Escribí una actualización para el grupo..."
                    style={{ width: '100%', marginBottom: 12 }}
                  />
                  <button className="primary" onClick={handleCreateGroupPost}>Publicar</button>
                  <div className="stack-list" style={{ marginTop: 16 }}>
                    {groupPosts.length === 0 ? <p>No hay mensajes del grupo todavía.</p> : groupPosts.map((post) => (
                      <div key={post.id} className="mini-card">
                        <strong>{post.title}</strong>
                        <small>{post.content}</small>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}

          {/* VISTA: INICIO */}
          {view === 'inicio' && (
            <>
              {selectedGroupId && (
                <section className="panel" style={{ marginBottom: 18 }}>
                  <div className="panel-title">
                    <h2>Espacio del grupo activo</h2>
                    <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)}>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row" style={{ marginTop: 12 }}>
                    <div className="data-card">
                      <span>Miembros</span>
                      <strong>{groupMembers.length}</strong>
                    </div>
                    <div className="data-card">
                      <span>Biblioteca</span>
                      <strong>{groupLibrary.length}</strong>
                    </div>
                    <div className="data-card">
                      <span>Ensayos</span>
                      <strong>{groupRehearsals.length}</strong>
                    </div>
                    <div className="data-card">
                      <span>Mensajes</span>
                      <strong>{groupPosts.length}</strong>
                    </div>
                  </div>
                </section>
              )}

              <section className={`hero ${isDirector ? 'hero-director' : 'hero-musician'}`}>
                <div>
                  <span className={`role-strip ${isDirector ? 'director' : 'musician'}`}>
                    {isDirector ? 'Modo Director' : 'Modo Músico'}
                  </span>
                  <p className="eyebrow">{isDirector ? 'PANEL DEL DIRECTOR' : 'ORQUESTA DE CÁMARA'}</p>
                  <h2>{roleHeroTitle}</h2>
                  <p>{roleHeroDescription}</p>
                  <button className="primary" onClick={() => setView(isDirector ? 'inicio' : 'biblioteca')}>
                    {roleHeroButton}
                  </button>
                </div>
                <div className="hero-note">{isDirector ? '🎼' : '𝄞'}</div>
              </section>

              <section className="metrics">
                <article className={`metric-card ${isDirector ? 'director' : 'musician'}`} style={{ cursor: 'pointer' }} onClick={() => setView('biblioteca')}>
                  <b>{scores.length}</b>
                  <span>Partituras activas</span>
                </article>
                <article className={`metric-card ${isDirector ? 'director' : 'musician'}`} style={{ cursor: 'pointer' }} onClick={() => setView('ensayos')}>
                  <b>{records.length}</b>
                  <span>Ensayos agendados</span>
                </article>
                <article className={`metric-card ${isDirector ? 'director' : 'musician'}`} style={{ cursor: 'pointer' }} onClick={() => setView('foro')}>
                  <b>{threads.length}</b>
                  <span>Publicaciones en Comunidad</span>
                </article>
              </section>

              <section className="two-col">
                <article className="panel">
                  <div className="panel-title">
                    <h2>Grupos</h2>
                    <button
                      className="btn-refresh-groups"
                      onClick={handleRefreshGroups}
                      disabled={isRefreshingGroups}
                      title="Recargar lista de grupos desde la API"
                    >
                      {isRefreshingGroups ? '↻ Recargando...' : 'Actualizar →'}
                    </button>
                  </div>

                  {canCreateGroups ? (
                    <>
                      <div className="form-group" style={{ marginBottom: 12 }}>
                        <label>Nombre del grupo</label>
                        <input
                          value={groupForm.name}
                          onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                          placeholder="Ej. Banda Sinfónica Juvenil"
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 12 }}>
                        <label>Descripción</label>
                        <input
                          value={groupForm.description}
                          onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                          placeholder="Descripción del grupo"
                        />
                      </div>

                      <div className="form-row" style={{ marginBottom: 12 }}>
                        <div className="form-group">
                          <label>Tipo</label>
                          <select value={groupForm.type} onChange={(e) => setGroupForm({ ...groupForm, type: e.target.value })}>
                            <option value="ensemble">Ensamble</option>
                            <option value="course">Curso</option>
                            <option value="studio">Estudio</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Visibilidad</label>
                          <select value={groupForm.visibility} onChange={(e) => setGroupForm({ ...groupForm, visibility: e.target.value })}>
                            <option value="private">Privado</option>
                            <option value="invite_only">Invitación</option>
                            <option value="public">Público</option>
                          </select>
                        </div>
                      </div>

                      <button className="primary" onClick={handleCreateGroup} style={{ marginBottom: 12 }}>
                        Crear grupo
                      </button>
                    </>
                  ) : (
                    <div className="role-locked-card" style={{ marginBottom: 12 }}>
                      <strong>Acceso por código</strong>
                      <p>Solo el director puede crear grupos y ver el código del grupo.</p>
                    </div>
                  )}

                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label>Código del grupo</label>
                    <input
                      value={joinGroupCode}
                      onChange={(e) => setJoinGroupCode(e.target.value)}
                      placeholder="Ej. ABCD1234"
                    />
                  </div>

                  <button className="btn-secondary" onClick={handleJoinGroup}>
                    Unirme por código
                  </button>

                  {groupStatus && (
                    <p style={{ marginTop: 12, color: '#1a237e', fontSize: 13 }}>{groupStatus}</p>
                  )}

                  {groups.length > 0 && (
                    <div style={{ marginTop: 18 }}>
                      {groups.slice(0, 3).map((group) => (
                        <div key={group.id} style={{ border: '1px solid #ececf3', borderRadius: 10, padding: 12, marginBottom: 8, cursor: 'pointer' }} onClick={() => setSelectedGroupId(group.id)}>
                          <strong>{group.name}</strong>
                          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{group.description || 'Grupo musical'}</div>
                          {canSeeGroupCode && (
                            <div style={{ fontSize: 12, color: '#444', marginTop: 6 }}>Código: <b>{group.join_code}</b></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </article>

                <article className="panel">
                  <div className="panel-title">
                    <h2>Próximos ensayos</h2>
                    <button onClick={() => setView('ensayos')}>Ver calendario →</button>
                  </div>
                  {records.map((r) => {
                    const badge = parseRehearsalDateBadge(r.date);
                    return (
                      <div className="agenda-card" key={r.id} onClick={() => setSelectedRecord(r)}>
                        <div className="rehearsal-date-badge">
                          <span className="badge-day">{badge.day}</span>
                          <span className="badge-sub">{badge.sub}</span>
                        </div>
                        <div className="rehearsal-details">
                          <strong className="rehearsal-title">{r.title}</strong>
                          <div className="rehearsal-time">
                            <i className="clock-icon">⏱</i> {r.time || 'Horario por confirmar'}
                          </div>
                          {r.venue && <div className="rehearsal-venue">📍 {r.venue}</div>}
                        </div>
                      </div>
                    );
                  })}
                </article>
              </section>

              <section className="two-col" style={{ marginTop: 18 }}>
                <article className="panel">
                  <div className="panel-title">
                    <h2>Actividad reciente</h2>
                    <button onClick={() => setView('foro')}>Ver foro →</button>
                  </div>
                  <p className="activity">✦ {sessionUser.name.split(' ')[0]} subió <b>Sinfonía n.º 5</b></p>
                  <p className="activity">✦ Se agendó el <b>Ensayo General</b></p>
                  <p className="activity">✦ Hay {threads.reduce((acc, t) => acc + (t.comments?.length || 0), 0)} respuestas en la Comunidad</p>
                </article>
              </section>
            </>
          )}

          {/* VISTA: BIBLIOTECA */}
          {view === 'biblioteca' && (
            <>
              {showPublicExplorer && (
                <div style={{ margin: '16px 0', padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input placeholder="Buscar en dominio público (Beethoven, orquesta...)" value={publicQuery} onChange={(e) => setPublicQuery(e.target.value)} />
                    <button className="primary" onClick={async () => {
                      const res = await api.searchPublicScores(publicQuery || 'orchestra');
                      setPublicResults(res || []);
                    }}>Buscar</button>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    {publicResults.length === 0 ? <small>No hay resultados aún</small> : (
                      <div>
                        {publicResults.map((r: any) => (
                          <div key={r.sourceUrl} style={{ padding: 8, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong>{r.title}</strong>
                              <div style={{ fontSize: 13, color: '#666' }}>{r.composer || ''} · {r.instrumentation || ''}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={async (e) => {
                                e.stopPropagation();
                                const imported = await api.importPublicScore({ title: r.title, composer: r.composer, pdfUrl: r.pdfUrl, sourceUrl: r.sourceUrl, instrumentation: r.instrumentation });
                                if (imported) {
                                  setScores((prev) => [imported, ...prev]);
                                  setToastMessage({ title: 'Importada', body: `${r.title} importada a tu biblioteca`, icon: '🎼' });
                                }
                              }}>Importar a mi agrupación</button>
                              <button onClick={(e) => { e.stopPropagation(); window.open(r.pdfUrl || r.sourceUrl, '_blank'); }}>Ver PDF</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button className="more" title="Ver detalles">•••</button>
                      <button
                        title="Descargar PDF"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(api.getScoreDownloadUrl(score.id), '_blank');
                        }}
                      >
                        ⬇
                      </button>
                      <button
                        title="Ver partitura"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`${api.getScoreDownloadUrl(score.id)}?inline=1`, '_blank');
                        }}
                      >
                        👁
                      </button>
                    </div>
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
                  {records.map((r) => {
                    const badge = parseRehearsalDateBadge(r.date);
                    return (
                      <div className="agenda-card" key={r.id} onClick={() => setSelectedRecord(r)}>
                        <div className="rehearsal-date-badge">
                          <span className="badge-day">{badge.day}</span>
                          <span className="badge-sub">{badge.sub}</span>
                        </div>
                        <div className="rehearsal-details">
                          <strong className="rehearsal-title">{r.title} ({r.type})</strong>
                          <div className="rehearsal-time">
                            <i className="clock-icon">⏱</i> {r.time || 'Horario por confirmar'}
                          </div>
                          {r.venue && <div className="rehearsal-venue">📍 {r.venue}</div>}
                        </div>
                      </div>
                    );
                  })}
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

      <div className="assistant-widget">
        <button className="assistant-toggle" onClick={() => setAssistantOpen((open) => !open)}>
          <span>✦</span>
          Asistente virtual
        </button>

        {assistantOpen && (
          <div className="assistant-panel">
            <div className="assistant-header">
              <strong>Ayuda rápida</strong>
              <small>Responde sobre ensayos, repertorio y comunidad</small>
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
                placeholder="Preguntá por repertorio, ensayos o coordinación..."
              />
              <button type="submit" className="primary">Enviar</button>
            </form>
          </div>
        )}
      </div>

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
                <div className="form-group">
                  <label>Archivo PDF (opcional)</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setNewScoreFile((e.target as HTMLInputElement).files?.[0] || null)}
                  />
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
              <button
                className="primary"
                onClick={() => window.open(api.getScoreDownloadUrl(selectedScore.id), '_blank')}
              >
                Descargar PDF ⬇
              </button>
              <button
                className="primary"
                onClick={() => window.open(`${api.getScoreDownloadUrl(selectedScore.id)}?inline=1`, '_blank')}
                style={{ marginLeft: 8 }}
              >
                Ver partitura 👁
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

      {/* MODAL DETALLE: ENSAYO CON REGISTRO DE ASISTENCIA */}
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

              <div style={{ marginTop: '16px', padding: '14px', background: '#f4f5fd', borderRadius: '12px', border: '1px solid #e0e2e8' }}>
                <strong style={{ color: '#1a237e', display: 'block', marginBottom: '8px', fontSize: '13px' }}>
                  Registrar Asistencia & Notificar a la Agrupación
                </strong>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className="primary"
                    style={{ background: '#2e7d32', padding: '8px 12px', fontSize: '13px' }}
                    onClick={() => handleRecordAttendance('presente')}
                  >
                    ✓ Confirmar Presente
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '13px' }}
                    onClick={() => handleRecordAttendance('justificado')}
                  >
                    📝 Justificado
                  </button>
                  <button
                    className="btn-danger"
                    style={{ padding: '8px 12px', fontSize: '13px' }}
                    onClick={() => handleRecordAttendance('ausente')}
                  >
                    ✕ Ausente
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedRecord(null)}>
                Cerrar
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

      {/* STITCH UI TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="toast-notification">
          <span className="toast-icon">{toastMessage.icon}</span>
          <div className="toast-body">
            <strong>{toastMessage.title}</strong>
            <p>{toastMessage.body}</p>
          </div>
          <button className="toast-close" onClick={() => setToastMessage(null)}>Cerrar</button>
        </div>
      )}
    </div>
  );
}
