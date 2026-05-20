// Supabase-аас getAllProducts() нь js/supabase.js дотроос ачаалагдана.
// Хэрэв supabase.js файл ачаалагдахгүй бол fallback хийнэ:
if (typeof getAllProducts !== 'function') {
  window.getAllProducts = async function() {
    return (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []);
  };
}

// ===== Theme (dark/light) =====
const THEME_KEY = 'orchlon_theme';
function getTheme() {
  return localStorage.getItem(THEME_KEY)
    || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}
function applyTheme(t) {
  if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  else document.documentElement.removeAttribute('data-theme');
}
function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}
// Apply ASAP to avoid flash
applyTheme(getTheme());

// ===== Mobile drawer =====
function toggleDrawer(open) {
  const d = document.getElementById('drawer');
  const b = document.getElementById('drawerBackdrop');
  if (!d || !b) return;
  const wantOpen = open === undefined ? !d.classList.contains('open') : open;
  d.classList.toggle('open', wantOpen);
  b.classList.toggle('open', wantOpen);
  document.body.style.overflow = wantOpen ? 'hidden' : '';
}

// ===== Cart utilities =====
const CART_KEY = 'techmall_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount() {
  const count = getCart().reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('#cartCount').forEach(el => el.textContent = count);
}
function addToCart(productId, qty = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.id === productId);
  if (existing) existing.qty += qty;
  else cart.push({ id: productId, qty });
  saveCart(cart);
  toast('Сагсанд нэмэгдлээ ✓');
}
function removeFromCart(productId) {
  saveCart(getCart().filter(i => i.id !== productId));
  if (typeof renderCart === 'function') renderCart();
}
function updateQty(productId, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.qty = Math.max(1, qty);
    saveCart(cart);
    renderCart();
  }
}

// ===== Loading / Empty placeholders =====
function loadingHTML() {
  return '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-soft);font-size:14px">⏳ Ачаалж байна…</div>';
}
function emptyHTML(msg) {
  return `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-soft)">${msg}</div>`;
}

// ===== Toast =====
function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.style.cssText = 'position:fixed;bottom:30px;right:30px;background:#0a0a0a;color:#fff;padding:14px 22px;border-radius:12px;font-weight:500;z-index:1000;box-shadow:0 8px 24px rgba(0,0,0,.2);transform:translateY(100px);opacity:0;transition:all .3s;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => {
    t.style.transform = 'translateY(0)';
    t.style.opacity = '1';
  });
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.style.transform = 'translateY(100px)';
    t.style.opacity = '0';
  }, 2000);
}

// ===== Product card HTML =====
function cardHTML(p) {
  const oldP = p.price && p.oldPrice && p.oldPrice !== p.price
    ? `<span class="product-old">${fmtPrice(p.oldPrice)}</span>` : '';
  const badge = p.badge ? `<span class="product-badge ${p.badgeType || ''}">${p.badge}</span>` : '';
  const specLine = [
    p.specs.cpu !== '—' ? p.specs.cpu : null,
    p.specs.ram ? p.specs.ram + 'GB RAM' : null,
    p.specs.storage !== '—' ? p.specs.storage : null
  ].filter(Boolean).join(' • ');

  const actionBtn = p.price
    ? `<button class="product-add" onclick="addToCart(${p.id})">Сагсанд нэмэх</button>`
    : `<a class="product-add" href="tel:80012722">📞 Утсаар лавлах</a>`;

  return `
    <div class="product-card" data-cat="${p.cat}">
      <div class="product-img">
        ${badge}
        <button class="product-fav" onclick="event.preventDefault(); toast('Хадгалсан ♡')">♡</button>
        <a href="product.html?id=${p.id}"><img src="${p.img}" alt="${p.name}" loading="lazy"></a>
      </div>
      <span class="product-brand">${p.brand}</span>
      <a href="product.html?id=${p.id}"><h3 class="product-name">${p.name}</h3></a>
      <p class="product-specs">${specLine || '—'}</p>
      <p class="product-rating"><span class="stars">★</span>${p.rating} (${p.reviews})</p>
      <div class="product-price-row">
        <span class="product-price">${fmtPrice(p.price)}</span>
        ${oldP}
      </div>
      ${actionBtn}
    </div>
  `;
}

