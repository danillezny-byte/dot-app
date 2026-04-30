import React from 'react';
import {
  IconBook, IconBriefcase, IconCalendar, IconCamera, IconCheck, IconCheckSquare,
  IconChevronDown, IconChevronLeft, IconChevronRight, IconCompass, IconExternalLink,
  IconFile, IconFlag, IconFlame, IconFolder, IconHash, IconHeart, IconInfo,
  IconLink, IconList, IconLogOut, IconMore, IconPin, IconPlus, IconPlusSmall,
  IconRepeat, IconSearch, IconSettings, IconSlash, IconStar, IconTrash, IconType, IconUser,
} from './icons.jsx';
import { Button, Logo } from './phone.jsx';
import { live as liveApi, sb, dotErr, dotHaptic, dotToast, dotLiveHelpers } from './live.jsx';
import { TASKS, HABITS, BASE_TREE, PINNED_PAGES } from './tokens.jsx';
import { AddTaskComposer, AddPageComposer } from './composers.jsx';
import { ComposerFullscreen, ComposerFullscreenHabit } from './composer-variants.jsx';
import { BaseEmpty, CreateSpaceSheet } from './note-editor.jsx';
// Main app — rebuilt to match real dot. visuals.
// Structure: Header (logo + ⋯), body, FAB, bottom tabs (no labels glyphs only).
// Tabs: Задачи · Привычки · База · Профиль

const { useState: useStateH, useEffect: useEffectH, useRef: useRefH } = React;

function Home({ onGo, initialTab, live }) {
  const [tab, setTab] = useStateH(initialTab || 'tasks');
  // initial state из кэша → первый paint без пустого экрана.
  // Если кэша нет (первый заход) — пустой массив, грузим как раньше.
  const [tasks, setTasks] = useStateH(live ? (liveApi?.getCachedTasks?.() || []) : TASKS);
  // loading = true только если КЭША НЕТ. Если есть — UI уже показывает данные,
  // фоновый рефреш проходит молча.
  const [loading, setLoading] = useStateH(!!live && !(liveApi?.getCachedTasks?.() || []).length);
  const [composerOpen, setComposerOpen] = useStateH(false);
  const [editingTask, setEditingTask] = useStateH(null); // task object or null
  const [habitComposerOpen, setHabitComposerOpen] = useStateH(false);
  const [editingHabit, setEditingHabit] = useStateH(null);
  const [habitsTick, setHabitsTick] = useStateH(0); // increment to force HabitsView reload
  const [tasksTick, setTasksTick] = useStateH(0);   // increment to force tasks reload (pull-to-refresh)
  const [baseRoute, setBaseRoute] = useStateH({ kind: 'tree' });
  const [baseTick, setBaseTick] = useStateH(0); // force base reload after CRUD
  const [editingSpace, setEditingSpace] = useStateH(null);
  const [actionSheet, setActionSheet] = useStateH(null); // { kind: 'space'|'page', target: {...} }
  const [movePicker, setMovePicker] = useStateH(null); // { pageId, currentSpaceId, currentParentId }
  const [undoToast, setUndoToast] = useStateH(null); // { kind, id, snapshot, label }

  useEffectH(() => {
    if (!live || !liveApi) return;
    let cancelled = false;
    (async () => {
      const { tasks: fetched, error } = await liveApi.loadTasks();
      if (cancelled) return;
      if (!error) setTasks(fetched);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [live, tasksTick]);

  // pull-to-refresh: вызывается из PullToRefresh-компонента вокруг scroll-зоны
  // в зависимости от текущего таба. Возвращает Promise — индикатор крутится
  // до его resolve.
  const onPullRefresh = async () => {
    dotHaptic?.('light');
    if (tab === 'tasks') {
      setTasksTick(t => t + 1);
      // Ждём один RAF чтобы дать React смонтировать новый useEffect и
      // выпустить запрос. Реальное время refresh — в loadTasks; UI скрывает
      // спиннер сразу после следующего рендера. Достаточно для ощущения «работает».
      await new Promise(r => setTimeout(r, 400));
    } else if (tab === 'habits') {
      setHabitsTick(t => t + 1);
      await new Promise(r => setTimeout(r, 400));
    } else if (tab === 'base') {
      setBaseTick(t => t + 1);
      await new Promise(r => setTimeout(r, 400));
    }
  };

  // Подгружаем space-данные когда заходим в edit-space
  useEffectH(() => {
    if (baseRoute.kind !== 'edit-space' || !liveApi) return;
    let cancelled = false;
    (async () => {
      const { spaces } = await liveApi.loadSpaces();
      if (cancelled) return;
      setEditingSpace(spaces.find((s) => s.id === baseRoute.id) || null);
    })();
    return () => { cancelled = true; };
  }, [baseRoute.kind, baseRoute.id]);

  // auto-dismiss undo toast after 5s
  useEffectH(() => {
    if (!undoToast) return;
    const t = setTimeout(() => setUndoToast(null), 5000);
    return () => clearTimeout(t);
  }, [undoToast]);

  const toggle = (id) => {
    dotHaptic?.('light');
    setTasks((ts) => ts.map((t) => t.id === id ? { ...t, done: !t.done } : t));
    if (live && liveApi) {
      const cur = tasks.find((t) => t.id === id);
      if (cur) liveApi.toggleTask(id, !cur.done);
    }
  };

  const openComposer = () => { setEditingTask(null); setComposerOpen(true); };
  const openEditor   = (task) => { setEditingTask(task); setComposerOpen(true); };
  const closeComposer = () => { setComposerOpen(false); setEditingTask(null); };

  const openHabitComposer = () => { setEditingHabit(null); setHabitComposerOpen(true); };
  const openHabitEditor   = (h) => { setEditingHabit(h); setHabitComposerOpen(true); };
  const closeHabitComposer = () => { setHabitComposerOpen(false); setEditingHabit(null); };

  const handleFab = () => {
    if (tab === 'habits') openHabitComposer();
    else if (tab === 'base') {
      // На вкладке Базы FAB-плюс делает контекстное действие:
      // tree → создать пространство; внутри пространства → создать страницу
      if (baseRoute.kind === 'space') {
        // Создание страницы делегируется через setBaseRoute → BaseViewLive перехватит,
        // но проще: вызываем createPage здесь.
        (async () => {
          const { page, error } = await liveApi.createPage({ spaceId: baseRoute.id, title: '' });
          if (error) { dotToast(dotErr(error), 'error'); return; }
          if (page) setBaseRoute({ kind: 'page', id: page.id, spaceId: baseRoute.id });
          setBaseTick((n) => n + 1);
        })();
      } else {
        // tree (или edit-space, create-space — фоллбэк к созданию)
        setBaseRoute({ kind: 'create-space' });
      }
    }
    else openComposer();
  };

  const handleHabitSubmit = async ({ title, color, repeat, goal, reminder }) => {
    if (!liveApi) return;
    if (editingHabit) {
      await liveApi.updateHabit(editingHabit.id, { title, color, repeat, goal, reminder });
    } else {
      await liveApi.createHabit({ title, color, repeat, goal, reminder });
    }
    setHabitsTick((n) => n + 1);
  };

  const handleHabitDelete = async () => {
    if (!editingHabit || !liveApi) return;
    const id = editingHabit.id;
    const snapshot = editingHabit;
    await liveApi.deleteHabit(id);
    setHabitsTick((n) => n + 1);
    setUndoToast({ kind: 'habit', id, snapshot, label: 'Привычка удалена' });
  };

  // ── База: создание/редактирование пространства ──
  const handleSpaceSubmit = async ({ name, description, icon, color }) => {
    if (!liveApi) return;
    if (baseRoute.kind === 'edit-space') {
      await liveApi.updateSpace(baseRoute.id, { name, description, icon, color });
      setBaseRoute({ kind: 'space', id: baseRoute.id });
    } else {
      const { space } = await liveApi.createSpace({ name, description, icon, color });
      if (space) setBaseRoute({ kind: 'space', id: space.id });
    }
    setBaseTick((n) => n + 1);
  };

  const handleSpaceDelete = async () => {
    if (baseRoute.kind !== 'edit-space' || !liveApi) return;
    const id = baseRoute.id;
    const { spaces } = await liveApi.loadSpaces();
    const snapshot = spaces.find((s) => s.id === id);
    await liveApi.deleteSpace(id);
    setBaseRoute({ kind: 'tree' });
    setBaseTick((n) => n + 1);
    setUndoToast({ kind: 'space', id, snapshot, label: 'Пространство удалено' });
  };

  const handlePageDelete = async (pageId, spaceId) => {
    if (!liveApi) return;
    const { page: snapshot } = await liveApi.loadPage(pageId);
    await liveApi.deletePage(pageId);
    setBaseRoute({ kind: 'space', id: spaceId });
    setBaseTick((n) => n + 1);
    setUndoToast({ kind: 'page', id: pageId, snapshot, label: 'Страница удалена' });
  };

  // ── Действия по строке: пространство ──
  const handleSpaceAction = (space) => {
    setActionSheet({ kind: 'space', target: space });
  };
  const handlePageAction = (page) => {
    setActionSheet({ kind: 'page', target: page });
  };

  const performSpaceAction = async (action) => {
    if (!actionSheet || actionSheet.kind !== 'space') return;
    const sp = actionSheet.target;
    setActionSheet(null);
    if (action === 'rename')    setBaseRoute({ kind: 'edit-space', id: sp.id });
    else if (action === 'duplicate') {
      await liveApi.duplicateSpace(sp.id);
      setBaseTick((n) => n + 1);
    }
    else if (action === 'pin') {
      const { error } = await liveApi.togglePin('space', sp.id);
      if (error) dotToast('Закрепление недоступно — выполни SQL-миграцию из README', 'error');
      setBaseTick((n) => n + 1);
    }
    else if (action === 'delete') {
      if (!window.confirm(`Удалить пространство «${sp.name}»? Действие можно отменить.`)) return;
      await liveApi.deleteSpace(sp.id);
      // Если мы внутри удаляемого пространства — выйти на дерево
      if (baseRoute.kind === 'space' && baseRoute.id === sp.id) setBaseRoute({ kind: 'tree' });
      else if (baseRoute.kind === 'page' && baseRoute.spaceId === sp.id) setBaseRoute({ kind: 'tree' });
      setBaseTick((n) => n + 1);
      setUndoToast({ kind: 'space', id: sp.id, snapshot: sp, label: 'Пространство удалено' });
    }
  };

  const performPageAction = async (action) => {
    if (!actionSheet || actionSheet.kind !== 'page') return;
    const pg = actionSheet.target;
    setActionSheet(null);
    if (action === 'rename')    setBaseRoute({ kind: 'page', id: pg.id, spaceId: pg.space_id });
    else if (action === 'duplicate') {
      await liveApi.duplicatePage(pg.id);
      setBaseTick((n) => n + 1);
    }
    else if (action === 'pin') {
      const { error } = await liveApi.togglePin('page', pg.id);
      if (error) dotToast('Закрепление недоступно — выполни SQL-миграцию из README', 'error');
      setBaseTick((n) => n + 1);
    }
    else if (action === 'addsubpage') {
      const { page, error } = await liveApi.createPage({ spaceId: pg.space_id, parentPageId: pg.id, title: '' });
      if (error) { dotToast(dotErr(error), 'error'); return; }
      if (page) setBaseRoute({ kind: 'page', id: page.id, spaceId: pg.space_id });
      setBaseTick((n) => n + 1);
    }
    else if (action === 'move') {
      setMovePicker({ pageId: pg.id, currentSpaceId: pg.space_id, currentParentId: pg.parent_page_id });
    }
    else if (action === 'delete') {
      if (!window.confirm(`Удалить страницу «${pg.title || 'Без заголовка'}»? Действие можно отменить.`)) return;
      const { page: snapshot } = await liveApi.loadPage(pg.id);
      await liveApi.deletePage(pg.id);
      if (baseRoute.kind === 'page' && baseRoute.id === pg.id) setBaseRoute({ kind: 'space', id: pg.space_id });
      setBaseTick((n) => n + 1);
      setUndoToast({ kind: 'page', id: pg.id, snapshot, label: 'Страница удалена' });
    }
  };

  const handleMove = async ({ spaceId: targetSpaceId, parentPageId }) => {
    if (!movePicker || !liveApi) return;
    const pageId = movePicker.pageId;
    setMovePicker(null);
    const { error } = await sb.from('pages').update({
      space_id: targetSpaceId,
      parent_page_id: parentPageId,
    }).eq('id', pageId);
    if (error) dotToast(dotErr(error), 'error');
    setBaseTick((n) => n + 1);
  };

  const dueIsoFromTask = (t) => {
    // task.when buckets back to Date — but we lost the original ISO in the UI mapping.
    // For edit, fetch the raw row to get exact due_at. Simpler: store dueIso when loading.
    // For now: we kept the bucket label only. Use a heuristic: if Завтра → tomorrow noon, etc.
    return t.dueIso || null;
  };

  const handleComposerSubmit = async ({ title, dueIso, priority }) => {
    if (!liveApi) return;
    const prioMap = { 'Срочно': 'urgent', 'Обычный': 'medium', 'Низкий': 'low' };
    const dbPriority = prioMap[priority] || null;
    if (editingTask) {
      const { task, error } = await liveApi.updateTask(editingTask.id, { title, dueIso, priority: dbPriority });
      if (error) { dotToast(dotErr(error), 'error'); return; }
      if (task) setTasks((ts) => ts.map((t) => t.id === task.id ? task : t));
    } else {
      const { task, error } = await liveApi.createTask(title, dueIso, dbPriority);
      if (error) { dotToast(dotErr(error), 'error'); return; }
      if (task) {
        dotHaptic?.('light');
        setTasks((ts) => [task, ...ts]);
      }
    }
  };

  const handleDelete = async () => {
    if (!editingTask || !liveApi) return;
    const id = editingTask.id;
    const snapshot = tasks.find((t) => t.id === id);
    dotHaptic?.('medium');
    setTasks((ts) => ts.filter((t) => t.id !== id));
    await liveApi.deleteTask(id);
    setUndoToast({ kind: 'task', id, snapshot, label: 'Задача удалена' });
  };

  const handleUndo = async () => {
    if (!undoToast || !liveApi) return;
    if (undoToast.kind === 'task') {
      await liveApi.restoreTask(undoToast.id);
      if (undoToast.snapshot) setTasks((ts) => [undoToast.snapshot, ...ts]);
    } else if (undoToast.kind === 'habit') {
      await liveApi.restoreHabit(undoToast.id);
      setHabitsTick((n) => n + 1);
    } else if (undoToast.kind === 'space') {
      await liveApi.restoreSpace(undoToast.id);
      setBaseTick((n) => n + 1);
    } else if (undoToast.kind === 'page') {
      await liveApi.restorePage(undoToast.id);
      setBaseTick((n) => n + 1);
    }
    setUndoToast(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: 72, position: 'relative' }}>
      <DotHeader />
      {/* key={tab} — каждый раз когда меняется вкладка, контейнер полностью
          перемонтируется и срабатывает CSS-анимация dot-tab-fade (opacity).
          Без движений и scale — тихий 150мс fade чтобы переход не был резким.
          PullToRefresh оборачивает scroll-зону: tasks/habits/base поддерживают
          жест «потянуть вниз → обновить»; на 'me' — нет смысла, там профиль. */}
      <PullToRefresh key={tab} onRefresh={tab === 'me' ? null : onPullRefresh}>
        {/* CSS-quirk: процентный minHeight у child не видит процентный
            minHeight parent — резолвится в 0. Нужен явный height: 100%
            (или display:flex с flex:1 у child) на этом промежуточном слое,
            чтобы EmptyShell с minHeight: 100% корректно растягивалась.
            Длинные списки задач/привычек не клипаются — overflow-y: auto
            висит на PullToRefresh-обёртке выше. */}
        <div className="dot-tab-fade" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
          {tab === 'tasks'  && <TasksView tasks={tasks} toggle={toggle} loading={loading} live={live} onAdd={openComposer} onEdit={live ? openEditor : undefined} />}
          {tab === 'habits' && <HabitsView key={habitsTick} live={live} onAdd={live ? openHabitComposer : undefined} onEdit={live ? openHabitEditor : undefined} />}
          {tab === 'base'   && <BaseView onGo={onGo} live={live} route={baseRoute} setRoute={setBaseRoute} hint={baseTick} onPageDelete={handlePageDelete} onSpaceAction={handleSpaceAction} onPageAction={handlePageAction} />}
          {tab === 'me'     && <ProfileView onGo={onGo} live={live} />}
        </div>
      </PullToRefresh>
      {/* FAB прячем там, где «+» не имеет осмысленного действия или
          дублирует контекстную кнопку:
          - Профиль: незачем создавать задачу с экрана статистики
          - Внутри страницы Базы: для добавления блоков юзается «/» в редакторе
          - Внутри пространства Базы: уже есть inline «+ Новая страница»
            (контекстнее: видно куда добавится). Глобальный FAB делал бы то же,
            два плюса на экране — путает.
          - При открытом sheet'е создания/редактирования пространства: его всё
            равно перекрывает */}
      {live && tab !== 'me' && !(tab === 'base' && (baseRoute.kind === 'space' || baseRoute.kind === 'page' || baseRoute.kind === 'create-space' || baseRoute.kind === 'edit-space')) && (
        <Fab onClick={handleFab} />
      )}
      <DotTabs active={tab} onChange={setTab} />
      {live && composerOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
          <ComposerFullscreen
            live
            initialTask={editingTask ? {
              title: editingTask.title,
              dueIso: dueIsoFromTask(editingTask),
              priority: editingTask.prio,
            } : null}
            onSubmit={handleComposerSubmit}
            onDelete={editingTask ? handleDelete : undefined}
            onClose={closeComposer}
          />
        </div>
      )}
      {live && (baseRoute.kind === 'create-space' || baseRoute.kind === 'edit-space') && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
          <CreateSpaceSheet
            live
            initialSpace={baseRoute.kind === 'edit-space' ? editingSpace : null}
            onSubmit={handleSpaceSubmit}
            onDelete={baseRoute.kind === 'edit-space' ? handleSpaceDelete : undefined}
            onClose={() => {
              if (baseRoute.kind === 'edit-space') setBaseRoute({ kind: 'space', id: baseRoute.id });
              else setBaseRoute({ kind: 'tree' });
            }}
          />
        </div>
      )}
      {live && habitComposerOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
          <ComposerFullscreenHabit
            live
            initialHabit={editingHabit ? {
              title: editingHabit.title,
              color: editingHabit.color,
              repeat: editingHabit.schedule?.type || 'daily',
              goal: editingHabit.schedule?.goalPerWeek || 7,
              reminder: editingHabit.reminder_at || null,
            } : null}
            onSubmit={handleHabitSubmit}
            onDelete={editingHabit ? handleHabitDelete : undefined}
            onClose={closeHabitComposer}
          />
        </div>
      )}
      {live && actionSheet && actionSheet.kind === 'space' && (() => {
        const meta = parseSpaceMeta(actionSheet.target);
        const Ic = meta.Icon;
        const pinned = !!actionSheet.target.pinned_at;
        return (
          <ItemActionSheet
            title={actionSheet.target.name}
            subtitle="Пространство"
            headerIcon={<Ic size={15} strokeWidth={1.75} />}
            items={[
              { Icon: IconType,  label: 'Переименовать', onClick: () => performSpaceAction('rename') },
              { Icon: IconPin,   label: pinned ? 'Открепить' : 'Закрепить', onClick: () => performSpaceAction('pin') },
              { Icon: IconFile,  label: 'Дублировать',   onClick: () => performSpaceAction('duplicate') },
              { Icon: IconTrash, label: 'Удалить',       onClick: () => performSpaceAction('delete'), danger: true },
            ]}
            onClose={() => setActionSheet(null)}
          />
        );
      })()}
      {live && actionSheet && actionSheet.kind === 'page' && (() => {
        const pinned = !!actionSheet.target.pinned_at;
        return (
          <ItemActionSheet
            title={actionSheet.target.title || 'Без заголовка'}
            subtitle="Страница"
            headerIcon={<IconFile size={15} strokeWidth={1.75} />}
            items={[
              { Icon: IconType,        label: 'Переименовать',       onClick: () => performPageAction('rename') },
              { Icon: IconPlusSmall,   label: 'Создать подстраницу', onClick: () => performPageAction('addsubpage') },
              { Icon: IconPin,         label: pinned ? 'Открепить' : 'Закрепить', onClick: () => performPageAction('pin') },
              { Icon: IconFile,        label: 'Дублировать',         onClick: () => performPageAction('duplicate') },
              { Icon: IconFolder,      label: 'Переместить в…',     onClick: () => performPageAction('move') },
              { Icon: IconTrash,       label: 'Удалить',             onClick: () => performPageAction('delete'), danger: true },
            ]}
            onClose={() => setActionSheet(null)}
          />
        );
      })()}
      {live && movePicker && (
        <MovePickerSheet
          movePicker={movePicker}
          onClose={() => setMovePicker(null)}
          onPick={handleMove}
        />
      )}
      {live && undoToast && (
        <div style={{
          position: 'absolute', left: 16, right: 16, bottom: 84, zIndex: 60,
          background: '#1C1C1E', color: '#fff',
          borderRadius: 12, padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          fontSize: 14,
        }}>
          <IconTrash size={16} strokeWidth={1.75} color="#fff" />
          <span style={{ flex: 1 }}>{undoToast.label || 'Удалено'}</span>
          <button onClick={handleUndo} style={{
            background: 'none', border: 'none', color: 'var(--accent)',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            padding: 0,
          }}>Отменить</button>
        </div>
      )}
    </div>
  );
}

function DotHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 24px 10px' }}>
      <Logo size={24} />
    </div>
  );
}

function Fab({ onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', right: 22, bottom: 92,
      width: 56, height: 56, borderRadius: 28,
      background: 'var(--accent)', color: '#fff',
      border: 'none', cursor: onClick ? 'pointer' : 'default',
      boxShadow: '0 10px 24px -6px var(--accent), 0 2px 6px rgba(0,0,0,0.12)',
      display: 'grid', placeItems: 'center', zIndex: 5,
    }}>
      <IconPlus size={24} strokeWidth={2.2} />
    </button>
  );
}

function DotTabs({ active, onChange }) {
  const tabs = [
    { id: 'tasks',  label: 'Задачи',   Icon: IconCheckSquare },
    { id: 'habits', label: 'Привычки', Icon: IconRepeat },
    { id: 'base',   label: 'База',     Icon: IconBook },
    { id: 'me',     label: 'Профиль',  Icon: IconUser },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: 22, paddingTop: 8,
      background: 'var(--bg)', borderTop: '1px solid var(--line)',
      display: 'flex', justifyContent: 'space-around', zIndex: 10,
    }}>
      {tabs.map((t) => {
        const on = active === t.id;
        const c = on ? 'var(--accent)' : 'var(--sub)';
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '4px 14px', position: 'relative',
          }}>
            {on && <span style={{ position: 'absolute', top: -9, width: 22, height: 3, background: 'var(--accent)', borderRadius: 2 }} />}
            <t.Icon size={22} color={c} strokeWidth={on ? 2 : 1.75} />
            <span style={{ fontSize: 11, fontWeight: on ? 600 : 500, color: c }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── TASKS ────────────────────────────────────────────────
const PRIO_COLORS = {
  urgent: '#EF4444',
  normal: '#F59E0B',
  low:    'rgba(60,60,67,0.35)',
};
function TasksView({ tasks, toggle, loading, live, onAdd, onEdit }) {
  const order = ['Просрочено', 'Сегодня', 'Завтра', 'На неделе', 'Позже', 'Без даты'];
  if (loading) {
    return <TasksSkeleton />;
  }
  if (live && tasks.length === 0) {
    return <TasksEmpty onAdd={onAdd} />;
  }
  return (
    <div style={{ paddingBottom: 24 }}>
      {order.map(sect => (
        <TaskSection key={sect} title={sect} items={tasks.filter(t => t.when === sect)} toggle={toggle} onEdit={onEdit} />
      ))}
    </div>
  );
}

// ─── Pull-to-refresh ─────────────────────────────────────────
// Стандартный мобильный жест: тянем вниз когда уже наверху списка → круглый
// индикатор → отпускаем → onRefresh(). Работает на touch (мобила/планшет),
// на десктопе ничего не делает.
//
// Дизайн: индикатор появляется в верхней области с opacity пропорционально
// pull-distance, threshold 70px. После триггера показывает спиннер пока
// onRefresh-Promise не resolve, потом откатывается обратно.
const PULL_THRESHOLD = 70;
const PULL_MAX = 110;

function PullToRefresh({ onRefresh, children }) {
  const ref = useRefH(null);
  const [pull, setPull] = useStateH(0);          // текущая дистанция (px), 0 если не тянем
  const [refreshing, setRefreshing] = useStateH(false);
  const startY = useRefH(0);
  const tracking = useRefH(false);

  const onTouchStart = (e) => {
    if (refreshing) return;
    const el = ref.current;
    if (!el || el.scrollTop > 0) return; // тянуть можно только когда уже наверху
    startY.current = e.touches[0].clientY;
    tracking.current = true;
  };
  const onTouchMove = (e) => {
    if (!tracking.current || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy <= 0) { setPull(0); return; }
    // Резистанс: тянется всё медленнее по мере увеличения дистанции (как iOS).
    const resisted = Math.min(PULL_MAX, dy * 0.5);
    setPull(resisted);
  };
  const onTouchEnd = async () => {
    if (!tracking.current) return;
    tracking.current = false;
    if (pull >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPull(PULL_THRESHOLD); // фиксируем индикатор на пороге пока крутится
      try { await onRefresh?.(); } catch {}
      setRefreshing(false);
    }
    setPull(0);
  };

  // Индикатор: круг, opacity = pull/threshold, при threshold вращается.
  const progress = Math.min(1, pull / PULL_THRESHOLD);
  const showIndicator = pull > 0 || refreshing;

  return (
    <div
      ref={ref}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative',
        // Сдвигаем контент вниз пока тянут — визуально content «следует за пальцем».
        transform: pull ? `translateY(${pull}px)` : undefined,
        transition: pull && !tracking.current ? 'transform 220ms ease' : 'none',
      }}
    >
      {showIndicator && (
        <div style={{
          position: 'absolute', top: -50, left: 0, right: 0,
          display: 'flex', justifyContent: 'center',
          opacity: progress,
          pointerEvents: 'none',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '2.5px solid var(--line)',
            borderTopColor: 'var(--accent)',
            animation: refreshing ? 'dot-spin 0.8s linear infinite' : 'none',
            transform: !refreshing ? `rotate(${progress * 360}deg)` : undefined,
          }} />
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Skeleton placeholders для loading-состояний ─────────────
// Используются когда юзер заходит в первый раз (кэша ещё нет) и пока
// идёт сетевой fetch. Лучше серая «навёрстка» с лёгким shimmer-effect,
// чем пустой экран. Анимация — в @keyframes dot-shimmer в index.html.
function SkeletonRow({ height = 56, indent = 24, gap = 4, lines = [70, 40] }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: `${(height - 28) / 2}px ${indent}px`,
      borderBottom: '1px solid var(--line)',
    }}>
      <div className="dot-skeleton" style={{ width: 22, height: 22, borderRadius: 11, flexShrink: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap, flex: 1 }}>
        {lines.map((widthPercent, i) => (
          <div key={i} className="dot-skeleton" style={{ height: 12, width: `${widthPercent}%` }} />
        ))}
      </div>
    </div>
  );
}

function TasksSkeleton() {
  return (
    <div>
      <div style={{ padding: '14px 24px 6px', fontSize: 13, fontWeight: 600, color: 'var(--sub)' }}>
        <div className="dot-skeleton" style={{ height: 12, width: 70 }} />
      </div>
      <SkeletonRow lines={[80, 35]} />
      <SkeletonRow lines={[55, 30]} />
      <SkeletonRow lines={[70, 25]} />
      <div style={{ padding: '20px 24px 6px', fontSize: 13, fontWeight: 600, color: 'var(--sub)' }}>
        <div className="dot-skeleton" style={{ height: 12, width: 60 }} />
      </div>
      <SkeletonRow lines={[60, 30]} />
      <SkeletonRow lines={[75, 35]} />
    </div>
  );
}

function HabitsSkeleton() {
  return (
    <div>
      {[80, 60, 70, 50].map((w, i) => (
        <div key={i} style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)' }}>
          <div className="dot-skeleton" style={{ height: 14, width: `${w}%`, marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="dot-skeleton" style={{ width: 28, height: 28, borderRadius: 8 }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function BaseSkeleton() {
  return (
    <div style={{ padding: '14px 24px' }}>
      <div className="dot-skeleton" style={{ height: 36, width: '100%', marginBottom: 16 }} />
      {[80, 60, 70, 50, 65].map((w, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
          <div className="dot-skeleton" style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0 }} />
          <div className="dot-skeleton" style={{ height: 14, width: `${w}%` }} />
        </div>
      ))}
    </div>
  );
}

// Общая обёртка для всех empty-состояний — гарантирует одинаковую вертикальную позицию.
// minHeight 100% + центрирование по обеим осям ⇒ контент всегда «в середине вкладки»,
// независимо от того, насколько длинный текст внутри.
function EmptyShell({ children }) {
  return (
    <div style={{
      // flex: 1 фуллфилит вертикально внутри родителя-флексбокса (.dot-tab-fade);
      // фолбэк minHeight для случаев если родитель не флекс (e.g. legacy).
      flex: 1,
      minHeight: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '32px 32px 64px',
    }}>{children}</div>
  );
}

function TasksEmpty({ onAdd }) {
  return (
    <EmptyShell>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: 'var(--accent-soft)', color: 'var(--accent)',
        display: 'grid', placeItems: 'center', marginBottom: 22,
      }}>
        <IconCheckSquare size={28} strokeWidth={1.6} />
      </div>
      <h2 style={{
        fontSize: 22, fontWeight: 600, letterSpacing: -0.4,
        margin: '0 0 10px', color: 'var(--text)',
      }}>Задач пока нет</h2>
      <p style={{
        fontSize: 14, color: 'var(--sub)', lineHeight: 1.5,
        margin: '0 0 22px', maxWidth: 280,
      }}>Запишите первое — позвонить, купить, дочитать. dot. покажет нужное в нужный день.</p>
      <button onClick={onAdd} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '13px 22px', borderRadius: 14,
        background: 'var(--accent)', color: '#fff',
        border: 'none', cursor: 'pointer',
        fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
        boxShadow: '0 8px 20px -8px var(--accent)',
      }}>
        <IconPlus size={18} strokeWidth={2.2} /> Новая задача
      </button>
    </EmptyShell>
  );
}
function TaskSection({ title, items, toggle, onEdit }) {
  if (!items.length) return null;
  const isOverdue = title === 'Просрочено';
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ padding: '8px 24px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 0.12, textTransform: 'uppercase', color: isOverdue ? '#E44' : 'var(--accent)' }}>{title}</div>
      <div>
        {items.map((t, i) => (
          <div key={t.id}
            onClick={onEdit ? (e) => {
              // Игнорируем клики по чекбоксу — он уже обрабатывается RoundCheck
              if (e.target.closest('button')) return;
              onEdit(t);
            } : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 24px', borderBottom: '1px solid var(--line)',
              cursor: onEdit ? 'pointer' : 'default',
            }}>
            <RoundCheck checked={t.done} onChange={() => toggle(t.id)} />
            <div style={{
              fontSize: 15, fontWeight: 400, flex: 1,
              color: t.done ? 'var(--sub)' : 'var(--text)',
              textDecoration: t.done ? 'line-through' : 'none',
            }}>{t.title}</div>
            {t.prio && !t.done && (
              <IconFlag size={14} strokeWidth={1.75}
                style={{ color: PRIO_COLORS[t.prio], fill: PRIO_COLORS[t.prio] }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
function RoundCheck({ checked, onChange }) {
  return (
    <button onClick={onChange} style={{
      width: 22, height: 22, borderRadius: 11, padding: 0,
      border: `1.6px solid ${checked ? 'var(--accent)' : 'var(--line)'}`,
      background: checked ? 'var(--accent)' : 'transparent',
      display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0,
    }}>
      {checked && <IconCheck size={12} color="#fff" strokeWidth={2.5} />}
    </button>
  );
}

// ─── HABITS ───────────────────────────────────────────────
// День недели подписан прямо над каждым квадратом — связь очевидна,
// ничего не «оторвано».
function HabitsView({ live, onAdd, onEdit }) {
  const days = ['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'];
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 28px)',
    gap: 6,
    justifyContent: 'start',
  };

  if (!live) {
    // Статичный артборд из HABITS — как было.
    const todayIdx = 3;
    return (
      <div style={{ borderTop: '1px solid var(--line)' }}>
        {HABITS.map((h) => (
          <div key={h.id} style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 500 }}>{h.title}</div>
              {h.streak > 0 && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  fontSize: 12, fontWeight: 600,
                  color: 'var(--accent)', background: 'var(--accent-soft)',
                  padding: '3px 8px', borderRadius: 99,
                }}>
                  <IconFlame size={12} strokeWidth={2} /><span>{h.streak}</span>
                </div>
              )}
            </div>
            <div style={{ ...gridStyle, marginBottom: 4 }}>
              {days.map((d, i) => (
                <div key={d} style={{
                  textAlign: 'center', fontSize: 9, fontWeight: 700, letterSpacing: 0.06,
                  color: i === todayIdx ? 'var(--accent)' : 'var(--sub)',
                }}>{d}</div>
              ))}
            </div>
            <div style={gridStyle}>
              {h.days.map((v, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: v ? 'var(--accent)' : 'transparent',
                  border: v ? 'none' : '1.5px solid var(--line)',
                  outline: i === todayIdx && !v ? '1.5px dashed var(--accent)' : 'none',
                  outlineOffset: -1.5,
                }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // === LIVE ===
  return <HabitsViewLive days={days} gridStyle={gridStyle} onAdd={onAdd} onEdit={onEdit} />;
}

function HabitsViewLive({ days, gridStyle, onAdd, onEdit }) {
  const cachedHabits = liveApi?.getCachedHabits?.() || [];
  const [habits, setHabits] = useStateH(cachedHabits);
  const [logs, setLogs]     = useStateH(new Map()); // habitId → Set<YYYY-MM-DD>
  const [streaks, setStreaks] = useStateH({});
  // loading=false если есть кэш — UI уже что-то показывает, refresh идёт молча.
  const [loading, setLoading] = useStateH(!cachedHabits.length);

  const today = new Date(); today.setHours(0,0,0,0);
  const monday = dotLiveHelpers.mondayOf(today);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(d.getDate() + i); return d;
  });
  const todayIdx = weekDates.findIndex(d => +d === +today);
  const todayKey = dotLiveHelpers.ymd(today);

  const reload = async () => {
    if (!liveApi) return;
    const [{ habits: h }, { logs: l }] = await Promise.all([
      liveApi.loadHabits(),
      liveApi.loadLogsForWeek(today),
    ]);
    setHabits(h);
    setLogs(l);
    // streaks per habit
    const entries = await Promise.all(h.map(async (hh) => [hh.id, (await liveApi.loadStreak(hh.id)).streak]));
    setStreaks(Object.fromEntries(entries));
    setLoading(false);
  };

  useEffectH(() => { reload(); }, []);

  const handleToday = async (habit) => {
    dotHaptic?.('light');
    // Optimistic toggle
    const habitLogs = new Set(logs.get(habit.id) || []);
    const wasDone = habitLogs.has(todayKey);
    if (wasDone) habitLogs.delete(todayKey); else habitLogs.add(todayKey);
    const next = new Map(logs); next.set(habit.id, habitLogs);
    setLogs(next);
    setStreaks(s => ({ ...s, [habit.id]: Math.max(0, (s[habit.id] || 0) + (wasDone ? -1 : 1)) }));
    await liveApi.toggleHabitDay(habit.id, today);
    // Refresh streak (more accurate than optimistic +/-1)
    const { streak } = await liveApi.loadStreak(habit.id);
    setStreaks(s => ({ ...s, [habit.id]: streak }));
  };

  if (loading) {
    return <HabitsSkeleton />;
  }
  if (habits.length === 0) {
    return <HabitsEmpty onAdd={onAdd} />;
  }

  return (
    <div style={{ borderTop: '1px solid var(--line)' }}>
      {habits.map((h) => {
        const habitLogs = logs.get(h.id) || new Set();
        const streak = streaks[h.id] || 0;
        return (
          <div key={h.id}
            onClick={onEdit ? () => onEdit(h) : undefined}
            style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--line)',
              cursor: onEdit ? 'pointer' : 'default',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 500 }}>{h.title}</div>
              {streak > 0 && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  fontSize: 12, fontWeight: 600,
                  color: 'var(--accent)', background: 'var(--accent-soft)',
                  padding: '3px 8px', borderRadius: 99,
                }}>
                  <IconFlame size={12} strokeWidth={2} /><span>{streak}</span>
                </div>
              )}
            </div>
            <div style={{ ...gridStyle, marginBottom: 4 }}>
              {days.map((d, i) => (
                <div key={d} style={{
                  textAlign: 'center', fontSize: 9, fontWeight: 700, letterSpacing: 0.06,
                  color: i === todayIdx ? 'var(--accent)' : 'var(--sub)',
                }}>{d}</div>
              ))}
            </div>
            <div style={gridStyle}>
              {weekDates.map((d, i) => {
                const key = dotLiveHelpers.ymd(d);
                const done = habitLogs.has(key);
                const isToday = i === todayIdx;
                const accentColor = h.color || 'var(--accent)';
                const isClickable = isToday;
                const handleClick = (e) => {
                  e.stopPropagation();
                  if (isClickable) handleToday(h);
                };
                return (
                  <div key={i} onClick={handleClick} style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: done ? accentColor : 'transparent',
                    border: done ? 'none' : '1.5px solid var(--line)',
                    outline: isToday && !done ? `1.5px dashed ${accentColor}` : 'none',
                    outlineOffset: -1.5,
                    cursor: isClickable ? 'pointer' : 'default',
                  }} />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HabitsEmpty({ onAdd }) {
  return (
    <EmptyShell>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: 'var(--accent-soft)', color: 'var(--accent)',
        display: 'grid', placeItems: 'center', marginBottom: 22,
      }}>
        <IconRepeat size={28} strokeWidth={1.6} />
      </div>
      <h2 style={{
        fontSize: 22, fontWeight: 600, letterSpacing: -0.4,
        margin: '0 0 10px', color: 'var(--text)',
      }}>Привычек пока нет</h2>
      <p style={{
        fontSize: 14, color: 'var(--sub)', lineHeight: 1.5,
        margin: '0 0 22px', maxWidth: 280,
      }}>Заведите первую — медитация, чтение, прогулка. Маленькие шаги каждый день.</p>
      <button onClick={onAdd} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '13px 22px', borderRadius: 14,
        background: 'var(--accent)', color: '#fff',
        border: 'none', cursor: 'pointer',
        fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
        boxShadow: '0 8px 20px -8px var(--accent)',
      }}>
        <IconPlus size={18} strokeWidth={2.2} /> Новая привычка
      </button>
    </EmptyShell>
  );
}

// ─── KNOWLEDGE BASE (redesigned, Notion-lite) ────────────
const SPACE_ICON = { briefcase: IconBriefcase, heart: IconHeart, compass: IconCompass };

function BaseView({ onGo, live, route, setRoute, hint, onPageDelete, onSpaceAction, onPageAction }) {
  if (live) {
    return <BaseViewLive route={route} setRoute={setRoute} hint={hint} onPageDelete={onPageDelete} onSpaceAction={onSpaceAction} onPageAction={onPageAction} />;
  }
  return <BaseViewMock onGo={onGo} />;
}

function BaseViewMock({ onGo }) {
  const [openSpaces, setOpenSpaces] = useStateH({ 'sp-work': true, 'sp-life': true, 'sp-ref': false });
  const [openPages, setOpenPages] = useStateH({});
  const [q, setQ] = useStateH('');
  const pinned = collectPages(BASE_TREE).filter((p) => PINNED_PAGES.includes(p.id));

  const toggleSpace = (id) => setOpenSpaces((s) => ({ ...s, [id]: !s[id] }));
  const togglePage  = (id) => setOpenPages((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ padding: '0 22px 12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--chip)', borderRadius: 12, padding: '10px 14px', color: 'var(--sub)',
        }}>
          <IconSearch size={16} color="var(--sub)" strokeWidth={1.75} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по базе" style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 14, color: 'var(--text)',
          }}/>
        </div>
      </div>

      {pinned.length > 0 && (
        <>
          <BaseHeader>Закреплено</BaseHeader>
          {pinned.map((p) => <PageRow key={p.id} page={p} depth={0} pinned />)}
        </>
      )}

      <BaseHeader>Пространства</BaseHeader>
      {BASE_TREE.map((sp) => {
        const SpaceIcon = SPACE_ICON[sp.iconKey] || IconFolder;
        return (
        <div key={sp.id}>
          <div onClick={() => toggleSpace(sp.id)} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 24px', cursor: 'pointer',
            borderBottom: '1px solid var(--line)',
          }}>
            <span style={{ color: 'var(--sub)', display: 'flex', width: 14, transform: openSpaces[sp.id] ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 160ms' }}>
              <IconChevronDown size={14} strokeWidth={2} />
            </span>
            <span style={{ color: 'var(--accent)', display: 'flex' }}>
              <SpaceIcon size={16} strokeWidth={1.75} />
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{sp.title}</span>
            <span style={{ fontSize: 12, color: 'var(--sub)' }}>{sp.children.length}</span>
          </div>
          {openSpaces[sp.id] && sp.children.map((p) => (
            <PageNode key={p.id} page={p} depth={1} openPages={openPages} togglePage={togglePage} />
          ))}
        </div>
      );})}
    </div>
  );
}
function collectPages(tree) {
  const out = [];
  const walk = (nodes) => nodes.forEach((n) => {
    if (n.kind === 'page') out.push(n);
    if (n.children) walk(n.children);
  });
  walk(tree);
  return out;
}
function BaseHeader({ children }) {
  return <div style={{ padding: '14px 24px 8px', fontSize: 11, fontWeight: 700, letterSpacing: 0.12, textTransform: 'uppercase', color: 'var(--accent)' }}>{children}</div>;
}
function PageNode({ page, depth, openPages, togglePage }) {
  const hasKids = page.children && page.children.length;
  const open = openPages[page.id];
  return (
    <>
      <PageRow page={page} depth={depth} onToggle={hasKids ? () => togglePage(page.id) : undefined} open={open} />
      {open && hasKids && page.children.map((c) => (
        <PageNode key={c.id} page={c} depth={depth + 1} openPages={openPages} togglePage={togglePage} />
      ))}
    </>
  );
}
function PageRow({ page, depth, onToggle, open, pinned }) {
  const hasKids = page.children && page.children.length;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 24px 10px', paddingLeft: 24 + depth * 18,
      borderBottom: '1px solid var(--line)',
      cursor: 'pointer',
    }}>
      {onToggle ? (
        <span onClick={(e) => { e.stopPropagation(); onToggle(); }} style={{ color: 'var(--sub)', display: 'flex', width: 14, transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 160ms', cursor: 'pointer' }}>
          <IconChevronDown size={14} strokeWidth={2} />
        </span>
      ) : (
        <span style={{ width: 14 }} />
      )}
      <span style={{
        width: 18, height: 18, display: 'grid', placeItems: 'center',
        color: 'var(--sub)',
      }}>
        <IconFile size={16} color="var(--sub)" strokeWidth={1.5} />
      </span>
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <div style={{ fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{page.title}</div>
      </div>
      {hasKids && <span style={{ fontSize: 11, color: 'var(--sub)' }}>{page.children.length}</span>}
      {pinned && <span style={{ color: 'var(--accent)', display: 'flex' }}><IconPin size={11} strokeWidth={2} /></span>}
    </div>
  );
}

// ─── KNOWLEDGE BASE — LIVE ────────────────────────────────
const SPACE_ICON_MAP = {
  briefcase: IconBriefcase, heart: IconHeart, compass: IconCompass,
  star: IconStar, book: IconBook, folder: IconFolder,
};
function parseSpaceMeta(space) {
  let meta = {};
  try { meta = space?.icon ? JSON.parse(space.icon) : {}; } catch (_) {
    meta = { key: space?.icon || 'folder' };
  }
  return {
    iconKey: meta.key || 'folder',
    color: meta.color || 'var(--accent)',
    description: meta.description || '',
    Icon: SPACE_ICON_MAP[meta.key] || IconFolder,
  };
}

function BaseViewLive({ route, setRoute, hint, onPageDelete, onSpaceAction, onPageAction }) {
  const r = route || { kind: 'tree' };
  const goBack = () => {
    if (r.kind === 'page')  setRoute({ kind: 'space', id: r.spaceId });
    else if (r.kind === 'space') setRoute({ kind: 'tree' });
    else setRoute({ kind: 'tree' });
  };

  if (r.kind === 'tree') return <BaseTreeView setRoute={setRoute} hint={hint} onSpaceAction={onSpaceAction} onPageAction={onPageAction} />;
  if (r.kind === 'space') return <SpaceView spaceId={r.id} setRoute={setRoute} onBack={goBack} hint={hint} onPageAction={onPageAction} />;
  if (r.kind === 'page')  return <PageView pageId={r.id} spaceId={r.spaceId} setRoute={setRoute} onBack={goBack} hint={hint} onDelete={() => onPageDelete && onPageDelete(r.id, r.spaceId)} onAction={onPageAction} />;
  return null;
}

function BaseTreeView({ setRoute, hint, onSpaceAction, onPageAction }) {
  // Warm cache: при первом рендере собираем пространства и страницы из кэша,
  // чтобы дерево «Базы» появилось мгновенно. Фоновый reload подтянет свежее.
  const cachedSpaces = liveApi?.getCachedSpaces?.() || [];
  const cachedPages = liveApi?.getCachedPages?.() || [];
  const buildPagesBySpace = (sps, allPages) => {
    const byId = {};
    sps.forEach((sp) => { byId[sp.id] = { all: [], topLevel: [], childrenByParent: {} }; });
    allPages.forEach((p) => {
      const bag = byId[p.space_id];
      if (!bag) return;
      bag.all.push(p);
      if (!p.parent_page_id) bag.topLevel.push(p);
      else {
        if (!bag.childrenByParent[p.parent_page_id]) bag.childrenByParent[p.parent_page_id] = [];
        bag.childrenByParent[p.parent_page_id].push(p);
      }
    });
    return byId;
  };
  const [spaces, setSpaces] = useStateH(cachedSpaces);
  const [pagesBySpace, setPagesBySpace] = useStateH(() => buildPagesBySpace(cachedSpaces, cachedPages));
  const [openSpaces, setOpenSpaces] = useStateH(() => {
    const o = {}; cachedSpaces.forEach((sp) => { o[sp.id] = true; }); return o;
  });
  const [openPages, setOpenPages] = useStateH({});
  const [loading, setLoading] = useStateH(!cachedSpaces.length);
  const [q, setQ] = useStateH('');

  const reload = async () => {
    if (!liveApi) return;
    // Параллельный fetch — было два await друг за другом, стало один Promise.all.
    const [{ spaces: sps }, { pages: allPages }] = await Promise.all([
      liveApi.loadSpaces(),
      liveApi.loadPages(),
    ]);
    setSpaces(sps);
    setPagesBySpace(buildPagesBySpace(sps, allPages));
    setOpenSpaces((cur) => {
      // Сохраняем уже открытые/закрытые пространства, новые — открываем по дефолту.
      const next = { ...cur };
      sps.forEach((sp) => { if (next[sp.id] === undefined) next[sp.id] = true; });
      return next;
    });
    setLoading(false);
  };

  useEffectH(() => { reload(); }, [hint]);

  if (loading) {
    return <BaseSkeleton />;
  }
  if (spaces.length === 0) {
    return (
      <BaseEmpty embedded onCreate={() => setRoute({ kind: 'create-space' })} />
    );
  }

  const toggleSpace = (id) => setOpenSpaces((s) => ({ ...s, [id]: !s[id] }));
  const togglePage = (id) => setOpenPages((s) => ({ ...s, [id]: !s[id] }));
  const filterMatch = (txt) => !q || txt.toLowerCase().includes(q.toLowerCase());

  // Рекурсивный рендер страницы со всеми подстраницами
  const renderPageRow = (page, spaceId, childrenByParent, depth) => {
    const kids = childrenByParent[page.id] || [];
    const hasKids = kids.length > 0;
    const isOpen = openPages[page.id] !== false;
    if (!filterMatch(page.title || '') && !hasKids) return null;
    return (
      <React.Fragment key={page.id}>
        <div onClick={() => setRoute({ kind: 'page', id: page.id, spaceId })}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 24px', paddingLeft: 24 + depth * 18,
            borderBottom: '1px solid var(--line)', cursor: 'pointer',
          }}>
          {hasKids ? (
            <span onClick={(e) => { e.stopPropagation(); togglePage(page.id); }}
              style={{ color: 'var(--sub)', display: 'flex', width: 14, transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 160ms', cursor: 'pointer' }}>
              <IconChevronDown size={14} strokeWidth={2} />
            </span>
          ) : (
            <span style={{ width: 14 }} />
          )}
          <IconFile size={16} color="var(--sub)" strokeWidth={1.5} />
          <div style={{ flex: 1, minWidth: 0, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {page.title || 'Без заголовка'}
          </div>
          {hasKids && <span style={{ fontSize: 11, color: 'var(--sub)' }}>{kids.length}</span>}
          <RowMoreButton onClick={() => onPageAction && onPageAction(page)} />
        </div>
        {isOpen && hasKids && kids.map((c) => renderPageRow(c, spaceId, childrenByParent, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ padding: '0 22px 12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--chip)', borderRadius: 12, padding: '10px 14px', color: 'var(--sub)',
        }}>
          <IconSearch size={16} color="var(--sub)" strokeWidth={1.75} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по базе" style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 14, color: 'var(--text)',
          }}/>
        </div>
      </div>

      {(() => {
        const pinnedSpaces = spaces.filter((sp) => sp.pinned_at);
        const pinnedPages = [];
        spaces.forEach((sp) => {
          (pagesBySpace[sp.id]?.all || []).forEach((p) => {
            if (p.pinned_at) pinnedPages.push({ page: p, space: sp });
          });
        });
        if (pinnedSpaces.length === 0 && pinnedPages.length === 0) return null;
        return (
          <>
            <BaseHeader>Закреплено</BaseHeader>
            {pinnedSpaces.map((sp) => {
              const meta = parseSpaceMeta(sp); const Icon = meta.Icon;
              return (
                <div key={'pinsp-' + sp.id} onClick={() => setRoute({ kind: 'space', id: sp.id })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 24px', borderBottom: '1px solid var(--line)', cursor: 'pointer',
                  }}>
                  <span style={{ width: 14 }} />
                  <span style={{ color: meta.color, display: 'flex' }}><Icon size={16} strokeWidth={1.75} /></span>
                  <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{sp.name}</span>
                  <IconPin size={11} color="var(--accent)" strokeWidth={2} />
                </div>
              );
            })}
            {pinnedPages.map(({ page: p, space: sp }) => (
              <div key={'pinp-' + p.id} onClick={() => setRoute({ kind: 'page', id: p.id, spaceId: sp.id })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 24px', borderBottom: '1px solid var(--line)', cursor: 'pointer',
                }}>
                <span style={{ width: 14 }} />
                <IconFile size={16} color="var(--sub)" strokeWidth={1.5} />
                <div style={{ flex: 1, minWidth: 0, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.title || 'Без заголовка'}
                </div>
                <IconPin size={11} color="var(--accent)" strokeWidth={2} />
              </div>
            ))}
          </>
        );
      })()}

      <BaseHeader>Пространства</BaseHeader>
      {spaces.map((sp) => {
        const meta = parseSpaceMeta(sp);
        const Icon = meta.Icon;
        const bag = pagesBySpace[sp.id] || { all: [], topLevel: [], childrenByParent: {} };
        return (
          <div key={sp.id}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 24px',
              borderBottom: '1px solid var(--line)',
            }}>
              <span onClick={(e) => { e.stopPropagation(); toggleSpace(sp.id); }} style={{ color: 'var(--sub)', display: 'flex', width: 14, transform: openSpaces[sp.id] ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 160ms', cursor: 'pointer' }}>
                <IconChevronDown size={14} strokeWidth={2} />
              </span>
              <span onClick={() => setRoute({ kind: 'space', id: sp.id })} style={{ color: meta.color, display: 'flex', cursor: 'pointer' }}>
                <Icon size={16} strokeWidth={1.75} />
              </span>
              <span onClick={() => setRoute({ kind: 'space', id: sp.id })} style={{ fontSize: 14, fontWeight: 600, flex: 1, cursor: 'pointer' }}>{sp.name}</span>
              <span style={{ fontSize: 12, color: 'var(--sub)' }}>{bag.all.length}</span>
              <RowMoreButton onClick={() => onSpaceAction && onSpaceAction(sp)} />
            </div>
            {openSpaces[sp.id] && bag.topLevel.map((p) => renderPageRow(p, sp.id, bag.childrenByParent, 1))}
          </div>
        );
      })}

      {/* Кнопка-плюс для добавления нового пространства */}
      <div style={{ padding: '14px 24px', textAlign: 'center' }}>
        <button onClick={() => setRoute({ kind: 'create-space' })} style={{
          background: 'none', border: '1px dashed var(--line)',
          padding: '10px 16px', borderRadius: 12,
          color: 'var(--sub)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <IconPlusSmall size={14} strokeWidth={2} /> Новое пространство
        </button>
      </div>
    </div>
  );
}

function SpaceView({ spaceId, setRoute, onBack, hint, onPageAction }) {
  const [space, setSpace]   = useStateH(null);
  const [pages, setPages]   = useStateH([]);
  const [loading, setLoading] = useStateH(true);

  const reload = async () => {
    const [{ page: _ignore }, { spaces }] = [{}, await liveApi.loadSpaces()];
    const sp = spaces.find((s) => s.id === spaceId);
    setSpace(sp);
    const { pages: ps } = await liveApi.loadPages(spaceId);
    // Только страницы верхнего уровня
    setPages(ps.filter((p) => !p.parent_page_id));
    setLoading(false);
  };
  useEffectH(() => { reload(); }, [spaceId, hint]);

  const createPage = async () => {
    const { page, error } = await liveApi.createPage({ spaceId, title: '' });
    if (error) { dotToast(dotErr(error), 'error'); return; }
    if (page) setRoute({ kind: 'page', id: page.id, spaceId });
  };

  if (loading || !space) {
    return <div style={{ padding: 32, minHeight: 200 }} />;
  }
  if (pages.length === 0) {
    return (
      <SpaceEmpty
        space={space}
        onBack={onBack}
        onCreatePage={createPage}
        onMenu={() => setRoute({ kind: 'edit-space', id: spaceId })}
      />
    );
  }

  const meta = parseSpaceMeta(space);
  const Icon = meta.Icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 20px', borderBottom: '1px solid var(--line)',
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer', display: 'flex' }}>
          <IconChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <div style={{ flex: 1, fontSize: 13, color: 'var(--sub)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon size={13} strokeWidth={1.8} /><span>База / {space.name}</span>
        </div>
        <button onClick={() => setRoute({ kind: 'edit-space', id: spaceId })} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--sub)', cursor: 'pointer', display: 'flex' }}>
          <IconMore size={20} strokeWidth={1.75} />
        </button>
      </div>
      <div style={{ padding: '22px 24px 14px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: meta.color, display: 'flex' }}><Icon size={24} strokeWidth={1.75} /></span>
          {space.name}
        </h1>
        {meta.description && <p style={{ fontSize: 14, color: 'var(--sub)', margin: '8px 0 0', lineHeight: 1.45 }}>{meta.description}</p>}
      </div>
      <div>
        {pages.map((p) => (
          <div key={p.id}
            onClick={() => setRoute({ kind: 'page', id: p.id, spaceId })}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 24px', borderBottom: '1px solid var(--line)', cursor: 'pointer',
            }}>
            <IconFile size={18} color="var(--sub)" strokeWidth={1.5} />
            <div style={{ flex: 1, minWidth: 0, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {p.title || 'Без заголовка'}
            </div>
            <RowMoreButton onClick={() => onPageAction && onPageAction(p)} />
          </div>
        ))}
      </div>
      <div style={{ padding: '14px 24px', textAlign: 'center' }}>
        <button onClick={createPage} style={{
          background: 'none', border: '1px dashed var(--line)',
          padding: '10px 16px', borderRadius: 12,
          color: 'var(--sub)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <IconPlusSmall size={14} strokeWidth={2} /> Новая страница
        </button>
      </div>
    </div>
  );
}

// ─── Block model ──────────────────────────────────────────
// Каждая страница хранит массив blocks: [{id, type, content, checked?}]
// Типы: 'text' (параграф), 'heading' (крупный), 'check' (чек-лист), 'bullet' (список)
const newId = () => Math.random().toString(36).slice(2, 10);
const newBlock = (type = 'text', content = '') => ({ id: newId(), type, content });
const normalizeBlocks = (raw) => {
  const arr = Array.isArray(raw) ? raw : [];
  if (arr.length === 0) return [newBlock('text', '')];
  return arr.map((b) => ({
    id: b.id || newId(),
    type: b.type || 'text',
    content: typeof b.content === 'string' ? b.content : '',
    checked: !!b.checked,
  }));
};

const SLASH_TYPES = [
  { type: 'text',    label: 'Текст',       sub: 'Обычный параграф',          Icon: IconType },
  { type: 'heading', label: 'Заголовок',   sub: 'Раздел, крупно',            Icon: IconHash },
  { type: 'check',   label: 'Чек-лист',    sub: 'Задача с галочкой',         Icon: IconCheckSquare },
  { type: 'bullet',  label: 'Буллет',      sub: 'Точечный список',           Icon: IconList },
  { type: 'image',   label: 'Изображение', sub: 'Загрузить картинку',        Icon: IconCamera },
  { type: 'link',    label: 'Ссылка',      sub: 'URL карточкой',             Icon: IconLink },
];

// ─── Property types ───────────────────────────────────────
const PROPERTY_TYPES = [
  { type: 'text',   label: 'Текст',    sub: 'Произвольная строка',         Icon: IconType,         defaultValue: '' },
  { type: 'number', label: 'Число',    sub: '42, 3.14, —',                  Icon: IconHash,         defaultValue: null },
  { type: 'date',   label: 'Дата',     sub: 'Конкретный день',              Icon: IconCalendar,     defaultValue: null },
  { type: 'check',  label: 'Чек-бокс', sub: 'Да / нет',                     Icon: IconCheckSquare,  defaultValue: false },
  { type: 'rating', label: 'Рейтинг',  sub: '★★★★★',                        Icon: IconStar,         defaultValue: 0 },
  { type: 'link',   label: 'Ссылка',   sub: 'URL-адрес',                    Icon: IconLink,         defaultValue: '' },
];
const PROPERTY_TYPE_BY_KEY = Object.fromEntries(PROPERTY_TYPES.map(t => [t.type, t]));
const newProperty = (type = 'text', name = '') => ({
  id: newId(),
  type,
  name,
  value: PROPERTY_TYPE_BY_KEY[type]?.defaultValue ?? '',
});
const normalizeProperties = (raw) => {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((p) => ({
    id: p.id || newId(),
    type: p.type || 'text',
    name: p.name || '',
    value: p.value !== undefined ? p.value : (PROPERTY_TYPE_BY_KEY[p.type]?.defaultValue ?? ''),
  }));
};

// ─── Inline markdown → HTML ──────────────────────────────────────
// **жирный**, *курсив*, [текст](url), автолинки https://…
// Только для отображения; в state хранится исходная строка.
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function renderInlineMarkdown(text) {
  if (!text) return '';
  let html = escapeHtml(text);
  // [текст](url) — раньше автолинков, чтобы не ловить url внутри []
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline">$1</a>');
  // Голый url
  html = html.replace(/(^|[\s(])((?:https?:\/\/|www\.)[^\s<)]+)/g,
    (_m, pre, url) => `${pre}<a href="${url.startsWith('http') ? url : 'https://' + url}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline">${url}</a>`);
  // Жирный
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>');
  // Курсив (избегаем съесть ** жирного)
  html = html.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<i>$2</i>');
  // Сохраняем переводы строк для текстовых блоков (rendered в пред-элемент)
  return html;
}

// Форматирование даты «YYYY-MM-DD» → «16 апр» для отображения
function formatPropertyDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso + 'T00:00:00');
    const months = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  } catch (_) { return '—'; }
}

function PageView({ pageId, spaceId, onBack, hint, onDelete, onAction }) {
  const [page, setPage] = useStateH(null);
  const [title, setTitle] = useStateH('');
  const [blocks, setBlocks] = useStateH([]);
  const [properties, setProperties] = useStateH([]);
  const [loading, setLoading] = useStateH(true);
  const [savedAt, setSavedAt] = useStateH(null);
  const [slashFor, setSlashFor] = useStateH(null);
  const [showMenu, setShowMenu] = useStateH(false);
  const [propEditor, setPropEditor] = useStateH(null); // {kind:'add'} | {kind:'edit', id}
  const focusReq = React.useRef(null);
  const refs = React.useRef({});

  const reload = async () => {
    const { page: p } = await liveApi.loadPage(pageId);
    if (p) {
      setPage(p);
      setTitle(p.title || '');
      setBlocks(normalizeBlocks(p.blocks));
      setProperties(normalizeProperties(p.properties));
    }
    setLoading(false);
  };
  useEffectH(() => { reload(); }, [pageId, hint]);

  // Автосохранение
  useEffectH(() => {
    if (loading || !page) return;
    const t = setTimeout(async () => {
      const trimmed = blocks.length === 1 && !blocks[0].content && blocks[0].type === 'text' ? [] : blocks;
      await liveApi.updatePage(pageId, { title, blocks: trimmed, properties });
      setSavedAt(Date.now());
    }, 600);
    return () => clearTimeout(t);
  }, [title, blocks, properties]);

  // Применяем запрошенный фокус после рендера
  useEffectH(() => {
    if (!focusReq.current) return;
    const { id, end } = focusReq.current;
    const ta = refs.current[id];
    if (ta) {
      ta.focus();
      if (end) {
        const len = ta.value.length;
        try { ta.setSelectionRange(len, len); } catch (_) {}
      }
    }
    focusReq.current = null;
  });

  // Регистрация ref для блока
  const setRef = (id) => (el) => {
    if (el) refs.current[id] = el;
    else delete refs.current[id];
  };

  // ── Block ops ──
  const updateBlock = (id, patch) => {
    setBlocks((bs) => bs.map((b) => b.id === id ? { ...b, ...patch } : b));
  };
  const splitAt = (id) => {
    setBlocks((bs) => {
      const idx = bs.findIndex((b) => b.id === id);
      if (idx === -1) return bs;
      const cur = bs[idx];
      // Word/Notion-style: пустой пункт чек-листа/буллета + Enter → выходим в текст
      if ((cur.type === 'check' || cur.type === 'bullet') && !cur.content) {
        focusReq.current = { id: cur.id, end: false };
        return bs.map((b, i) => i === idx ? { ...b, type: 'text', checked: false } : b);
      }
      // Иначе создаём новый блок ниже. В чек-листе/буллете сохраняем тип.
      const nextType = (cur.type === 'check' || cur.type === 'bullet') ? cur.type : 'text';
      const nb = newBlock(nextType, '');
      focusReq.current = { id: nb.id, end: false };
      return [...bs.slice(0, idx + 1), nb, ...bs.slice(idx + 1)];
    });
  };
  const removeBlockAt = (id) => {
    setBlocks((bs) => {
      const idx = bs.findIndex((b) => b.id === id);
      if (idx === -1 || bs.length === 1) return bs;
      const prevId = bs[idx - 1]?.id || bs[idx + 1]?.id;
      if (prevId) focusReq.current = { id: prevId, end: true };
      return bs.filter((b) => b.id !== id);
    });
  };
  const setBlockType = (id, type) => {
    setBlocks((bs) => bs.map((b) => b.id === id ? { ...b, type, content: '' } : b));
    focusReq.current = { id, end: false };
    setSlashFor(null);
  };

  // ── Свойства ──
  const upsertProperty = (prop) => {
    setProperties((ps) => {
      const idx = ps.findIndex((p) => p.id === prop.id);
      if (idx === -1) return [...ps, prop];
      return ps.map((p) => p.id === prop.id ? prop : p);
    });
  };
  const deleteProperty = (id) => {
    setProperties((ps) => ps.filter((p) => p.id !== id));
  };

  // ── Render ──
  if (loading || !page) {
    return <div style={{ padding: 32, minHeight: 200 }} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 20px', borderBottom: '1px solid var(--line)',
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer', display: 'flex' }}>
          <IconChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <div style={{ flex: 1, fontSize: 13, color: 'var(--sub)' }}>База</div>
        <span style={{ fontSize: 11, color: 'var(--sub)', marginRight: 4 }}>
          {savedAt ? 'Сохранено' : ''}
        </span>
        {onAction && page && (
          <button onClick={() => onAction(page)} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--sub)', cursor: 'pointer', display: 'flex' }}>
            <IconMore size={20} strokeWidth={1.75} />
          </button>
        )}
      </div>
      <div style={{ padding: '24px 24px 12px' }}>
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (blocks[0]) {
                focusReq.current = { id: blocks[0].id, end: false };
                refs.current[blocks[0].id]?.focus();
              }
            }
          }}
          placeholder="Без заголовка"
          rows={1}
          style={{
            width: '100%', border: 'none', outline: 'none',
            background: 'transparent', resize: 'none',
            fontSize: 28, fontWeight: 600, lineHeight: 1.2,
            color: 'var(--text)', letterSpacing: -0.6,
            fontFamily: 'inherit', padding: 0,
          }}
        />
      </div>

      <PropertiesSection
        properties={properties}
        onAdd={() => setPropEditor({ kind: 'add' })}
        onEdit={(id) => setPropEditor({ kind: 'edit', id })}
        onCheckToggle={(p) => upsertProperty({ ...p, value: !p.value })}
        onRatingSet={(p, n) => upsertProperty({ ...p, value: p.value === n ? 0 : n })}
      />

      <div style={{ padding: '0 24px 32px', flex: 1 }}>
        {blocks.map((b) => (
          <PageBlock
            key={b.id}
            block={b}
            registerRef={setRef(b.id)}
            onChange={(content) => {
              updateBlock(b.id, { content });
              if (content === '/') setSlashFor(b.id);
              else if (slashFor === b.id) setSlashFor(null);
            }}
            onCheckToggle={() => updateBlock(b.id, { checked: !b.checked })}
            onEnter={() => splitAt(b.id)}
            onBackspaceAtStart={() => removeBlockAt(b.id)}
          />
        ))}
      </div>

      {slashFor && (
        <SlashSheet
          onPick={(type) => setBlockType(slashFor, type)}
          onClose={() => {
            // Очистим '/' в блоке если меню закрыли без выбора
            const cur = blocks.find((b) => b.id === slashFor);
            if (cur && cur.content === '/') updateBlock(slashFor, { content: '' });
            setSlashFor(null);
          }}
        />
      )}

      {propEditor && (
        <PropertyEditorSheet
          mode={propEditor.kind}
          initial={propEditor.kind === 'edit' ? properties.find((p) => p.id === propEditor.id) : null}
          onSave={(prop) => { upsertProperty(prop); setPropEditor(null); }}
          onDelete={(id) => { deleteProperty(id); setPropEditor(null); }}
          onClose={() => setPropEditor(null)}
        />
      )}
    </div>
  );
}

function PageBlock({ block, registerRef, onChange, onCheckToggle, onEnter, onBackspaceAtStart }) {
  const isHeading = block.type === 'heading';
  const isCheck   = block.type === 'check';
  const isBullet  = block.type === 'bullet';
  const isImage   = block.type === 'image';
  const isLink    = block.type === 'link';
  const taLocal = React.useRef(null);
  const [focused, setFocused] = React.useState(false);
  // Авторесайз — реагируем на изменения block.content (например, после reload)
  React.useEffect(() => {
    const el = taLocal.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  }, [block.content, block.type]);

  const taStyle = {
    width: '100%', border: 'none', outline: 'none',
    background: 'transparent', resize: 'none',
    fontFamily: 'inherit', padding: 0,
    fontSize: isHeading ? 22 : 16,
    fontWeight: isHeading ? 600 : 400,
    lineHeight: isHeading ? 1.25 : 1.5,
    letterSpacing: isHeading ? -0.3 : 0,
    color: 'var(--text)',
    textDecoration: (isCheck && block.checked) ? 'line-through' : 'none',
    opacity: (isCheck && block.checked) ? 0.45 : 1,
  };

  const placeholder =
    isHeading ? 'Заголовок'
    : isCheck   ? 'Задача'
    : isBullet  ? 'Пункт'
    : 'Запишите или нажмите «/»';

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter && onEnter();
      return;
    }
    if (e.key === 'Backspace' && e.target.value === '' && e.target.selectionStart === 0) {
      e.preventDefault();
      onBackspaceAtStart && onBackspaceAtStart();
    }
  };

  const taRef = React.useCallback((el) => {
    taLocal.current = el;
    if (registerRef) registerRef(el);
    if (el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  }, [registerRef]);
  const handleInput = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
    onChange(e.target.value);
  };

  // Рендер: textarea при фокусе или пустой блок, отрендеренный markdown — иначе.
  // Так пользователь редактирует исходник (с **звёздочками**), но видит стилизацию.
  const showRendered = !focused && block.content && (block.type === 'text' || block.type === 'heading' || block.type === 'check' || block.type === 'bullet');
  const renderedHtml = showRendered ? renderInlineMarkdown(block.content) : null;

  const onLinkClick = (e) => {
    if (e.target.tagName === 'A') {
      e.stopPropagation();
      // browser открывает в новой вкладке через target="_blank"
      return;
    }
    // Любой другой клик в стилизованной зоне — переход в режим редактирования
    setFocused(true);
    setTimeout(() => taLocal.current?.focus(), 0);
  };

  const renderedView = (
    <pre
      onClick={onLinkClick}
      style={{
        ...taStyle, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        cursor: 'text', minHeight: isHeading ? 28 : 22,
      }}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );

  const editor = (
    <textarea
      ref={taRef}
      value={block.content}
      onChange={handleInput}
      onKeyDown={handleKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      rows={1}
      style={{ ...taStyle, overflow: 'hidden' }}
    />
  );

  const inner = showRendered ? renderedView : editor;

  if (isImage) {
    return <ImageBlockView block={block} onChange={onChange} />;
  }
  if (isLink) {
    return <LinkBlockView block={block} onChange={onChange} focused={focused} setFocused={setFocused} />;
  }
  if (isCheck) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '4px 0', minHeight: 28 }}>
        <button onClick={onCheckToggle} style={{
          width: 22, height: 22, borderRadius: 11, padding: 0,
          border: `1.6px solid ${block.checked ? 'var(--accent)' : 'var(--line)'}`,
          background: block.checked ? 'var(--accent)' : 'transparent',
          display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0,
          marginTop: 4,
        }}>
          {block.checked && <IconCheck size={12} color="#fff" strokeWidth={2.5} />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>{inner}</div>
      </div>
    );
  }
  if (isBullet) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '4px 0' }}>
        <span style={{
          width: 22, height: 28, display: 'grid', placeItems: 'center',
          color: 'var(--sub)', fontSize: 22, lineHeight: 1, flexShrink: 0,
        }}>•</span>
        <div style={{ flex: 1, minWidth: 0 }}>{inner}</div>
      </div>
    );
  }
  return (
    <div style={{ padding: isHeading ? '12px 0 4px' : '4px 0' }}>
      {inner}
    </div>
  );
}

