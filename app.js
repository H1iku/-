const DEFAULT_CAMPAIGNS = [
  { id: 1, name: 'Осенняя распродажа −30%', segment: 'Все подписчики', tpl: 'Промо-рассылка', date: '12.10.2026', status: 'sent', sent: 18420, open: 51.2 },
  { id: 2, name: 'Welcome-письмо новым клиентам', segment: 'Новые клиенты', tpl: 'Welcome-письмо', date: '10.10.2026', status: 'sent', sent: 1240, open: 63.8 },
  { id: 3, name: 'Напоминание о брошенной корзине', segment: 'Активные покупатели', tpl: 'Абандонед корзины', date: '09.10.2026', status: 'sent', sent: 3150, open: 44.7 },
  { id: 4, name: 'Еженедельный дайджест №42', segment: 'Все подписчики', tpl: 'Дайджест новостей', date: '08.10.2026', status: 'sent', sent: 18210, open: 38.1 },
  { id: 5, name: 'Возвращаем со скидкой 15%', segment: 'Спящие клиенты', tpl: 'Реактивация', date: '18.10.2026', status: 'scheduled', sent: 0, open: 0 },
  { id: 6, name: 'Подтверждение заказа (обновление)', segment: 'Корпоративные', tpl: 'Transactional', date: '—', status: 'draft', sent: 0, open: 0 },
  { id: 7, name: 'Ранний доступ к новой коллекции', segment: 'Активные покупатели', tpl: 'Промо-рассылка', date: '05.10.2026', status: 'sent', sent: 5290, open: 56.3 },
];

const SEGMENTS = [
  { name: 'Все подписчики', desc: 'Полная база контактов', rules: 'подписка активна', size: 18420, updated: '16.10.2026' },
  { name: 'Новые клиенты', desc: 'Зарегистрировались менее 30 дней назад', rules: 'регистрация < 30 дн', size: 1240, updated: '16.10.2026' },
  { name: 'Активные покупатели', desc: 'Покупали за последние 90 дней', rules: 'покупка < 90 дн', size: 5290, updated: '15.10.2026' },
  { name: 'Спящие клиенты', desc: 'Не открывали письма 90+ дней', rules: 'нет открытий > 90 дн', size: 3110, updated: '14.10.2026' },
  { name: 'Корпоративные', desc: 'Клиенты с доменом компании', rules: 'домен ∈ списку', size: 860, updated: '12.10.2026' },
];

const TEMPLATES = [
  { name: 'Промо-рассылка', emoji: '🏷️', bg: 'linear-gradient(135deg,#e8edff,#d7e0ff)', used: 48, tag: 'Хит' },
  { name: 'Welcome-письмо', emoji: '👋', bg: 'linear-gradient(135deg,#e2f8ef,#c8f2e0)', used: 12, tag: '' },
  { name: 'Абандонед корзины', emoji: '🛒', bg: 'linear-gradient(135deg,#fef3e0,#fde8c2)', used: 26, tag: 'Хит' },
  { name: 'Дайджест новостей', emoji: '📰', bg: 'linear-gradient(135deg,#f0eaff,#e4d8ff)', used: 42, tag: '' },
  { name: 'Transactional', emoji: '⚙️', bg: 'linear-gradient(135deg,#e8f4fd,#d3eaf9)', used: 96, tag: 'Системный' },
  { name: 'Реактивация', emoji: '🔥', bg: 'linear-gradient(135deg,#ffe9e9,#ffd4d4)', used: 9, tag: '' },
];

const load = () => JSON.parse(localStorage.getItem('cm_campaigns') || 'null') || DEFAULT_CAMPAIGNS;
let campaigns = load();
const save = () => localStorage.setItem('cm_campaigns', JSON.stringify(campaigns));

const STATUS_LABEL = { sent: 'Отправлена', draft: 'Черновик', scheduled: 'Запланирована' };

const PAGES = {
  dashboard: ['Дашборд', 'Обзор всех коммуникаций за последние 30 дней'],
  campaigns: ['Рассылки', 'Управление кампаниями и их статусами'],
  templates: ['Шаблоны', 'Библиотека email-шаблонов'],
  segments: ['Сегменты', 'Аудиторные сегменты и их условия'],
  stats: ['Статистика', 'Детальная аналитика открытий и кликов'],
};
document.querySelectorAll('.nav-link').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
    const page = a.dataset.page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    document.getElementById('page-title').textContent = PAGES[page][0];
    document.getElementById('page-sub').textContent = PAGES[page][1];
  });
});

function fmt(n) { return n.toLocaleString('ru-RU'); }

function renderKPI() {
  const sent = campaigns.filter(c => c.status === 'sent');
  const totalSent = sent.reduce((s, c) => s + c.sent, 0);
  const avgOpen = sent.length ? (sent.reduce((s, c) => s + c.open, 0) / sent.length).toFixed(1) : '0.0';
  document.getElementById('kpi-sent').textContent = fmt(totalSent);
  document.getElementById('kpi-open').textContent = avgOpen + '%';
  document.getElementById('kpi-click').textContent = '7.4%';
  document.getElementById('kpi-subs').textContent = fmt(18420);

  const top = [...sent].sort((a, b) => b.open - a.open).slice(0, 5);
  document.getElementById('top-campaigns').innerHTML = top.map((c, i) => `
    <div class="top-item">
      <div class="top-num">${i + 1}</div>
      <div class="top-name">${c.name}</div>
      <div class="top-val">${c.open}%</div>
    </div>`).join('');
}