// ===== Home: featured + best =====
async function renderHome() {
  updateCartCount();
  const fg = document.getElementById('featuredGrid');
  const bg = document.getElementById('bestGrid');
  if (fg) fg.innerHTML = loadingHTML();
  if (bg) bg.innerHTML = loadingHTML();
  const all = await getAllProducts();
  const featured = all.filter(p => p.featured).slice(0, 8);
  const best = all.filter(p => p.top).slice(0, 4);
  if (fg) fg.innerHTML = featured.length ? featured.map(cardHTML).join('') : emptyHTML('Онцлох бүтээгдэхүүн алга');
  if (bg) bg.innerHTML = best.length ? best.map(cardHTML).join('') : emptyHTML('Шилдэг борлуулалт алга');

  // Tab filter
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const f = tab.dataset.filter;
      const filtered = f === 'all' ? featured : featured.filter(p => p.cat === f);
      document.getElementById('featuredGrid').innerHTML = filtered.length
        ? filtered.map(cardHTML).join('')
        : emptyHTML('Бүтээгдэхүүн олдсонгүй');
    });
  });

  // Search → goes to listing
  const search = document.getElementById('searchInput');
  if (search) {
    search.addEventListener('keypress', e => {
      if (e.key === 'Enter' && search.value.trim()) {
        window.location.href = `products.html?q=${encodeURIComponent(search.value.trim())}`;
      }
    });
  }
}

// ===== Listing page =====
const CAT_NAMES = {
  all: 'Бүх бүтээгдэхүүн',
  laptop: 'Зөөврийн компьютер',
  desktop: 'Суурин компьютер',
  gaming: 'Гэйминг',
  parts: 'Эд анги',
  accessories: 'Дагалдах хэрэгсэл'
};

async function initListing() {
  updateCartCount();

  const params = new URLSearchParams(location.search);
  const initialCat = params.get('cat') || 'all';
  const query = (params.get('q') || '').toLowerCase();
  const sortParam = params.get('sort');

  if (query) document.getElementById('searchInput').value = query;
  document.getElementById('crumbCat').textContent = query ? `Хайлт: "${query}"` : CAT_NAMES[initialCat];

  // pre-select radio
  const radio = document.querySelector(`input[name="cat"][value="${initialCat}"]`);
  if (radio) radio.checked = true;
  if (sortParam === 'top') document.getElementById('sortBy').value = 'rating';

  document.getElementById('listingGrid').innerHTML = loadingHTML();
  const allProducts = await getAllProducts();

  function applyFilters() {
    const cat = document.querySelector('input[name="cat"]:checked').value;
    const brands = [...document.querySelectorAll('.brand:checked')].map(b => b.value);
    const rams = [...document.querySelectorAll('.ram:checked')].map(r => +r.value);
    const minP = +document.getElementById('minPrice').value || 0;
    const maxP = +document.getElementById('maxPrice').value || Infinity;
    const sort = document.getElementById('sortBy').value;

    let list = allProducts.filter(p => {
      if (cat !== 'all' && p.cat !== cat) return false;
      if (brands.length && !brands.includes(p.brand)) return false;
      if (rams.length && !rams.includes(p.specs.ram)) return false;
      if (p.price != null && (p.price < minP || p.price > maxP)) return false;
      if (query && !(p.name + ' ' + p.brand).toLowerCase().includes(query)) return false;
      return true;
    });

    switch (sort) {
      case 'price-asc': list.sort((a,b) => (a.price||0) - (b.price||0)); break;
      case 'price-desc': list.sort((a,b) => (b.price||0) - (a.price||0)); break;
      case 'rating': list.sort((a,b) => b.rating - a.rating); break;
      case 'new': list.sort((a,b) => (b.badgeType === 'new') - (a.badgeType === 'new')); break;
      default: list.sort((a,b) => b.reviews - a.reviews);
    }

    document.getElementById('resultCount').textContent = `${list.length} бүтээгдэхүүн`;
    document.getElementById('listingGrid').innerHTML = list.length
      ? list.map(cardHTML).join('')
      : emptyHTML('Шүүлтэд тохирох бүтээгдэхүүн олдсонгүй');
  }

  // Bind all filter changes
  document.querySelectorAll('.filters input, #sortBy').forEach(el =>
    el.addEventListener('change', applyFilters)
  );
  document.getElementById('minPrice').addEventListener('input', applyFilters);
  document.getElementById('maxPrice').addEventListener('input', applyFilters);

  const range = document.getElementById('priceRange');
  range.addEventListener('input', () => {
    document.getElementById('maxPrice').value = range.value;
    document.getElementById('priceLabel').textContent =
      `0 — ${new Intl.NumberFormat('mn-MN').format(range.value)}₮`;
    applyFilters();
  });

  document.getElementById('resetFilters').addEventListener('click', () => {
    document.querySelectorAll('.filters input[type=checkbox]').forEach(c => c.checked = false);
    document.querySelector('input[name="cat"][value="all"]').checked = true;
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    range.value = range.max;
    applyFilters();
  });

  // Search bar on listing
  const search = document.getElementById('searchInput');
  if (search) {
    search.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        window.location.href = `products.html?q=${encodeURIComponent(search.value.trim())}`;
      }
    });
  }

  applyFilters();
}

