// --- Товары (картинки лежат в одной папке с index.html) ---
const products = [
  { id: 1, name: "Рубашка оверсайз", price: 3490, description: "Стильная клетчатая рубашка оверсайз. Мягкая ткань, свободный крой.", image: "Рубашка оверсайз женская.jpg" },
  { id: 2, name: "Футболка THESIX", price: 1990, description: "Белая оверсайз-футболка с красной вышивкой THESIX. Плотный хлопок.", image: "загруженное.jpg" },
  { id: 3, name: "Сумка Jacquemus", price: 12900, description: "Сумка через плечо с меховой отделкой. Золотая фурнитура, брендинг.", image: "загруженное (9).jpg" },
  { id: 4, name: "Меховые тапочки", price: 3490, description: "Мягкие пушистые тапочки из меха Bissarini. Теплые и уютные.", image: "загруженное (8).jpg" },
  { id: 5, name: "Шуба из меха", price: 25900, description: "Роскошная шуба из натурального меха. Объемная вязка, бренд Sanzari.", image: "загруженное (7).jpg" },
  { id: 6, name: "Худи Inner City", price: 4290, description: "Бордовое худи с белыми лампасами и принтом INNER CITY.", image: "загруженное (6).jpg" },
  { id: 7, name: "Свитшот Free Soul", price: 3890, description: "Желтый свитшот с синим принтом Free Soul. Оверсайз, унисекс.", image: "загруженное (5).jpg" },
  { id: 8, name: "Кроссовки Puma White", price: 6990, description: "Классические белые кеды Puma с замшевыми вставками.", image: "загруженное (4).jpg" },
  { id: 9, name: "Ветровка Olive Check", price: 5490, description: "Оливковая куртка-бомбер с клетчатым воротником.", image: "загруженное (3).jpg" },
  { id: 10, name: "Худи Pink Duck", price: 3290, description: "Розовое оверсайз-худи с принтом утки и надписью 'I lied'.", image: "загруженное (2).jpg" },
  { id: 11, name: "Джинсы Baggy", price: 4590, description: "Свободные джинсы с потертостями. Широкий крой, заниженная талия.", image: "загруженное (1).jpg" },
  { id: 12, name: "Шапка-капор", price: 2490, description: "Пушистая вязаная шапка-капор с завязками. Трендовый аксессуар.", image: "fun winter style balaclava _ bonnet outfit.jpg" },
  { id: 13, name: "Кроссовки Adidas Leopard", price: 8990, description: "Кроссовки Adidas с леопардовым принтом и розовыми шнурками.", image: "1.jpg" },
  { id: 14, name: "Джинсы Leopard Pink", price: 4990, description: "Розовые джинсы с леопардовым принтом. Свободный крой, 5 карманов.", image: "Calça de Algodão Estampa de Onça Feminino.jpg" },
  { id: 15, name: "Сумка-хобо", price: 5490, description: "Кожаная сумка-хобо шоколадного цвета. Вместительная, мягкая кожа.", image: "224617100161817582.jpg" }
];

// --- Состояние ---
let favorites = [];
let cart = [];
let currentPage = 'home';
let currentUser = null;
let pendingAction = null;

// --- DOM ---
const headerTitle = document.getElementById('headerTitle');
const appContent = document.getElementById('appContent');
const authScreen = document.getElementById('authScreen');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const appShell = document.querySelector('.app-shell');

// --- Пользователи ---
function getUsers() {
  try { return JSON.parse(localStorage.getItem('users')) || {}; }
  catch { return {}; }
}
function saveUsers(users) { localStorage.setItem('users', JSON.stringify(users)); }
function userKey(key) { return key + '_' + currentUser; }

function loadUserData() {
  if (!currentUser) { favorites = []; cart = []; return; }
  try {
    favorites = JSON.parse(localStorage.getItem(userKey('favorites'))) || [];
    cart = JSON.parse(localStorage.getItem(userKey('cart'))) || [];
  } catch { favorites = []; cart = []; }
}