let currentFilter = 'all';
function renderCampaigns() {
  const list = campaigns.filter(c => currentFilter === 'all' || c.status === currentFilter);
  document.getElementById('campaigns-table').innerHTML = list.map(c => `
    <tr>
      <td><b>${c.name}</b></td>
      <td>${c.segment}</td>
      <td>${c.tpl}</td>
      <td>${c.date}</td>
      <td><span class="status ${c.status}">${STATUS_LABEL[c.status]}</span></td>
      <td>${c.sent ? fmt(c.sent) : '—'}</td>
      <td>${c.open ? `<div class="or-bar"><div class="or-track"><div class="or-fill" style="width:${c.open}%"></div></div>${c.open}%</div>` : '—'}</td>
      <td><button class="btn danger small" onclick="deleteCampaign(${c.id})">🗑</button></td>
    </tr>`).join('') ||
    '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:30px">Нет рассылок в этой категории</td></tr>';
}
document.querySelectorAll('.chip').forEach(ch => ch.addEventListener('click', () => {
  document.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
  ch.classList.add('active');
  currentFilter = ch.dataset.filter;
  renderCampaigns();
}));

function deleteCampaign(id) {
  campaigns = campaigns.filter(c => c.id !== id);
  save(); renderCampaigns(); renderKPI();
  toast('Рассылка удалена');
}

function renderTemplates() {
  document.getElementById('templates-grid').innerHTML = TEMPLATES.map(t => `
    <div class="tpl-card">
      <div class="tpl-preview" style="background:${t.bg}">${t.emoji}${t.tag ? `<span class="tpl-tag">${t.tag}</span>` : ''}</div>
      <div class="tpl-body">
        <div class="tpl-name">${t.name}</div>
        <div class="tpl-usage">Использован ${t.used} раз</div>
        <div class="tpl-actions">
          <button class="btn ghost small" onclick="toast('Предпросмотр откроется в редакторе')">Просмотр</button>
          <button class="btn primary small" onclick="openCampaignModal(); toast('Шаблон «${t.name}» выбран')">Использовать</button>
        </div>
      </div>
    </div>`).join('');
}

function renderSegments() {
  document.getElementById('segments-table').innerHTML = SEGMENTS.map(s => `
    <tr>
      <td><b>${s.name}</b></td>
      <td>${s.desc}</td>
      <td><span class="badge">${s.rules}</span></td>
      <td><b>${fmt(s.size)}</b></td>
      <td>${s.updated}</td>
    </tr>`).join('');
}

function openCampaignModal() { document.getElementById('campaign-modal').classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function openSegmentModal() { document.getElementById('segment-modal').classList.add('open'); }

function createCampaign() {
  const name = document.getElementById('c-name').value.trim();
  if (!name) return toast('Введите название рассылки');
  campaigns.unshift({
    id: Date.now(), name,
    segment: document.getElementById('c-segment').value,
    tpl: document.getElementById('c-template').value,
    date: '—', status: 'draft', sent: 0, open: 0,
  });
  save(); renderCampaigns(); renderKPI();
  closeModal('campaign-modal');
  document.getElementById('c-name').value = '';
  toast('Черновик рассылки создан');
}
function createSegment() {
  const name = document.getElementById('s-name').value.trim();
  if (!name) return toast('Введите название сегмента');
  SEGMENTS.push({ name, desc: document.getElementById('s-desc').value || '—', rules: 'задано вручную', size: 0, updated: '16.10.2026' });
  renderSegments();
  closeModal('segment-modal');
  document.getElementById('s-name').value = ''; document.getElementById('s-desc').value = '';
  toast('Сегмент создан');
}

document.querySelectorAll('.modal-overlay').forEach(m =>
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); }));

let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}
document.getElementById('export-btn').addEventListener('click', () => toast('Отчёт экспортирован в CSV (демо)'));

function buildCharts() {
  Chart.defaults.font.family = 'Inter';
  const days = Array.from({ length: 30 }, (_, i) => `${i + 1}.10`);
  const opens = [42,45,44,47,52,49,55,58,53,50,54,57,61,59,56,60,63,58,55,59,62,65,61,58,62,66,64,68,71,67];
  const clicks = opens.map(v => Math.round(v * 0.36));

  new Chart(document.getElementById('opens-chart'), {
    type: 'line',
    data: { labels: days, datasets: [
      { label: 'Открытия, %', data: opens, borderColor: '#4f6ef7', backgroundColor: 'rgba(79,110,247,.12)', fill: true, tension: .4, pointRadius: 0 },
      { label: 'Клики, %', data: clicks, borderColor: '#8b5cf6', tension: .4, pointRadius: 0, borderDash: [5,4] },
    ]},
    options: { plugins: { legend: { position: 'bottom' } }, scales: { y: { min: 0, max: 80 } } },
  });

  new Chart(document.getElementById('daily-opens'), {
    type: 'bar',
    data: { labels: days.slice(-14), datasets: [{ label: 'Открытия, %', data: opens.slice(-14), backgroundColor: '#4f6ef7', borderRadius: 6 }] },
    options: { plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 80 } } },
  });

  new Chart(document.getElementById('devices-chart'), {
    type: 'doughnut',
    data: { labels: ['Мобильные', 'Десктоп', 'Планшеты'], datasets: [{ data: [58, 36, 6], backgroundColor: ['#4f6ef7', '#8b5cf6', '#f59e0b'], borderWidth: 0 }] },
    options: { plugins: { legend: { position: 'bottom' } }, cutout: '65%' },
  });
}

renderKPI();
renderCampaigns();
renderTemplates();
renderSegments();
buildCharts();