// ===== Product detail =====
async function renderProductDetail() {
  updateCartCount();
  const id = +new URLSearchParams(location.search).get('id') || 1;
  document.getElementById('pdpRoot').innerHTML = loadingHTML();
  const all = await getAllProducts();
  const p = all.find(x => x.id === id) || all[0];
  if (!p) { document.getElementById('pdpRoot').innerHTML = emptyHTML('Бүтээгдэхүүн олдсонгүй'); return; }

  document.title = p.name + ' — TechMall';
  document.getElementById('crumbCat').textContent = CAT_NAMES[p.cat] || 'Бүтээгдэхүүн';
  document.getElementById('crumbCat').href = `products.html?cat=${p.cat}`;
  document.getElementById('crumbName').textContent = p.name;

  const oldP = (p.price && p.oldPrice && p.oldPrice !== p.price)
    ? `<span class="pdp-old">${fmtPrice(p.oldPrice)}</span><span class="pdp-save">−${Math.round((1 - p.price/p.oldPrice)*100)}%</span>`
    : '';
  const installmentRow = p.price
    ? `<div class="pdp-installment">💳 Хуваан төлбөрөөр: <strong>${fmtPrice(p.installment || Math.round(p.price * 1.14))}</strong> (Simple, Sono, PayOn, Lendmn)</div>`
    : `<div class="pdp-installment">📞 Үнийн талаар утсаар лавлана уу: <a href="tel:80012722"><strong>8001-2722</strong></a></div>`;
  const mainAction = p.price
    ? `<button class="btn btn-primary" onclick="addToCart(${p.id}, +document.getElementById('pdpQty').value)">🛒 Сагсанд нэмэх</button>`
    : `<a class="btn btn-primary" href="tel:80012722">📞 Захиалга өгөх — 8001-2722</a>`;

  const thumbs = (p.images || [p.img]).map((img, i) =>
    `<div class="pdp-thumb ${i===0?'active':''}" onclick="document.getElementById('mainImg').src='${img}';document.querySelectorAll('.pdp-thumb').forEach(t=>t.classList.remove('active'));this.classList.add('active')">
       <img src="${img}" alt="">
     </div>`).join('');

  document.getElementById('pdpRoot').innerHTML = `
    <div class="pdp-gallery">
      <div class="pdp-thumbs">${thumbs}</div>
      <div class="pdp-main-img"><img id="mainImg" src="${(p.images||[p.img])[0]}" alt="${p.name}"></div>
    </div>
    <div class="pdp-info">
      <span class="product-brand">${p.brand}</span>
      <h1>${p.name}</h1>
      <div class="pdp-rating">
        <span class="stars">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5-Math.round(p.rating))}</span>
        <strong>${p.rating}</strong> · ${p.reviews} сэтгэгдэл · <span style="color:var(--success)">● Бэлэн (${p.stock})</span>
      </div>
      <p style="color:var(--text-soft);font-size:15px;">${p.desc}</p>

      <div class="pdp-price-block">
        <div>
          <span class="pdp-price">${fmtPrice(p.price)}</span>
          ${oldP}
        </div>
        ${installmentRow}
      </div>

      <div class="pdp-actions">
        ${mainAction}
        <div class="qty">
          <button onclick="const i=document.getElementById('pdpQty');i.value=Math.max(1,+i.value-1)">−</button>
          <input id="pdpQty" type="number" value="1" min="1">
          <button onclick="const i=document.getElementById('pdpQty');i.value=+i.value+1">+</button>
        </div>
      </div>
      <a href="${p.fbUrl || 'https://www.facebook.com/orchlontechpage'}" target="_blank" class="btn btn-ghost w-full" style="margin-top:8px">📘 Facebook дээр харах</a>

      <div class="pdp-features">
        <div class="pdp-feature"><div class="pdp-feature-icon">🚚</div><div><h5>Үнэгүй хүргэлт</h5><p>УБ хотод 24 цагт</p></div></div>
        <div class="pdp-feature"><div class="pdp-feature-icon">🛡️</div><div><h5>2 жилийн баталгаа</h5><p>Албан ёсны</p></div></div>
        <div class="pdp-feature"><div class="pdp-feature-icon">↩️</div><div><h5>14 хоног буцаалт</h5><p>Асуултгүй</p></div></div>
        <div class="pdp-feature"><div class="pdp-feature-icon">💳</div><div><h5>Хүүгүй лизинг</h5><p>12 хүртэлх сар</p></div></div>
      </div>

      <div class="pdp-tabs">
        <h3>Үзүүлэлт</h3>
        <table class="spec-table">
          <tr><td>Процессор</td><td>${p.specs.cpu}</td></tr>
          <tr><td>Санах ой (RAM)</td><td>${p.specs.ram} GB</td></tr>
          <tr><td>Хадгалалт</td><td>${p.specs.storage}</td></tr>
          <tr><td>График</td><td>${p.specs.gpu}</td></tr>
          <tr><td>Дэлгэц</td><td>${p.specs.screen}</td></tr>
          <tr><td>Жин</td><td>${p.specs.weight}</td></tr>
          <tr><td>Брэнд</td><td>${p.brand}</td></tr>
        </table>
      </div>
    </div>
  `;

  // Related
  const related = all.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);
  document.getElementById('relatedGrid').innerHTML = related.map(cardHTML).join('');
}