// ─── ImageBlockView ──────────────────────────────────────────────
// content держит публичный URL загруженного изображения. Если пусто —
// показываем кнопку загрузки.
function ImageBlockView({ block, onChange }) {
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');
  const inputRef = React.useRef(null);

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    setErr('');
    const { url, error } = await liveApi.uploadImage(file);
    setBusy(false);
    if (error) {
      setErr(dotErr(error) || 'Не удалось загрузить');
      return;
    }
    onChange(url);
  };

  if (!block.content) {
    return (
      <div style={{ padding: '8px 0' }}>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => upload(e.target.files?.[0])} />
        <button onClick={() => inputRef.current?.click()} disabled={busy} style={{
          width: '100%', minHeight: 120,
          border: '1px dashed var(--line)', borderRadius: 12,
          background: 'var(--chip)', color: 'var(--sub)',
          fontSize: 14, fontFamily: 'inherit', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 6,
        }}>
          <IconCamera size={20} strokeWidth={1.6} />
          <span>{busy ? 'Загружаем…' : 'Загрузить изображение'}</span>
          {err && <span style={{ color: '#E44', fontSize: 12, marginTop: 4 }}>{err}</span>}
        </button>
      </div>
    );
  }
  return (
    <div style={{ padding: '8px 0' }}>
      <img src={block.content} alt="" style={{
        maxWidth: '100%', borderRadius: 12, display: 'block',
      }} onClick={() => window.open(block.content, '_blank')} />
    </div>
  );
}