function saveState() {
  if (!currentUser) return;
  localStorage.setItem(userKey('favorites'), JSON.stringify(favorites));
  localStorage.setItem(userKey('cart'), JSON.stringify(cart));
}

// --- Авторизация ---
function openAuth(reason) {
  if (reason === 'cart') {
    authTitle.textContent = 'Войдите, чтобы добавить в корзину';
    authSubtitle.textContent = 'Корзина доступна только авторизованным пользователям';
  } else if (reason === 'fav') {
    authTitle.textContent = 'Войдите, чтобы добавить в избранное';
    authSubtitle.textContent = 'Избранное доступно только авторизованным пользователям';
  } else if (reason === 'profile') {
    authTitle.textContent = 'Войдите в профиль';
    authSubtitle.textContent = 'Профиль доступен только авторизованным пользователям';
  } else {
    authTitle.textContent = 'Добро пожаловать!';
    authSubtitle.textContent = 'Войдите или создайте аккаунт';
  }
  authScreen.classList.remove('hidden');
  switchAuthTab('login');
}

function closeAuth() {
  authScreen.classList.add('hidden');
  pendingAction = null;
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
  document.getElementById('loginError').textContent = '';
  document.getElementById('registerError').textContent = '';
}

function handleLogin(e) {
  e.preventDefault();
  const name = document.getElementById('loginName').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');

  const users = getUsers();
  if (!users[name]) { errorEl.textContent = 'Пользователь не найден'; return; }
  if (users[name] !== password) { errorEl.textContent = 'Неверный пароль'; return; }
  loginSuccess(name);
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const password = document.getElementById('regPassword').value;
  const password2 = document.getElementById('regPassword2').value;
  const errorEl = document.getElementById('registerError');

  if (name.length < 2) { errorEl.textContent = 'Имя слишком короткое'; return; }
  if (password.length < 4) { errorEl.textContent = 'Пароль должен быть не менее 4 символов'; return; }
  if (password !== password2) { errorEl.textContent = 'Пароли не совпадают'; return; }

  const users = getUsers();
  if (users[name]) { errorEl.textContent = 'Такое имя уже занято'; return; }

  users[name] = password;
  saveUsers(users);
  loginSuccess(name);
}

function loginSuccess(name) {
  currentUser = name;
  localStorage.setItem('session', name);
  loadUserData();

  authScreen.classList.add('hidden');
  updateBadges();
  switchPage('profile');

  if (pendingAction) {
    const action = pendingAction;
    pendingAction = null;
    if (action.type === 'cart') addToCart(action.id);
    else if (action.type === 'fav') toggleFavorite(action.id);
    else if (action.type === 'cart-page') switchPage('cart');
    else if (action.type === 'fav-page') switchPage('favorites');
    else if (action.type === 'profile') switchPage('profile');
  }
}

function handleLogout() {
  saveState();
  currentUser = null;
  localStorage.removeItem('session');
  favorites = [];
  cart = [];
  updateBadges();
  switchPage('profile');
}

function checkSession() {
  const session = localStorage.getItem('session');
  const users = getUsers();
  if (session && users[session]) {
    currentUser = session;
    loadUserData();
    updateBadges();
  }
}

// --- Утилиты ---
function formatPrice(n) { return n.toLocaleString('ru-RU') + ' ₽'; }
function isFav(id) { return favorites.includes(id); }

function updateBadges() {
  const favBadge = document.getElementById('favBadge');
  const cartBadge = document.getElementById('cartBadge');

  favBadge.textContent = favorites.length;
  favBadge.classList.toggle('show', favorites.length > 0);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  cartBadge.textContent = cartCount;
  cartBadge.classList.toggle('show', cartCount > 0);
}

function showToast(text) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    appShell.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2000);
}