// ===== Cart page =====
async function renderCart() {
  updateCartCount();
  const cart = getCart();
  const itemsRoot = document.getElementById('cartItems');

  if (!cart.length) {
    itemsRoot.innerHTML = `
      <div class="cart-empty">
        <h3>Таны сагс хоосон байна</h3>
        <p>Дуртай бүтээгдэхүүнээ сонгож сагсандаа нэмнэ үү.</p>
        <a href="products.html" class="btn btn-primary">Дэлгүүр үзэх</a>
      </div>`;
    document.getElementById('sumSubtotal').textContent = '0₮';
    document.getElementById('sumTax').textContent = '0₮';
    document.getElementById('sumTotal').textContent = '0₮';
    return;
  }

  itemsRoot.innerHTML = loadingHTML();
  const allProducts = await getAllProducts();

  itemsRoot.innerHTML = cart.map(item => {
    const p = allProducts.find(x => x.id === item.id);
    if (!p) return '';
    return `
      <div class="cart-item">
        <div class="cart-item-img"><img src="${p.img}" alt=""></div>
        <div class="cart-item-info">
          <span class="product-brand">${p.brand}</span>
          <h4>${p.name}</h4>
          <p>${p.specs.cpu !== '—' ? p.specs.cpu + ' • ' : ''}${p.specs.ram ? p.specs.ram + 'GB RAM' : ''}</p>
          <span class="price">${fmtPrice(p.price * item.qty)}</span>
        </div>
        <div class="cart-item-actions">
          <div class="qty">
            <button onclick="updateQty(${p.id}, ${item.qty - 1})">−</button>
            <input type="number" value="${item.qty}" onchange="updateQty(${p.id}, +this.value)">
            <button onclick="updateQty(${p.id}, ${item.qty + 1})">+</button>
          </div>
          <a href="javascript:void(0)" class="cart-remove" onclick="removeFromCart(${p.id})">Устгах</a>
        </div>
      </div>`;
  }).join('');

  const subtotal = cart.reduce((s, i) => {
    const p = allProducts.find(x => x.id === i.id);
    return s + (p && p.price ? p.price * i.qty : 0);
  }, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  document.getElementById('sumSubtotal').textContent = fmtPrice(subtotal);
  document.getElementById('sumTax').textContent = fmtPrice(tax);
  document.getElementById('sumTotal').textContent = fmtPrice(total);
}

function checkout() {
  const cart = getCart();
  if (!cart.length) { toast('Сагс хоосон байна'); return; }
  if (confirm('Захиалгыг баталгаажуулах уу?')) {
    localStorage.removeItem(CART_KEY);
    alert('Захиалга амжилттай! Захиалгын дугаар: #' + Math.floor(Math.random() * 900000 + 100000) + '\n24 цагийн дотор холбогдох болно.');
    location.href = 'index.html';
  }
}

// Init cart count on every page
document.addEventListener('DOMContentLoaded', updateCartCount);