// ─── LinkBlockView ──────────────────────────────────────────────
// content держит URL. Когда пустой — input. Когда есть — карточка
// (favicon + домен + URL), кликабельная.
function LinkBlockView({ block, onChange, focused, setFocused }) {
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    if (focused) inputRef.current?.focus();
  }, [focused]);

  if (!block.content || focused) {
    return (
      <div style={{ padding: '8px 0' }}>
        <input
          ref={inputRef}
          autoFocus
          type="url"
          value={block.content || ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setFocused(false)}
          placeholder="https://"
          style={{
            width: '100%', height: 44, borderRadius: 12, background: 'var(--chip)',
            border: 'none', outline: 'none', padding: '0 14px',
            fontSize: 15, color: 'var(--text)', fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
      </div>
    );
  }
  let host = '';
  try { host = new URL(block.content.startsWith('http') ? block.content : 'https://' + block.content).hostname; } catch (_) { host = block.content; }
  const favicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
  return (
    <div style={{ padding: '8px 0' }}>
      <a href={block.content.startsWith('http') ? block.content : 'https://' + block.content} target="_blank" rel="noopener"
         onClick={(e) => e.stopPropagation()}
         style={{ display: 'block', textDecoration: 'none' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', borderRadius: 12,
          background: 'var(--chip)', color: 'var(--text)',
        }}>
          <img src={favicon} width={32} height={32} style={{ borderRadius: 6, flexShrink: 0 }}
            onError={(e) => { e.target.style.display = 'none'; }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{host}</div>
            <div style={{ fontSize: 12, color: 'var(--sub)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{block.content}</div>
          </div>
          <IconExternalLink size={14} color="var(--sub)" strokeWidth={1.75} />
        </div>
      </a>
      <div style={{ marginTop: 4, textAlign: 'right' }}>
        <button onClick={() => setFocused(true)} style={{
          background: 'none', border: 'none', padding: 4,
          color: 'var(--sub)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
        }}>Изменить</button>
      </div>
    </div>
  );
}

function SlashSheet({ onPick, onClose }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, display: 'flex', flexDirection: 'column' }}>
      <div onClick={onClose} style={{ flex: 1, background: 'rgba(0,0,0,0.18)' }} />
      <div style={{
        background: 'var(--bg)', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        boxShadow: '0 -8px 30px rgba(0,0,0,0.12)', paddingBottom: 16,
      }}>
        <div style={{ padding: '10px 0 6px', display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line)' }} />
        </div>
        <div style={{ padding: '6px 16px 10px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            height: 40, padding: '0 14px', borderRadius: 12, background: 'var(--chip)',
          }}>
            <IconSlash size={14} color="var(--sub)" strokeWidth={2.2} />
            <span style={{ fontSize: 14, color: 'var(--text)' }}>Вставить блок</span>
          </div>
        </div>
        {SLASH_TYPES.map((it, i) => (
          <div key={i} onClick={() => onPick(it.type)} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '12px 20px', cursor: 'pointer',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--chip)', display: 'grid', placeItems: 'center',
              color: 'var(--text)',
            }}>
              <it.Icon size={18} strokeWidth={1.8} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{it.label}</div>
              <div style={{ fontSize: 12, color: 'var(--sub)' }}>{it.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PropertiesSection: список свойств в шапке страницы ──────────
function PropertiesSection({ properties, onAdd, onEdit, onCheckToggle, onRatingSet }) {
  return (
    <div style={{ padding: '4px 24px 14px' }}>
      {properties.map((p) => (
        <PropertyRow
          key={p.id}
          property={p}
          onEdit={() => onEdit(p.id)}
          onCheckToggle={() => onCheckToggle(p)}
          onRatingSet={(n) => onRatingSet(p, n)}
        />
      ))}
      <div onClick={onAdd} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 0', cursor: 'pointer',
        color: 'var(--accent)', fontSize: 13, fontWeight: 500,
      }}>
        <IconPlusSmall size={14} strokeWidth={2.2} />
        <span>Добавить свойство</span>
      </div>
    </div>
  );
}

function PropertyRow({ property, onEdit, onCheckToggle, onRatingSet }) {
  const meta = PROPERTY_TYPE_BY_KEY[property.type] || PROPERTY_TYPE_BY_KEY['text'];
  const Icon = meta.Icon;

  // Чек-бокс и рейтинг — кликаются прямо в строке. Остальные — открывают редактор.
  const inlineHandled = property.type === 'check' || property.type === 'rating';
  const onRowClick = inlineHandled ? undefined : onEdit;

  return (
    <div onClick={onRowClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 0', borderBottom: '1px solid var(--line)',
      cursor: onRowClick ? 'pointer' : 'default',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        width: 130, flexShrink: 0, color: 'var(--sub)',
      }}>
        <Icon size={14} strokeWidth={1.8} />
        <span style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {property.name || meta.label}
        </span>
      </div>
      <div style={{ flex: 1, fontSize: 14, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}
           onClick={inlineHandled ? (e) => { e.stopPropagation(); onEdit && onEdit(); } : undefined}>
        <PropertyValueView property={property} onCheckToggle={onCheckToggle} onRatingSet={onRatingSet} />
      </div>
    </div>
  );
}

function PropertyValueView({ property, onCheckToggle, onRatingSet }) {
  const v = property.value;
  if (property.type === 'check') {
    return (
      <button onClick={(e) => { e.stopPropagation(); onCheckToggle(); }} style={{
        width: 22, height: 22, borderRadius: 11, padding: 0,
        border: `1.6px solid ${v ? 'var(--accent)' : 'var(--line)'}`,
        background: v ? 'var(--accent)' : 'transparent',
        display: 'grid', placeItems: 'center', cursor: 'pointer',
      }}>{v && <IconCheck size={12} color="#fff" strokeWidth={2.5} />}</button>
    );
  }
  if (property.type === 'rating') {
    return (
      <div style={{ display: 'flex', gap: 0 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={(e) => { e.stopPropagation(); onRatingSet(n); }} style={{
            background: 'none', border: 'none', padding: 8, cursor: 'pointer', display: 'flex',
          }}>
            <IconStar size={18} strokeWidth={2}
              color={n <= v ? 'var(--accent)' : 'var(--line)'}
              style={{ fill: n <= v ? 'var(--accent)' : 'transparent' }}
            />
          </button>
        ))}
      </div>
    );
  }
  if (property.type === 'date') {
    return <span style={{ color: v ? 'var(--text)' : 'var(--sub)' }}>{v ? formatPropertyDate(v) : '—'}</span>;
  }
  if (property.type === 'number') {
    return <span style={{ color: (v !== null && v !== '') ? 'var(--text)' : 'var(--sub)' }}>{(v !== null && v !== '') ? v : '—'}</span>;
  }
  if (property.type === 'link') {
    return <span style={{ color: v ? 'var(--accent)' : 'var(--sub)', wordBreak: 'break-all' }}>{v || '—'}</span>;
  }
  // text — default
  return <span style={{ color: v ? 'var(--text)' : 'var(--sub)' }}>{v || '—'}</span>;
}

// ─── PropertyEditorSheet ─────────────────────────────────────────
// Двухшаговый bottom-sheet:
// 1) выбор типа (если новый и type не выбран ещё)
// 2) ввод имени + значения
function PropertyEditorSheet({ mode, initial, onSave, onDelete, onClose }) {
  const isEdit = mode === 'edit';
  const [step, setStep] = React.useState(isEdit ? 'edit' : 'pick');
  const [draft, setDraft] = React.useState(
    isEdit ? { ...initial } : newProperty('text', '')
  );

  const pickType = (type) => {
    setDraft({ ...newProperty(type, ''), id: draft.id });
    setStep('edit');
  };

  const save = () => {
    if (!draft.name.trim()) return;
    onSave(draft);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', flexDirection: 'column' }}>
      <div onClick={onClose} style={{ flex: 1, background: 'rgba(0,0,0,0.28)' }} />
      <div style={{
        background: 'var(--bg)', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        boxShadow: '0 -8px 30px rgba(0,0,0,0.12)', paddingBottom: 22, maxHeight: '80%',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '10px 0 6px', display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line)' }} />
        </div>

        {step === 'pick' && (
          <>
            <div style={{ padding: '4px 20px 10px' }}>
              <div style={{ fontSize: 17, fontWeight: 600 }}>Тип свойства</div>
              <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 4 }}>
                Как будет выглядеть и редактироваться это свойство.
              </div>
            </div>
            <div style={{ overflowY: 'auto' }}>
              {PROPERTY_TYPES.map((t) => (
                <div key={t.type} onClick={() => pickType(t.type)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 20px', cursor: 'pointer',
                  borderBottom: '1px solid var(--line)',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: 'var(--chip)',
                    color: 'var(--text)', display: 'grid', placeItems: 'center', flexShrink: 0,
                  }}>
                    <t.Icon size={15} strokeWidth={1.9} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{t.sub}</div>
                  </div>
                  <IconChevronRight size={14} color="var(--sub)" strokeWidth={2} />
                </div>
              ))}
            </div>
          </>
        )}

        {step === 'edit' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 20px 10px' }}>
              <button onClick={isEdit ? onClose : () => setStep('pick')} style={{
                background: 'none', border: 'none', padding: 0,
                color: 'var(--sub)', fontSize: 14, fontFamily: 'inherit', cursor: 'pointer',
              }}>{isEdit ? 'Отмена' : '‹ Назад'}</button>
              <div style={{ fontSize: 17, fontWeight: 600 }}>
                {isEdit ? 'Свойство' : 'Новое свойство'}
              </div>
              <button onClick={save} disabled={!draft.name.trim()} style={{
                background: 'none', border: 'none', padding: 0,
                color: draft.name.trim() ? 'var(--accent)' : 'rgba(60,60,67,0.4)',
                fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
              }}>Готово</button>
            </div>

            <div style={{ padding: '0 20px 14px' }}>
              <div style={{ fontSize: 12, color: 'var(--sub)', letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 8 }}>Название</div>
              <input
                autoFocus={!isEdit}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder={PROPERTY_TYPE_BY_KEY[draft.type]?.label || 'Свойство'}
                style={{
                  width: '100%', height: 44, borderRadius: 12, background: 'var(--chip)',
                  border: 'none', outline: 'none', padding: '0 14px', fontSize: 15,
                  color: 'var(--text)', fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />

              <div style={{ fontSize: 12, color: 'var(--sub)', letterSpacing: 0.3, textTransform: 'uppercase', margin: '18px 0 8px' }}>Значение</div>
              <PropertyValueEditor draft={draft} setDraft={setDraft} />

              {isEdit && (
                <div style={{ marginTop: 22, textAlign: 'center' }}>
                  <button onClick={() => onDelete(draft.id)} style={{
                    background: 'none', border: 'none', color: '#E44',
                    fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                  }}>
                    <IconTrash size={16} strokeWidth={1.75} /> Удалить свойство
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PropertyValueEditor({ draft, setDraft }) {
  const inputBox = {
    width: '100%', height: 44, borderRadius: 12, background: 'var(--chip)',
    border: 'none', outline: 'none', padding: '0 14px', fontSize: 15,
    color: 'var(--text)', fontFamily: 'inherit', boxSizing: 'border-box',
  };
  if (draft.type === 'text') {
    return (
      <input value={draft.value || ''} onChange={(e) => setDraft({ ...draft, value: e.target.value })}
        placeholder="Значение" style={inputBox} />
    );
  }
  if (draft.type === 'number') {
    return (
      <input type="number" value={draft.value === null || draft.value === undefined ? '' : draft.value}
        onChange={(e) => setDraft({ ...draft, value: e.target.value === '' ? null : Number(e.target.value) })}
        placeholder="42" style={inputBox} />
    );
  }
  if (draft.type === 'date') {
    return (
      <input type="date" value={draft.value || ''} onChange={(e) => setDraft({ ...draft, value: e.target.value || null })}
        style={inputBox} />
    );
  }
  if (draft.type === 'link') {
    return (
      <input type="url" value={draft.value || ''} onChange={(e) => setDraft({ ...draft, value: e.target.value })}
        placeholder="https://" style={inputBox} />
    );
  }
  if (draft.type === 'check') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px', borderRadius: 12, background: 'var(--chip)',
      }}>
        <button onClick={() => setDraft({ ...draft, value: !draft.value })} style={{
          width: 22, height: 22, borderRadius: 11, padding: 0,
          border: `1.6px solid ${draft.value ? 'var(--accent)' : 'var(--line)'}`,
          background: draft.value ? 'var(--accent)' : 'transparent',
          display: 'grid', placeItems: 'center', cursor: 'pointer',
        }}>{draft.value && <IconCheck size={12} color="#fff" strokeWidth={2.5} />}</button>
        <span style={{ fontSize: 14, color: 'var(--text)' }}>{draft.value ? 'Да' : 'Нет'}</span>
      </div>
    );
  }
  if (draft.type === 'rating') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px',
        borderRadius: 12, background: 'var(--chip)',
      }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setDraft({ ...draft, value: draft.value === n ? 0 : n })} style={{
            background: 'none', border: 'none', padding: 2, cursor: 'pointer', display: 'flex',
          }}>
            <IconStar size={22} strokeWidth={2}
              color={n <= (draft.value || 0) ? 'var(--accent)' : 'var(--line)'}
              style={{ fill: n <= (draft.value || 0) ? 'var(--accent)' : 'transparent' }}
            />
          </button>
        ))}
      </div>
    );
  }
  return null;
}