// --- Действия ---
function toggleFavorite(id, event) {
  if (event) event.stopPropagation();
  if (!currentUser) { pendingAction = { type: 'fav', id }; openAuth('fav'); return; }

  const index = favorites.indexOf(id);
  if (index === -1) { favorites.push(id); showToast('❤️ Добавлено в избранное'); }
  else { favorites.splice(index, 1); showToast('Убрано из избранного'); }

  saveState();
  updateBadges();
  renderCurrentPage();
}

function addToCart(id, event) {
  if (event) event.stopPropagation();
  if (!currentUser) { pendingAction = { type: 'cart', id }; openAuth('cart'); return; }

  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });

  saveState();
  updateBadges();
  showToast('🛒 Добавлено в корзину');
  renderCurrentPage();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveState();
  updateBadges();
  renderCurrentPage();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(id); return; }
  saveState();
  updateBadges();
  renderCurrentPage();
}

// --- Рендер ---
function renderCurrentPage() {
  if (currentPage === 'home') renderHome();
  else if (currentPage === 'cart') renderCart();
  else if (currentPage === 'profile') renderProfile();
  else if (currentPage === 'favorites') renderFavorites();
}

function renderHome() {
  headerTitle.textContent = 'Магазин одежды';
  appContent.innerHTML = `
    <div class="products-grid">
      ${products.map(p => `
        <div class="product-card" onclick="openProduct(${p.id})">
          <button class="fav-btn" onclick="toggleFavorite(${p.id}, event)">
            ${isFav(p.id) ? '❤️' : '🤍'}
          </button>
          <img src="${p.image}" alt="${p.name}">
          <div class="name">${p.name}</div>
          <div class="price">${formatPrice(p.price)}</div>
          <button class="btn-add" onclick="addToCart(${p.id}, event)">В корзину</button>
        </div>
      `).join('')}
    </div>
  `;
}

function openProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  headerTitle.textContent = 'Товар';
  appContent.innerHTML = `
    <div class="product-detail">
      <img src="${p.image}" alt="${p.name}">
      <h2>${p.name}</h2>
      <div class="detail-price">${formatPrice(p.price)}</div>
      <p class="description">${p.description}</p>
      <button class="btn btn-fav ${isFav(p.id) ? 'active' : ''}" onclick="toggleFavorite(${p.id}); openProduct(${p.id})">
        ${isFav(p.id) ? '❤️ В избранном' : '🤍 В избранное'}
      </button>
      <button class="btn btn-buy" onclick="addToCart(${p.id})">🛒 В корзину</button>
      <button class="btn btn-back" onclick="switchPage('home')">← Назад</button>
    </div>
  `;
}

function renderCart() {
  headerTitle.textContent = 'Корзина';
  if (!currentUser) {
    appContent.innerHTML = `
      <div class="empty">
        <span class="emoji">🛒</span>
        Войдите, чтобы видеть корзину
        <br>
        <button class="btn-login-link" onclick="pendingAction={type:'cart-page'}; openAuth('cart')">Войти</button>
      </div>
    `;
    return;
  }
  if (cart.length === 0) {
    appContent.innerHTML = `<div class="empty"><span class="emoji">🛒</span>Корзина пуста<br>Добавьте товары из каталога</div>`;
    return;
  }

  let total = 0;
  const itemsHTML = cart.map(item => {
    const p = products.find(x => x.id === item.id);
    if (!p) return '';
    total += p.price * item.qty;
    return `
      <div class="list-item">
        <img src="${p.image}" alt="${p.name}">
        <div class="info">
          <h3>${p.name}</h3>
          <div class="price">${formatPrice(p.price)} × ${item.qty} = ${formatPrice(p.price * item.qty)}</div>
          <div style="display:flex;gap:6px;margin-top:6px;">
            <button class="icon-btn" onclick="changeQty(${p.id}, -1)">−</button>
            <button class="icon-btn" onclick="changeQty(${p.id}, 1)">+</button>
          </div>
        </div>
        <div class="actions">
          <button class="icon-btn danger" onclick="removeFromCart(${p.id})" title="Удалить">🗑️</button>
        </div>
      </div>
    `;
  }).join('');

  appContent.innerHTML = itemsHTML + `
    <div class="total-box">
      <span>Итого:</span>
      <span class="total-price">${formatPrice(total)}</span>
    </div>
    <button class="btn btn-buy" style="margin-top:14px;" onclick="checkout()">Оформить заказ</button>
  `;
}

