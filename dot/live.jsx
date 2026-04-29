// dot/live.jsx — провод к Supabase для интерактивного прототипа.
//
// Что это: тонкий слой между UI и базой. UI вызывает window.live.signIn(...)
// и не знает ничего о Supabase. Если завтра поменяем бэкенд — правим только этот файл.
//
// Анон-ключ публичен по дизайну: вся защита в БД (Row Level Security),
// которая сама проверяет, что пользователь видит только свои данные.

const SUPABASE_URL = 'https://yhhqctadcqjdsuhyhlvv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_m8B9O9-1ijFrjckj9foerg_3GFA6xtN';

if (!window.supabase) {
  console.error('[dot.live] Supabase SDK не загружен. Проверь <script> в HTML.');
}
const sb = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
window.sb = sb;

// ── Маппинг БД-задачи → UI-форма (как в window.TASKS) ──────────
function bucketFromDueAt(due) {
  if (!due) return 'Без даты';
  const d = new Date(due);
  const startToday = new Date(); startToday.setHours(0, 0, 0, 0);
  const startTomorrow = new Date(startToday); startTomorrow.setDate(startTomorrow.getDate() + 1);
  const endTomorrow = new Date(startTomorrow); endTomorrow.setDate(endTomorrow.getDate() + 1);
  const endWeek = new Date(startToday); endWeek.setDate(endWeek.getDate() + 7);
  if (d < startToday)    return 'Просрочено';
  if (d < startTomorrow) return 'Сегодня';
  if (d < endTomorrow)   return 'Завтра';
  if (d < endWeek)       return 'На неделе';
  return 'Позже';
}
function prioFromDb(p) {
  if (p === 'urgent') return 'urgent';
  if (p === 'high' || p === 'medium') return 'normal';
  if (p === 'low') return 'low';
  return null;
}
function toUiTask(t) {
  return {
    id: t.id,
    title: t.title,
    done: t.done,
    when: bucketFromDueAt(t.due_at),
    prio: prioFromDb(t.priority),
    dueIso: t.due_at,
  };
}