function PageActionSheet({ onClose, onDelete }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, display: 'flex', flexDirection: 'column' }}>
      <div onClick={onClose} style={{ flex: 1, background: 'rgba(0,0,0,0.25)' }} />
      <div style={{
        background: 'var(--bg)', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        boxShadow: '0 -8px 30px rgba(0,0,0,0.12)', paddingBottom: 16,
      }}>
        <div style={{ padding: '10px 0 6px', display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line)' }} />
        </div>
        <div onClick={onDelete} style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px 24px', cursor: 'pointer', color: '#E44',
        }}>
          <IconTrash size={18} strokeWidth={1.75} />
          <span style={{ fontSize: 15, fontWeight: 500 }}>Удалить страницу</span>
        </div>
      </div>
    </div>
  );
}

// ─── Generic action sheet for rows in tree / space view / page header ───
// items: [{Icon, label, onClick, danger}]
function ItemActionSheet({ title, subtitle, headerIcon, items, onClose }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', flexDirection: 'column' }}>
      <div onClick={onClose} style={{ flex: 1, background: 'rgba(0,0,0,0.35)' }} />
      <div style={{
        background: 'var(--bg)', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        boxShadow: '0 -8px 30px rgba(0,0,0,0.12)', padding: '10px 0 22px',
      }}>
        <div style={{ display: 'grid', placeItems: 'center', padding: '2px 0 8px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line)' }} />
        </div>
        {(title || subtitle) && (
          <div style={{ padding: '6px 20px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
            {headerIcon && (
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--chip)', display: 'grid', placeItems: 'center', color: 'var(--sub)',
                flexShrink: 0,
              }}>{headerIcon}</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              {title && <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>}
              {subtitle && <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{subtitle}</div>}
            </div>
          </div>
        )}
        <div style={{ borderTop: '1px solid var(--line)' }}>
          {items.map((it, i) => (
            <div key={i} onClick={(e) => { e.stopPropagation(); it.onClick && it.onClick(); }} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 20px',
              borderBottom: i < items.length - 1 ? '1px solid var(--line)' : 'none',
              cursor: 'pointer',
              color: it.danger ? '#E44' : 'var(--text)',
            }}>
              <it.Icon size={18} strokeWidth={1.75} />
              <span style={{ fontSize: 15 }}>{it.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// MovePickerSheet — выбор места назначения для страницы
function MovePickerSheet({ movePicker, onClose, onPick }) {
  const [spaces, setSpaces] = React.useState([]);
  const [pagesBySpace, setPagesBySpace] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [openSpaces, setOpenSpaces] = React.useState({});

  React.useEffect(() => {
    (async () => {
      const { spaces: sps } = await liveApi.loadSpaces();
      const { pages: allPages } = await liveApi.loadPages();
      const byId = {};
      sps.forEach((sp) => { byId[sp.id] = []; });
      allPages.forEach((p) => {
        if (p.id === movePicker.pageId) return; // не показываем саму себя как target
        if (byId[p.space_id]) byId[p.space_id].push(p);
      });
      setSpaces(sps);
      setPagesBySpace(byId);
      const open = {};
      sps.forEach((sp) => { open[sp.id] = sp.id === movePicker.currentSpaceId; });
      setOpenSpaces(open);
      setLoading(false);
    })();
  }, [movePicker]);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column' }}>
      <div onClick={onClose} style={{ flex: 1, background: 'rgba(0,0,0,0.35)' }} />
      <div style={{
        background: 'var(--bg)', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        boxShadow: '0 -8px 30px rgba(0,0,0,0.12)', maxHeight: '75%', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '10px 0 6px', display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line)' }} />
        </div>
        <div style={{ padding: '4px 20px 12px' }}>
          <div style={{ fontSize: 17, fontWeight: 600 }}>Переместить в…</div>
          <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 4 }}>
            Выбери пространство (верх) или страницу (для вложения).
          </div>
        </div>
        <div style={{ overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--sub)', fontSize: 14 }}>Загружаем…</div>
          ) : (
            spaces.map((sp) => {
              const meta = parseSpaceMeta(sp);
              const Icon = meta.Icon;
              const isCurrentSpace = sp.id === movePicker.currentSpaceId;
              const open = openSpaces[sp.id];
              const pages = pagesBySpace[sp.id] || [];
              return (
                <div key={sp.id}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 20px', borderBottom: '1px solid var(--line)',
                  }}>
                    <span onClick={() => setOpenSpaces((s) => ({ ...s, [sp.id]: !s[sp.id] }))} style={{
                      color: 'var(--sub)', display: 'flex', width: 14,
                      transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 160ms', cursor: 'pointer',
                    }}><IconChevronDown size={14} strokeWidth={2} /></span>
                    <span style={{ color: meta.color, display: 'flex' }}><Icon size={16} strokeWidth={1.75} /></span>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{sp.name}</span>
                    <button onClick={() => onPick({ spaceId: sp.id, parentPageId: null })} style={{
                      background: 'var(--accent-soft)', color: 'var(--accent)',
                      border: 'none', borderRadius: 8, padding: '4px 10px',
                      fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                    }}>{isCurrentSpace && !movePicker.currentParentId ? 'Здесь' : 'В корень'}</button>
                  </div>
                  {open && pages.map((p) => {
                    const isCurrent = p.id === movePicker.currentParentId;
                    return (
                      <div key={p.id} onClick={() => !isCurrent && onPick({ spaceId: sp.id, parentPageId: p.id })}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 24px', paddingLeft: 56,
                          borderBottom: '1px solid var(--line)',
                          cursor: isCurrent ? 'default' : 'pointer',
                          opacity: isCurrent ? 0.45 : 1,
                        }}>
                        <IconFile size={14} color="var(--sub)" strokeWidth={1.5} />
                        <div style={{ flex: 1, minWidth: 0, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.title || 'Без заголовка'}
                        </div>
                        {isCurrent && <span style={{ fontSize: 11, color: 'var(--sub)' }}>текущее</span>}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// Маленькая кнопка ⋯ для строк
function RowMoreButton({ onClick }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick && onClick(); }} style={{
      background: 'none', border: 'none', padding: 10, cursor: 'pointer',
      color: 'var(--sub)', display: 'flex', alignItems: 'center',
      borderRadius: 8, margin: -6,
    }}>
      <IconMore size={18} strokeWidth={1.75} />
    </button>
  );
}

// ─── PROFILE ──────────────────────────────────────────────
function ProfileView({ onGo, live }) {
  const MOCK = {
    name: 'Алиса Королёва', email: 'alice@mail.com', plan: 'plus',
    stats: { tasks: 127, streak: 12, pages: 42 },
  };
  // В live-режиме стартуем с пустых данных и сразу прячем шапку до загрузки —
  // чтобы не было вспышки моковой Алисы.
  const [data, setData] = useStateH(live ? null : MOCK);

  useEffectH(() => {
    if (!live || !liveApi) return;
    let cancelled = false;
    (async () => {
      const [{ profile }, { stats }] = await Promise.all([
        liveApi.loadProfile(),
        liveApi.loadStats(),
      ]);
      if (cancelled || !profile) return;
      setData({
        name: profile.name || (profile.email || '').split('@')[0],
        email: profile.email,
        plan: profile.plan || 'free',
        avatarUrl: profile.avatar_url || null,
        stats: stats || { tasks: 0, streak: 0, pages: 0 },
      });
    })();
    return () => { cancelled = true; };
  }, [live]);

  // Пока грузим — показываем пустой блок с placeholder. Так не будет «Алисы Королёвой».
  if (!data) {
    return (
      <div style={{ padding: 32, minHeight: 200 }} />
    );
  }

  const initial = (data.name || data.email || '?').trim().charAt(0).toUpperCase();

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Крупная шапка — человек, не список */}
      <div style={{
        margin: '8px 16px 20px', padding: '26px 20px',
        borderRadius: 20, background: 'var(--accent-soft)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 36,
          background: data.avatarUrl ? `center/cover no-repeat url(${data.avatarUrl})` : 'var(--accent)',
          color: '#fff',
          display: 'grid', placeItems: 'center',
          fontSize: 28, fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        }}>{!data.avatarUrl && initial}</div>
        <div style={{ fontSize: 20, fontWeight: 600, marginTop: 14, letterSpacing: -0.3 }}>{data.name}</div>
        <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 2 }}>{data.email}</div>
        {data.plan === 'plus' ? (
          <div style={{
            marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 99,
            background: 'var(--accent)', color: '#fff',
            fontSize: 12, fontWeight: 600, letterSpacing: 0.04,
          }}>
            <IconStar size={12} strokeWidth={2.2} /> dot. Plus
          </div>
        ) : (
          <div style={{
            marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 99,
            background: 'transparent', color: 'var(--sub)',
            border: '1px solid var(--line)',
            fontSize: 12, fontWeight: 600, letterSpacing: 0.04,
          }}>
            Free
          </div>
        )}
      </div>

      {/* Сводка — маленькая статистика по делу, чтобы это был «я», а не «меню» */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '0 16px 22px' }}>
        <Stat n={String(data.stats.tasks)} l="Задач" />
        <Stat n={String(data.stats.streak)}  l="Дней подряд" />
        <Stat n={String(data.stats.pages)}  l="Страниц" />
      </div>

      {/* Короткий список — личные действия, не параметры приложения */}
      <div style={{ borderTop: '1px solid var(--line)' }}>
        <PRow icon={<IconUser size={18} />}     label="Редактировать профиль" onClick={() => onGo && onGo('profile-edit')} />
        <PRow icon={<IconStar size={18} />}     label="Управление подпиской" sub={data.plan === 'plus' ? 'Plus · до 12 мая 2026' : 'Бесплатный · перейти на Plus'} onClick={() => onGo && onGo('profile-sub')} />
        <PRow icon={<IconSettings size={18} />} label="Настройки приложения" onClick={() => onGo && onGo('settings')} />
        <PRow icon={<IconInfo size={18} />}     label="Помощь и поддержка" onClick={() => onGo && onGo('profile-help')} />
      </div>

      <div style={{ padding: '22px 24px 8px', textAlign: 'center' }}>
        <button onClick={async () => {
          if (live && liveApi) await liveApi.signOut();
          onGo && onGo('login');
        }} style={{
          background: 'none', border: 'none', color: '#E44',
          fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}><IconLogOut size={16} strokeWidth={1.75} /> Выйти из аккаунта</button>
      </div>
    </div>
  );
}

function Stat({ n, l }) {
  return (
    <div style={{
      padding: '14px 10px', borderRadius: 14,
      background: 'var(--chip)', textAlign: 'center',
    }}>
      <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.3 }}>{n}</div>
      <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 2, letterSpacing: 0.04 }}>{l}</div>
    </div>
  );
}

