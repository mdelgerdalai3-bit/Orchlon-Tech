// ===== Admin Panel Logic (Supabase backend) =====
// Нууц үг солихыг хүсвэл доорх хэшийг шинэчилнэ.
// SHA-256("orchlon2026") = энэ доорх утга
const ADMIN_PASSWORD_HASH = '11324b4ae307131f9e1df1333be7ea2df8bbe5c80d3702636c494fdc1dd2a9da';
const ADMIN_AUTH_KEY = 'orchlon_admin_auth';

async function hashPwd(pwd) {
  const buf = new TextEncoder().encode(pwd);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function isLoggedIn() {
  return sessionStorage.getItem(ADMIN_AUTH_KEY) === '1';
}

async function adminLogin() {
  const entered = document.getElementById('adminPwd').value;
  const errEl = document.getElementById('loginErr');
  if (!entered) { errEl.textContent = 'Нууц үг оруулна уу'; return; }

  const enteredHash = await hashPwd(entered);
  if (enteredHash !== ADMIN_PASSWORD_HASH) {
    errEl.textContent = '❌ Нууц үг буруу байна';
    return;
  }
  sessionStorage.setItem(ADMIN_AUTH_KEY, '1');
  await showDashboard();
}

function adminLogout() {
  sessionStorage.removeItem(ADMIN_AUTH_KEY);
  location.reload();
}

async function changePassword() {
  alert(
    'Нууц үг солихын тулд:\n\n' +
    '1. js/admin.js файлыг засах\n' +
    '2. const ADMIN_PASSWORD_HASH утгыг шинэчилнэ\n' +
    '3. SHA-256 hash үүсгэх: https://emn178.github.io/online-tools/sha256.html\n' +
    '4. GitHub-руу commit + push\n\n' +
    'Энэ нь бүх админд нэг нууц үгтэй болгоно.'
  );
}

async function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminDashboard').style.display = 'block';
  document.getElementById('logoutBtn').style.display = '';
  await refreshDashboard();
}

async function refreshDashboard() {
  const tbody = document.getElementById('adminTableBody');
  tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-soft)">⏳ Supabase-ээс ачаалж байна…</td></tr>`;
  try {
    const all = await loadProducts(true);
    renderProductTable(all);
    renderStats(all);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--accent)">❌ Алдаа: ${escapeHtml(err.message)}</td></tr>`;
  }
}

function renderStats(all) {
  document.getElementById('statTotal').textContent = all.length;
  document.getElementById('statStatic').textContent = all.filter(p => p.featured).length;
  document.getElementById('statLocal').textContent = all.filter(p => p.stock > 0).length;
  const cart = JSON.parse(localStorage.getItem('techmall_cart') || '[]');
  document.getElementById('statSold').textContent = cart.reduce((s, i) => s + i.qty, 0);
  // labels-ийг шинэчилнэ (admin.html-д бичээтэй байгаа учир)
  document.querySelector('#statStatic').nextElementSibling.textContent = 'Онцлох';
  document.querySelector('#statLocal').nextElementSibling.textContent = 'Нөөцтэй';
}