// ── Публичный API ──────────────────────────────────────────────
window.live = {
  async signIn(email, password) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    return { user: data?.user || null, error };
  },

  async signUp(email, password, name) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const { data, error } = await sb.auth.signUp({
      email, password,
      options: { data: { name } },
    });
    return { user: data?.user || null, session: data?.session || null, error };
  },

  async resetPassword(email) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const { error } = await sb.auth.resetPasswordForEmail(email);
    return { error };
  },

  async signOut() {
    if (sb) await sb.auth.signOut();
  },

  // Google OAuth. Чтобы заработало: в Supabase Dashboard → Authentication →
  // Providers включить Google и вставить Client ID + Client Secret из
  // Google Cloud Console (см. инструкцию в README).
  async signInWithGoogle() {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    return { error };
  },

  async getUser() {
    if (!sb) return null;
    const { data } = await sb.auth.getUser();
    return data?.user || null;
  },

  onAuthChange(cb) {
    if (!sb) return () => {};
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      cb(session?.user || null);
    });
    return () => sub.subscription.unsubscribe();
  },

  async loadTasks() {
    if (!sb) return { tasks: [], error: { message: 'Supabase не подключён' } };
    const { data, error } = await sb.from('tasks')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    return { tasks: (data || []).map(toUiTask), error };
  },

  async toggleTask(id, done) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const { error } = await sb.from('tasks')
      .update({ done, done_at: done ? new Date().toISOString() : null })
      .eq('id', id);
    return { error };
  },

  // dueIso: ISO-строка (например, '2026-04-29T12:00:00.000Z') или null = «без даты»
  async createTask(title, dueIso = null, priority = null) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const user = await this.getUser();
    if (!user) return { error: { message: 'Не авторизован' } };

    const { data, error } = await sb.from('tasks')
      .insert({ owner_id: user.id, title, due_at: dueIso, priority })
      .select()
      .single();
    return { task: data ? toUiTask(data) : null, error };
  },

  async updateTask(id, { title, dueIso, priority }) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const patch = {};
    if (title !== undefined)    patch.title = title;
    if (dueIso !== undefined)   patch.due_at = dueIso;
    if (priority !== undefined) patch.priority = priority;
    const { data, error } = await sb.from('tasks')
      .update(patch).eq('id', id).select().single();
    return { task: data ? toUiTask(data) : null, error };
  },

  async restoreTask(id) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const { error } = await sb.from('tasks')
      .update({ deleted_at: null }).eq('id', id);
    return { error };
  },

  async updateProfile({ name, avatar_url }) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const user = await this.getUser();
    if (!user) return { error: { message: 'Не авторизован' } };
    const patch = {};
    if (name !== undefined)       patch.name = name;
    if (avatar_url !== undefined) patch.avatar_url = avatar_url;
    const { data, error } = await sb.from('profiles')
      .update(patch).eq('id', user.id).select().single();
    return { profile: data, error };
  },

  async updatePlan(plan) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const user = await this.getUser();
    if (!user) return { error: { message: 'Не авторизован' } };
    if (plan !== 'free' && plan !== 'plus') return { error: { message: 'Неверный тариф' } };
    const { data, error } = await sb.from('profiles')
      .update({ plan }).eq('id', user.id).select().single();
    return { profile: data, error };
  },

  async deleteAccount() {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const { error } = await sb.rpc('delete_my_account');
    if (!error) await sb.auth.signOut();
    return { error };
  },

  async updateAuthEmail(newEmail) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const { data, error } = await sb.auth.updateUser({ email: newEmail });
    return { user: data?.user, error };
  },

  async uploadAvatar(file) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const user = await this.getUser();
    if (!user) return { error: { message: 'Не авторизован' } };
    const ext = (file.name?.split('.').pop() || 'png').toLowerCase();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await sb.storage.from('images').upload(path, file, {
      cacheControl: '3600', upsert: false,
    });
    if (upErr) return { error: upErr };
    const { data } = sb.storage.from('images').getPublicUrl(path);
    return { url: data?.publicUrl || null };
  },

  async loadProfile() {
    if (!sb) return { profile: null, error: { message: 'Supabase не подключён' } };
    const user = await this.getUser();
    if (!user) return { profile: null, error: { message: 'Не авторизован' } };
    const { data, error } = await sb.from('profiles')
      .select('id, email, name, avatar_url, plan')
      .eq('id', user.id)
      .single();
    return { profile: data, error };
  },

  async loadStats() {
    if (!sb) return { stats: null };
    const { count: taskCount } = await sb.from('tasks')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null);

    // «Дней подряд» = самая длинная текущая серия из всех привычек.
    const { habits } = await this.loadHabits();
    let streak = 0;
    for (const h of (habits || [])) {
      const { streak: s } = await this.loadStreak(h.id);
      if (s > streak) streak = s;
    }

    return { stats: { tasks: taskCount ?? 0, streak, pages: 0 } };
  },

  async deleteTask(id) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const { error } = await sb.from('tasks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    return { error };
  },

  // ── Привычки ────────────────────────────────────────────────
  async loadHabits() {
    if (!sb) return { habits: [], error: { message: 'Supabase не подключён' } };
    const { data, error } = await sb.from('habits')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: true });
    return { habits: data || [], error };
  },

  async loadLogsForWeek(refDate = new Date()) {
    if (!sb) return { logs: new Map(), error: { message: 'Supabase не подключён' } };
    const monday = mondayOf(refDate);
    const sunday = new Date(monday); sunday.setDate(sunday.getDate() + 6);
    const { data, error } = await sb.from('habit_logs')
      .select('habit_id, date')
      .gte('date', ymd(monday))
      .lte('date', ymd(sunday));
    const logs = new Map();
    (data || []).forEach((l) => {
      if (!logs.has(l.habit_id)) logs.set(l.habit_id, new Set());
      logs.get(l.habit_id).add(l.date);
    });
    return { logs, error };
  },

  async loadStreak(habitId) {
    if (!sb) return { streak: 0 };
    const today = new Date(); today.setHours(0,0,0,0);
    const back = new Date(today); back.setDate(back.getDate() - 60);
    const { data } = await sb.from('habit_logs')
      .select('date')
      .eq('habit_id', habitId)
      .gte('date', ymd(back))
      .lte('date', ymd(today));
    const set = new Set((data || []).map(l => l.date));
    let streak = 0;
    let cursor = new Date(today);
    if (!set.has(ymd(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (set.has(ymd(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return { streak };
  },

  async toggleHabitDay(habitId, date = new Date()) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const user = await this.getUser();
    if (!user) return { error: { message: 'Не авторизован' } };
    const dateIso = ymd(date);
    const { data: existing } = await sb.from('habit_logs')
      .select('id').eq('habit_id', habitId).eq('date', dateIso).limit(1);
    if (existing && existing.length) {
      const { error } = await sb.from('habit_logs').delete().eq('id', existing[0].id);
      return { done: false, error };
    }
    const { error } = await sb.from('habit_logs')
      .insert({ habit_id: habitId, owner_id: user.id, date: dateIso, count: 1 });
    return { done: true, error };
  },

  async createHabit({ title, color = '#6E2BF5', repeat = 'daily', goal = 7, reminder = null }) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const user = await this.getUser();
    if (!user) return { error: { message: 'Не авторизован' } };
    const { data, error } = await sb.from('habits')
      .insert({
        owner_id: user.id, title, color,
        schedule: { type: repeat },
        goal_per_day: 1, // в день — оставляем 1, недельная цель отдельно через schedule.goalPerWeek
        reminder_at: reminder, // 'HH:MM' or null
      })
      // goal_per_week сохраняем в schedule jsonb, чтобы не менять схему
      .select().single();
    if (data && goal !== 7) {
      // Сохраняем недельную цель в schedule.goalPerWeek
      await sb.from('habits').update({ schedule: { type: repeat, goalPerWeek: goal } }).eq('id', data.id);
      data.schedule = { type: repeat, goalPerWeek: goal };
    }
    return { habit: data, error };
  },

  async updateHabit(id, { title, color, repeat, goal, reminder }) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const patch = {};
    if (title !== undefined) patch.title = title;
    if (color !== undefined) patch.color = color;
    if (reminder !== undefined) patch.reminder_at = reminder;
    if (repeat !== undefined || goal !== undefined) {
      const sched = { type: repeat || 'daily' };
      if (goal !== undefined && goal !== 7) sched.goalPerWeek = goal;
      patch.schedule = sched;
    }
    const { data, error } = await sb.from('habits')
      .update(patch).eq('id', id).select().single();
    return { habit: data, error };
  },

  async deleteHabit(id) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const { error } = await sb.from('habits')
      .update({ deleted_at: new Date().toISOString() }).eq('id', id);
    return { error };
  },

  async restoreHabit(id) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const { error } = await sb.from('habits')
      .update({ deleted_at: null }).eq('id', id);
    return { error };
  },

  // ── База знаний: пространства ──────────────────────────────
  async loadSpaces() {
    if (!sb) return { spaces: [], error: { message: 'Supabase не подключён' } };
    const { data, error } = await sb.from('spaces')
      .select('*')
      .is('deleted_at', null)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true });
    return { spaces: data || [], error };
  },

  async createSpace({ name, icon = 'briefcase', color = '#6E2BF5', description = '' }) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const user = await this.getUser();
    if (!user) return { error: { message: 'Не авторизован' } };
    // icon в БД — text. Храним {key, color, description} в JSON-строке для Phase 1,
    // потому что схема spaces имеет только поле icon (text).
    const meta = JSON.stringify({ key: icon, color, description });
    const { data, error } = await sb.from('spaces')
      .insert({ owner_id: user.id, name, icon: meta })
      .select().single();
    return { space: data, error };
  },

  async updateSpace(id, { name, icon, color, description }) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const patch = {};
    if (name !== undefined) patch.name = name;
    if (icon !== undefined || color !== undefined || description !== undefined) {
      // Перечитываем существующие meta, мерджим
      const { data: cur } = await sb.from('spaces').select('icon').eq('id', id).single();
      let meta = {};
      try { meta = cur?.icon ? JSON.parse(cur.icon) : {}; } catch (_) { meta = { key: cur?.icon || 'briefcase' }; }
      if (icon !== undefined) meta.key = icon;
      if (color !== undefined) meta.color = color;
      if (description !== undefined) meta.description = description;
      patch.icon = JSON.stringify(meta);
    }
    const { data, error } = await sb.from('spaces')
      .update(patch).eq('id', id).select().single();
    return { space: data, error };
  },

  async deleteSpace(id) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const { error } = await sb.from('spaces')
      .update({ deleted_at: new Date().toISOString() }).eq('id', id);
    return { error };
  },

  async restoreSpace(id) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const { error } = await sb.from('spaces')
      .update({ deleted_at: null }).eq('id', id);
    return { error };
  },

  async duplicateSpace(id) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const user = await this.getUser();
    if (!user) return { error: { message: 'Не авторизован' } };
    const { spaces } = await this.loadSpaces();
    const src = spaces.find((s) => s.id === id);
    if (!src) return { error: { message: 'Пространство не найдено' } };
    const { data, error } = await sb.from('spaces')
      .insert({ owner_id: user.id, name: src.name + ' · копия', icon: src.icon })
      .select().single();
    return { space: data, error };
  },

  // ── База знаний: страницы ──────────────────────────────────
  async loadPages(spaceId) {
    if (!sb) return { pages: [], error: { message: 'Supabase не подключён' } };
    let q = sb.from('pages').select('*').is('deleted_at', null);
    if (spaceId) q = q.eq('space_id', spaceId);
    q = q.order('position', { ascending: true }).order('created_at', { ascending: true });
    const { data, error } = await q;
    return { pages: data || [], error };
  },

  async loadPage(id) {
    if (!sb) return { page: null };
    const { data, error } = await sb.from('pages').select('*').eq('id', id).single();
    return { page: data, error };
  },

  async createPage({ spaceId, parentPageId = null, title = '' }) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const user = await this.getUser();
    if (!user) return { error: { message: 'Не авторизован' } };
    const { data, error } = await sb.from('pages')
      .insert({
        space_id: spaceId,
        parent_page_id: parentPageId,
        owner_id: user.id,
        last_editor_id: user.id,
        title,
      })
      .select().single();
    return { page: data, error };
  },

  async updatePage(id, { title, blocks, properties, icon }) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const user = await this.getUser();
    const patch = { last_editor_id: user?.id };
    if (title !== undefined)      patch.title = title;
    if (blocks !== undefined)     patch.blocks = blocks;
    if (properties !== undefined) patch.properties = properties;
    if (icon !== undefined)       patch.icon = icon;
    const { data, error } = await sb.from('pages')
      .update(patch).eq('id', id).select().single();
    return { page: data, error };
  },

  async deletePage(id) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const { error } = await sb.from('pages')
      .update({ deleted_at: new Date().toISOString() }).eq('id', id);
    return { error };
  },

  async restorePage(id) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const { error } = await sb.from('pages')
      .update({ deleted_at: null }).eq('id', id);
    return { error };
  },

  async togglePin(kind, id) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const table = kind === 'space' ? 'spaces' : 'pages';
    const { data: cur } = await sb.from(table).select('pinned_at').eq('id', id).single();
    const next = cur?.pinned_at ? null : new Date().toISOString();
    const { error } = await sb.from(table).update({ pinned_at: next }).eq('id', id);
    return { error, pinned: !!next };
  },

  // Загрузка изображения в Supabase Storage. Бакет 'images' должен быть создан
  // в Supabase Dashboard → Storage → New bucket → name: images, Public: yes.
  async uploadImage(file) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const user = await this.getUser();
    if (!user) return { error: { message: 'Не авторизован' } };
    const ext = (file.name?.split('.').pop() || 'png').toLowerCase();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await sb.storage.from('images').upload(path, file, {
      cacheControl: '3600', upsert: false,
    });
    if (upErr) return { error: upErr };
    const { data } = sb.storage.from('images').getPublicUrl(path);
    return { url: data?.publicUrl || null };
  },

  async duplicatePage(id) {
    if (!sb) return { error: { message: 'Supabase не подключён' } };
    const user = await this.getUser();
    if (!user) return { error: { message: 'Не авторизован' } };
    const { page: src } = await this.loadPage(id);
    if (!src) return { error: { message: 'Страница не найдена' } };
    const { data, error } = await sb.from('pages')
      .insert({
        space_id: src.space_id,
        parent_page_id: src.parent_page_id,
        owner_id: user.id,
        last_editor_id: user.id,
        title: (src.title || 'Без заголовка') + ' · копия',
        blocks: src.blocks || [],
        properties: src.properties || [],
        icon: src.icon,
      })
      .select().single();
    return { page: data, error };
  },
};