function PRow({ icon, label, sub, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 24px', borderBottom: '1px solid var(--line)',
      cursor: 'pointer',
    }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--chip)', display: 'grid', placeItems: 'center', color: 'var(--text)' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 2 }}>{sub}</div>}
      </div>
      <IconChevronRight size={14} color="var(--sub)" strokeWidth={2} />
    </div>
  );
}
function MenuGroup({ rows }) {
  return (
    <div style={{ borderTop: '1px solid var(--line)' }}>
      {rows.map(([label, value, color], i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center',
          padding: '14px 24px', borderBottom: '1px solid var(--line)',
          cursor: 'pointer',
        }}>
          <div style={{ flex: 1, fontSize: 15 }}>{label}</div>
          {value && <span style={{ color: color || 'var(--sub)', fontSize: 14, marginRight: 10 }}>{value}</span>}
          <IconChevronRight size={14} color="var(--sub)" strokeWidth={1.75} />
        </div>
      ))}
    </div>
  );
}

// ─── PLANS ──────────────────────────────────────────────
function Plans({ onGo }) {
  const [plan, setPlan] = useStateH('year');
  return (
    <div style={{ padding: '14px 22px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={() => onGo && onGo('home')} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text)', cursor: 'pointer' }}>
          <IconChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <Logo size={22} />
        <span style={{ width: 22 }} />
      </div>

      <div style={{ display: 'inline-flex', alignSelf: 'flex-start', background: 'var(--accent-soft)', color: 'var(--accent)', padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: 0.06, textTransform: 'uppercase', marginBottom: 14 }}>dot. Plus</div>
      <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.8, margin: '0 0 10px', lineHeight: 1.1 }}>Без лимитов, везде</h1>
      <p style={{ color: 'var(--sub)', fontSize: 15, margin: 0, marginBottom: 22 }}>Синхронизация, неограниченная база знаний, история активности.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
        {[
          'Неограниченные страницы в базе',
          'Привычки и задачи без ограничений',
          'История активности, 1 год',
          'Приоритет в поддержке',
        ].map((f) => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <span style={{ width: 20, height: 20, borderRadius: 10, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center' }}>
              <IconCheck size={12} color="currentColor" strokeWidth={2.5} />
            </span>
            {f}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
        {[
          { id: 'month', label: 'Ежемесячно', price: '199 ₽ / мес.' },
          { id: 'year',  label: 'Ежегодно',   price: '1 490 ₽ / год', sub: '−37%' },
        ].map((o) => (
          <div key={o.id} onClick={() => setPlan(o.id)} style={{
            padding: 14, borderRadius: 14,
            border: `1.5px solid ${plan === o.id ? 'var(--accent)' : 'var(--line)'}`,
            background: plan === o.id ? 'var(--accent-soft)' : 'var(--surface)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: 10,
              border: `1.5px solid ${plan === o.id ? 'var(--accent)' : 'var(--line)'}`,
              display: 'grid', placeItems: 'center',
            }}>
              {plan === o.id && <div style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--accent)' }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{o.label}</div>
              <div style={{ fontSize: 13, color: 'var(--sub)' }}>{o.price}</div>
            </div>
            {o.sub && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', padding: '3px 8px', borderRadius: 99, background: '#fff', border: '1px solid var(--accent)' }}>{o.sub}</span>}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <Button kind="primary" full>Попробовать 7 дней бесплатно</Button>
        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--sub)', marginTop: 10 }}>Списание после пробного периода. Отмена в любой момент.</div>
      </div>
    </div>
  );
}

// Дуальный режим во время ESM-миграции: window для legacy, export для нового кода.
Object.assign(window, { Home, DotHeader, Fab, DotTabs, TasksView, TasksEmpty, TaskSection, RoundCheck, HabitsView, HabitsViewLive, HabitsEmpty, BaseView, BaseViewMock, BaseHeader, PageNode, PageRow, BaseViewLive, BaseTreeView, SpaceView, PageView, PageBlock, ImageBlockView, LinkBlockView, SlashSheet, PropertiesSection, PropertyRow, PropertyValueView, PropertyEditorSheet, PropertyValueEditor, PageActionSheet, ItemActionSheet, MovePickerSheet, RowMoreButton, ProfileView, Stat, PRow, MenuGroup, Plans });
export { Home, DotHeader, Fab, DotTabs, TasksView, TasksEmpty, TaskSection, RoundCheck, HabitsView, HabitsViewLive, HabitsEmpty, BaseView, BaseViewMock, BaseHeader, PageNode, PageRow, BaseViewLive, BaseTreeView, SpaceView, PageView, PageBlock, ImageBlockView, LinkBlockView, SlashSheet, PropertiesSection, PropertyRow, PropertyValueView, PropertyEditorSheet, PropertyValueEditor, PageActionSheet, ItemActionSheet, MovePickerSheet, RowMoreButton, ProfileView, Stat, PRow, MenuGroup, Plans };