function checkout() {
  if (cart.length === 0) return;
  showToast('✅ Заказ оформлен!');
  cart = [];
  saveState();
  updateBadges();
  setTimeout(() => renderCart(), 800);
}

function renderProfile() {
  headerTitle.textContent = 'Профиль';

  if (!currentUser) {
    appContent.innerHTML = `
      <div class="guest-box">
        <div class="guest-emoji">👤</div>
        <h2>Вы не авторизованы</h2>
        <p>Войдите или зарегистрируйтесь, чтобы пользоваться корзиной, избранным и оформлять заказы.</p>
        <div class="guest-buttons">
          <button class="btn btn-buy" onclick="switchAuthTab('login'); openAuth('profile')">Войти</button>
          <button class="btn btn-fav" onclick="switchAuthTab('register'); openAuth('profile')">Регистрация</button>
        </div>
      </div>
    `;
    return;
  }

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  appContent.innerHTML = `
    <div class="profile-card">
      <div class="profile-avatar">${currentUser.charAt(0)}</div>
      <div class="profile-name">${currentUser}</div>
      <div class="profile-status">Авторизован</div>
    </div>

    <div class="profile-menu">
      <button class="menu-item" onclick="switchPage('favorites')">
        <span class="menu-icon">❤️</span>
        <span class="menu-label">Отложенные товары</span>
        <span class="menu-count">${favorites.length}</span>
        <span class="menu-arrow">›</span>
      </button>
      <button class="menu-item" onclick="switchPage('cart')">
        <span class="menu-icon">🛒</span>
        <span class="menu-label">Корзина</span>
        <span class="menu-count">${cartCount}</span>
        <span class="menu-arrow">›</span>
      </button>
      <button class="menu-item" onclick="showToast('Раздел в разработке')">
        <span class="menu-icon">📦</span>
        <span class="menu-label">Мои заказы</span>
        <span class="menu-arrow">›</span>
      </button>
    </div>

    <button class="btn-logout-profile" onclick="handleLogout()">Выйти из аккаунта</button>
  `;
}

function renderFavorites() {
  headerTitle.textContent = 'Отложенные товары';

  if (!currentUser) {
    appContent.innerHTML = `
      <div class="empty">
        <span class="emoji">❤️</span>
        Войдите, чтобы видеть избранное
        <br>
        <button class="btn-login-link" onclick="pendingAction={type:'fav-page'}; openAuth('fav')">Войти</button>
      </div>
    `;
    return;
  }
  if (favorites.length === 0) {
    appContent.innerHTML = `<div class="empty"><span class="emoji">🤍</span>Пока пусто<br>Добавляйте товары сердечком</div>`;
    return;
  }
  const favProducts = products.filter(p => favorites.includes(p.id));
  appContent.innerHTML = `
    <button class="btn btn-back" onclick="switchPage('profile')" style="margin-bottom:14px;">← Назад в профиль</button>
    ${favProducts.map(p => `
      <div class="list-item">
        <img src="${p.image}" alt="${p.name}">
        <div class="info">
          <h3>${p.name}</h3>
          <div class="price">${formatPrice(p.price)}</div>
        </div>
        <div class="actions">
          <button class="icon-btn" onclick="addToCart(${p.id})" title="В корзину">🛒</button>
          <button class="icon-btn danger" onclick="toggleFavorite(${p.id})" title="Убрать">🗑️</button>
        </div>
      </div>
    `).join('')}
  `;
}

// --- Навигация ---
function switchPage(page) {
  currentPage = page;
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });
  renderCurrentPage();
}

// --- Старт ---
checkSession();
switchPage('home');