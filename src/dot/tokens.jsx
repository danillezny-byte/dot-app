import React from 'react';
// Shared data + design system tokens for dot.

const VARIANT_META = {
  light: { label: 'Светлая', bg: '#F5F5F7', surface: '#FFFFFF', text: '#111', sub: 'rgba(60,60,67,0.6)', line: 'rgba(60,60,67,0.12)', chip: 'rgba(0,0,0,0.04)' },
  dark:  { label: 'Тёмная',  bg: '#000000', surface: '#1C1C1E', text: '#FFF', sub: 'rgba(235,235,245,0.6)', line: 'rgba(84,84,88,0.5)', chip: 'rgba(255,255,255,0.06)' },
  warm:  { label: 'Тёплая',  bg: '#F4F0E8', surface: '#FBF8F1', text: '#2A2418', sub: 'rgba(42,36,24,0.6)', line: 'rgba(42,36,24,0.1)', chip: 'rgba(42,36,24,0.04)' },
};

const ACCENTS = {
  violet: { hex: '#6D3CF0', soft: 'rgba(109,60,240,0.12)', name: 'Фиолетовый' },
  blue:   { hex: '#007AFF', soft: 'rgba(0,122,255,0.12)',  name: 'Синий' },
  orange: { hex: '#FF6A00', soft: 'rgba(255,106,0,0.14)',  name: 'Оранжевый' },
  green:  { hex: '#2E8B57', soft: 'rgba(46,139,87,0.14)',  name: 'Зелёный' },
};

const FONTS = {
  inter:   { label: 'Inter', stack: "'Inter', -apple-system, system-ui, sans-serif" },
  figtree: { label: 'Figtree (гуманист.)', stack: "'Figtree', -apple-system, system-ui, sans-serif" },
  jakarta: { label: 'Plus Jakarta Sans', stack: "'Plus Jakarta Sans', -apple-system, system-ui, sans-serif" },
};

// Sample tasks, habits, base
const TASKS = [
  { id: 't1', title: 'Позвонить зубному',            when: 'Сегодня',   done: false, prio: 'normal' },
  { id: 't2', title: 'Обновить портфолио',           when: 'Сегодня',   done: false, prio: 'urgent' },
  { id: 't3', title: 'Забрать посылку на почте',     when: 'Сегодня',   done: true,  prio: null },
  { id: 't4', title: 'Созвон с командой, 16:00',     when: 'Сегодня',   done: false, prio: 'normal' },
  { id: 't5', title: 'Подготовить презентацию',      when: 'Завтра',    done: false, prio: 'urgent' },
  { id: 't6', title: 'Встреча с Настей, 18:00',      when: 'Завтра',    done: false, prio: 'normal' },
  { id: 't7', title: 'Купить продукты',              when: 'Завтра',    done: false, prio: null },
  { id: 't8', title: 'Подготовить отчёт к пятнице',  when: 'На неделе', done: false, prio: 'urgent' },
  { id: 't9', title: 'Забронировать билеты',         when: 'На неделе', done: false, prio: 'normal' },
  { id: 't10', title: 'Сходить к стоматологу',       when: 'На неделе', done: false, prio: 'low' },
  { id: 't11', title: 'Разобрать гардероб',          when: 'Позже',     done: false, prio: 'low' },
  { id: 't12', title: 'Перечитать «Четыре тысячи недель»', when: 'Позже', done: false, prio: null },
  { id: 't13', title: 'Идея: мини-сайт для подкаста', when: 'Без даты', done: false, prio: null },
  { id: 't14', title: 'Переписать about-страницу',   when: 'Без даты',  done: false, prio: 'low' },
];

// Knowledge base — folders (spaces) + pages. Pages have type + optional parent.
const BASE_TREE = [
  {
    id: 'sp-work', kind: 'space', title: 'Работа', iconKey: 'briefcase',
    children: [
      { id: 'p-1', kind: 'page',  title: 'Запуск лендинга',       type: 'Проект',   updated: '2ч',  children: [
        { id: 'p-1a', kind: 'page', title: 'Бриф',            type: 'Заметка', updated: '2ч' },
        { id: 'p-1b', kind: 'page', title: 'Контент и копии', type: 'Заметка', updated: 'вчера' },
      ]},
      { id: 'p-2', kind: 'page',  title: 'Встречи',               type: 'Журнал',   updated: 'вчера' },
      { id: 'p-3', kind: 'page',  title: 'Цели на квартал',       type: 'Список',   updated: '3 дня' },
    ],
  },
  {
    id: 'sp-life', kind: 'space', title: 'Жизнь', iconKey: 'heart',
    children: [
      { id: 'p-4', kind: 'page', title: 'Книги 2026',              type: 'Список',  updated: '1 нед.' },
      { id: 'p-5', kind: 'page', title: 'Рецепт тыквенного супа',  type: 'Рецепт',  updated: '3 дня' },
      { id: 'p-6', kind: 'page', title: 'Идеи для подарка',        type: 'Заметка', updated: '5 дней' },
    ],
  },
  {
    id: 'sp-ref', kind: 'space', title: 'Справочник', iconKey: 'compass',
    children: [
      { id: 'p-7', kind: 'page', title: 'Пароли и коды',           type: 'Справоч.', updated: '2 нед.' },
      { id: 'p-8', kind: 'page', title: 'Шорткаты',                type: 'Заметка',  updated: '1 мес.' },
    ],
  },
];

const PINNED_PAGES = ['p-1', 'p-3'];

// days: [пн,вт,ср,чт,пт,сб,вс]. Сегодня = чт (индекс 3).
// streak = длина непрерывной серии, оканчивающейся на чт (включая предыдущие недели).
// Если сегодня не отмечено — серия 0, огонька нет.
const HABITS = [
  { id: 'h1', title: 'Утренняя прогулка',  streak: 12, days: [1,1,1,1,0,0,0] }, // все 4 дня подряд
  { id: 'h2', title: 'Чтение, 20 минут',   streak: 1,  days: [1,1,0,1,0,0,0] }, // был пропуск в ср, сегодня отмечено = серия 1
  { id: 'h3', title: 'Без сладкого',       streak: 3,  days: [0,1,1,1,0,0,0] }, // вт-ср-чт подряд
  { id: 'h4', title: 'Английский',         streak: 3,  days: [1,1,1,0,0,0,0] }, // пн-вт-ср подряд, сегодня ещё не отмечено
];

// Дуальный режим во время ESM-миграции: и window-globals (для не-конвертированных
// потребителей), и proper ESM-export. После миграции window-блок снимется.
Object.assign(window, { VARIANT_META, ACCENTS, FONTS, TASKS, HABITS, BASE_TREE, PINNED_PAGES });
export { VARIANT_META, ACCENTS, FONTS, TASKS, HABITS, BASE_TREE, PINNED_PAGES };

