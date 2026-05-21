// ===== Supabase холболт =====
const SUPABASE_URL = 'https://fnebxsvftmghpkdbkxoj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuZWJ4c3ZmdG1naHBrZGJreG9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNzE0NTEsImV4cCI6MjA5NDg0NzQ1MX0.XTVezXscoltPQVzILqYanmu-UxU3uEq15LsWnWZmN5U';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== DB ↔ JS багана нэрийн хөрвүүлэлт =====
function dbToJs(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    cat: row.cat,
    price: row.price,
    oldPrice: row.old_price,
    installment: row.installment,
    rating: row.rating != null ? Number(row.rating) : 4.5,
    reviews: row.reviews || 10,
    stock: row.stock || 0,
    badge: row.badge,
    badgeType: row.badge_type,
    featured: !!row.featured,
    top: !!row.is_top,
    img: row.img || (row.images && row.images[0]) || 'images/logo.jpg',
    images: row.images && row.images.length ? row.images : [row.img || 'images/logo.jpg'],
    specs: row.specs || { cpu: '—', ram: 0, storage: '—', gpu: '—', screen: '—', weight: '—' },
    desc: row.description || '',
    fbUrl: row.fb_url || null
  };
}

function jsToDb(p) {
  return {
    name: p.name,
    brand: p.brand,
    cat: p.cat,
    price: p.price || null,
    old_price: p.oldPrice || null,
    installment: p.installment || null,
    rating: p.rating || 4.5,
    reviews: p.reviews || 10,
    stock: p.stock || 0,
    badge: p.badge || null,
    badge_type: p.badgeType || null,
    featured: !!p.featured,
    is_top: !!p.top,
    img: p.img || null,
    images: p.images || [],
    specs: p.specs || {},
    description: p.desc || null,
    fb_url: p.fbUrl || null
  };
}

// ===== Cache (одоо ачаалсан өгөгдлийг санах) =====
let _productsCache = null;
let _productsPromise = null;

async function loadProducts(force = false) {
  if (_productsCache && !force) return _productsCache;
  if (_productsPromise && !force) return _productsPromise;

  _productsPromise = (async () => {
    const { data, error } = await sb
      .from('products')
      .select('*')
      .order('id', { ascending: true });
    if (error) {
      console.error('Supabase load error:', error);
      _productsPromise = null;
      // Хэрэв Supabase ажиллахгүй бол хуучин static-аар буцаах
      return (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []);
    }
    _productsCache = data.map(dbToJs);
    _productsPromise = null;
    return _productsCache;
  })();

  return _productsPromise;
}

async function getProductById(id) {
  const all = await loadProducts();
  return all.find(p => p.id === Number(id));
}

async function createProduct(product) {
  const { data, error } = await sb
    .from('products')
    .insert(jsToDb(product))
    .select()
    .single();
  if (error) throw error;
  _productsCache = null;  // invalidate cache
  return dbToJs(data);
}

async function updateProduct(id, patch) {
  const { data, error } = await sb
    .from('products')
    .update({ ...jsToDb(patch), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  _productsCache = null;
  return dbToJs(data);
}

async function removeProduct(id) {
  const { error } = await sb.from('products').delete().eq('id', id);
  if (error) throw error;
  _productsCache = null;
}

// ===== Зураг upload =====
async function uploadImage(file) {
  const ext = (file.name || 'jpg').split('.').pop().toLowerCase();
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const { data, error } = await sb.storage
    .from('product-images')
    .upload(filename, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data: { publicUrl } } = sb.storage
    .from('product-images')
    .getPublicUrl(data.path);
  return publicUrl;
}

// ===== Public getAllProducts (main.js-д хэрэглэгдэнэ) =====
async function getAllProducts() {
  return loadProducts();
}