function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function mondayOf(d) {
  const x = new Date(d); x.setHours(0,0,0,0);
  const dow = x.getDay() === 0 ? 7 : x.getDay();
  x.setDate(x.getDate() - (dow - 1));
  return x;
}
window.dotLiveHelpers = { ymd, mondayOf };

// ─── Тема (localStorage) ───────────────────────────────────────
const THEME_VARS = {
  light: { '--bg':'#F5F5F7','--surface':'#FFFFFF','--text':'#111','--sub':'rgba(60,60,67,0.6)','--line':'rgba(60,60,67,0.12)','--chip':'rgba(0,0,0,0.04)' },
  dark:  { '--bg':'#000000','--surface':'#1C1C1E','--text':'#FFF','--sub':'rgba(235,235,245,0.6)','--line':'rgba(84,84,88,0.5)','--chip':'rgba(255,255,255,0.06)' },
  warm:  { '--bg':'#F4F0E8','--surface':'#FBF8F1','--text':'#2A2418','--sub':'rgba(42,36,24,0.6)','--line':'rgba(42,36,24,0.1)','--chip':'rgba(42,36,24,0.04)' },
};
window.dotTheme = {
  get() { return localStorage.getItem('dot-theme') || 'light'; },
  set(name) {
    const vars = THEME_VARS[name] || THEME_VARS.light;
    Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
    localStorage.setItem('dot-theme', name);
  },
  apply() { window.dotTheme.set(window.dotTheme.get()); },
};
window.dotTheme.apply();