function renderProductTable(all) {
  document.getElementById('adminTableBody').innerHTML = all.length ? all.map(p => `
    <tr>
      <td><img src="${p.img}" alt="" class="thumb" onerror="this.src='images/logo.jpg'"></td>
      <td>
        <strong>${escapeHtml(p.name)}</strong>
        ${p.badge ? `<br><small style="color:var(--text-soft)">${escapeHtml(p.badge)}</small>` : ''}
      </td>
      <td>${escapeHtml(p.brand)}</td>
      <td>${CAT_NAMES[p.cat] || p.cat}</td>
      <td>${p.price ? fmtPrice(p.price) : '<em>Лавлах</em>'}</td>
      <td>${p.stock || 0}</td>
      <td><span class="source-tag git">DB</span></td>
      <td>
        <div class="admin-actions">
          <a class="admin-btn" href="product.html?id=${p.id}" target="_blank" title="Үзэх">👁️</a>
          <button class="admin-btn edit" onclick="editProduct(${p.id})">✏️</button>
          <button class="admin-btn del" onclick="deleteProductById(${p.id})">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-soft)">
    Бүтээгдэхүүн алга. <strong>+ Шинэ бүтээгдэхүүн</strong> товчоор нэмнэ үү.
  </td></tr>`;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ===== Form =====
let currentImages = [];

async function showForm(product = null) {
  document.getElementById('formModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  if (product) {
    document.getElementById('formTitle').textContent = '✏️ Бүтээгдэхүүн засах';
    document.getElementById('fId').value = product.id;
    document.getElementById('fName').value = product.name;
    document.getElementById('fBrand').value = product.brand;
    document.getElementById('fCat').value = product.cat;
    document.getElementById('fStock').value = product.stock || 0;
    document.getElementById('fPrice').value = product.price || '';
    document.getElementById('fOldPrice').value = product.oldPrice || '';
    document.getElementById('fCpu').value = product.specs?.cpu || '';
    document.getElementById('fRam').value = product.specs?.ram || '';
    document.getElementById('fStorage').value = product.specs?.storage || '';
    document.getElementById('fGpu').value = product.specs?.gpu || '';
    document.getElementById('fScreen').value = product.specs?.screen || '';
    document.getElementById('fWeight').value = product.specs?.weight || '';
    document.getElementById('fDesc').value = product.desc || '';
    document.getElementById('fBadge').value = product.badge || '';
    document.getElementById('fBadgeType').value = product.badgeType || '';
    document.getElementById('fFeatured').checked = !!product.featured;
    document.getElementById('fTop').checked = !!product.top;
    currentImages = [...(product.images || [product.img])].filter(Boolean);
  } else {
    document.getElementById('formTitle').textContent = '+ Шинэ бүтээгдэхүүн нэмэх';
    document.querySelectorAll('#formModal input, #formModal textarea, #formModal select')
      .forEach(el => { if (el.type !== 'hidden') el.value = ''; });
    document.getElementById('fStock').value = 1;
    document.getElementById('fCat').value = 'laptop';
    document.getElementById('fId').value = '';
    document.getElementById('fFeatured').checked = false;
    document.getElementById('fTop').checked = false;
    currentImages = [];
  }
  renderImagePreviews();
}

function hideForm() {
  document.getElementById('formModal').classList.remove('open');
  document.body.style.overflow = '';
}

function switchImageTab(tab) {
  document.querySelectorAll('.image-tab').forEach((t, i) => {
    t.classList.toggle('active', (tab === 'url' && i === 0) || (tab === 'file' && i === 1));
  });
  document.getElementById('imageTabUrl').style.display = tab === 'url' ? '' : 'none';
  document.getElementById('imageTabFile').style.display = tab === 'file' ? '' : 'none';
}

function addImageUrl() {
  const input = document.getElementById('fImgUrl');
  const url = input.value.trim();
  if (!url) return;
  currentImages.push(url);
  input.value = '';
  renderImagePreviews();
}

async function addImageFiles(input) {
  const files = Array.from(input.files);
  input.value = '';
  if (!files.length) return;

  const previewRoot = document.getElementById('imagePreviews');
  for (const file of files) {
    const tempId = 'tmp_' + Date.now() + Math.random();
    currentImages.push({ uploading: true, tempId });
    renderImagePreviews();
    try {
      const url = await uploadImage(file);
      const idx = currentImages.findIndex(x => x && x.tempId === tempId);
      if (idx >= 0) currentImages[idx] = url;
      renderImagePreviews();
    } catch (err) {
      const idx = currentImages.findIndex(x => x && x.tempId === tempId);
      if (idx >= 0) currentImages.splice(idx, 1);
      renderImagePreviews();
      alert('Зураг upload амжилтгүй: ' + err.message);
    }
  }
}

function removeImage(i) {
  currentImages.splice(i, 1);
  renderImagePreviews();
}

function renderImagePreviews() {
  const root = document.getElementById('imagePreviews');
  root.innerHTML = currentImages.map((src, i) => {
    if (typeof src === 'object' && src.uploading) {
      return `<div class="image-preview" style="display:flex;align-items:center;justify-content:center;color:var(--text-soft);font-size:11px">⏳ Upload…</div>`;
    }
    return `
      <div class="image-preview">
        <img src="${src}" onerror="this.style.opacity='.3'">
        <button type="button" class="remove" onclick="removeImage(${i})">✕</button>
      </div>
    `;
  }).join('');
}

async function saveProduct() {
  // Filter out any still-uploading images
  const cleanImages = currentImages.filter(x => typeof x === 'string');
  if (currentImages.some(x => typeof x !== 'string')) {
    alert('Зургийн upload дуусаагүй байна. Хүлээнэ үү.');
    return;
  }

  const id = document.getElementById('fId').value;
  const price = +document.getElementById('fPrice').value;
  const oldPrice = +document.getElementById('fOldPrice').value;

  if (cleanImages.length === 0) {
    if (!confirm('Зураг хоосон байна. Үргэлжлүүлэх үү?')) return;
  }

  const product = {
    name: document.getElementById('fName').value.trim(),
    brand: document.getElementById('fBrand').value.trim(),
    cat: document.getElementById('fCat').value,
    price: price > 0 ? price : null,
    oldPrice: oldPrice > 0 ? oldPrice : null,
    rating: 4.5,
    reviews: Math.floor(Math.random() * 20) + 5,
    stock: +document.getElementById('fStock').value || 0,
    badge: document.getElementById('fBadge').value.trim() || null,
    badgeType: document.getElementById('fBadgeType').value || null,
    featured: document.getElementById('fFeatured').checked,
    top: document.getElementById('fTop').checked,
    img: cleanImages[0] || 'images/logo.jpg',
    images: cleanImages.length ? cleanImages : ['images/logo.jpg'],
    specs: {
      cpu: document.getElementById('fCpu').value.trim() || '—',
      ram: +document.getElementById('fRam').value || 0,
      storage: document.getElementById('fStorage').value.trim() || '—',
      gpu: document.getElementById('fGpu').value.trim() || '—',
      screen: document.getElementById('fScreen').value.trim() || '—',
      weight: document.getElementById('fWeight').value.trim() || '—'
    },
    desc: document.getElementById('fDesc').value.trim()
  };

  // Submit button-г disable хийе
  const btn = document.querySelector('#formModal button[type=submit]');
  const origText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '⏳ Хадгалж байна…';

  try {
    if (id) {
      await updateProduct(Number(id), product);
      toast('✅ Шинэчлэгдлээ');
    } else {
      await createProduct(product);
      toast('✅ Хадгалагдлаа');
    }
    hideForm();
    await refreshDashboard();
  } catch (err) {
    alert('❌ Алдаа: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = origText;
  }
}

async function editProduct(id) {
  const p = await getProductById(id);
  if (p) showForm(p);
}

async function deleteProductById(id) {
  if (!confirm('Энэ бүтээгдэхүүнийг устгах уу? Буцаах боломжгүй.')) return;
  try {
    await removeProduct(id);
    toast('🗑️ Устгагдлаа');
    await refreshDashboard();
  } catch (err) {
    alert('❌ Алдаа: ' + err.message);
  }
}

// Duplicate (deprecated — now all products are in DB)
async function duplicateProduct(id) {
  const p = await getProductById(id);
  if (!p) return;
  const copy = { ...p, name: p.name + ' (хуулбар)' };
  delete copy.id;
  try {
    await createProduct(copy);
    toast('📋 Хуулагдлаа');
    await refreshDashboard();
  } catch (err) {
    alert('❌ Алдаа: ' + err.message);
  }
}

// ===== Export / Import =====
async function exportProducts() {
  try {
    const all = await loadProducts(true);
    download('orchlon-products-backup-' + new Date().toISOString().slice(0,10) + '.json', JSON.stringify(all, null, 2));
    toast('💾 Татлаа');
  } catch (err) {
    alert('❌ Алдаа: ' + err.message);
  }
}

function download(filename, content) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}

function importProducts(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error('Файлын формат буруу');
      if (!confirm(`${data.length} бүтээгдэхүүн оруулах уу?`)) return;
      let ok = 0, fail = 0;
      for (const p of data) {
        try {
          const copy = { ...p };
          delete copy.id;
          await createProduct(copy);
          ok++;
        } catch (err) { fail++; console.error(err); }
      }
      alert(`✅ Орлоо: ${ok}\n❌ Алдсан: ${fail}`);
      await refreshDashboard();
    } catch (err) {
      alert('Файл уншиж чадсангүй: ' + err.message);
    }
  };
  reader.readAsText(file);
  input.value = '';
}

// ===== Init =====
function initAdmin() {
  if (isLoggedIn()) showDashboard();
}
