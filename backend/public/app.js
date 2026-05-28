const API = 'http://localhost:3000/api/products';

const FIELDS = {
  weapons: [
    { name: 'name',        label: 'Nom',         type: 'text',   required: true },
    { name: 'size',        label: 'Mida',         type: 'text',   required: true },
    { name: 'bullet_type', label: 'Tipus bala',   type: 'text',   required: true },
    { name: 'price',       label: 'Preu (€)',     type: 'number', required: true, step: '0.01', min: '0.01' },
    { name: 'stock',       label: 'Stock',        type: 'number', required: true, min: '0' },
    { name: 'image',       label: 'Imatge (URL)', type: 'text' },
  ],
  drugs: [
    { name: 'name',          label: 'Nom',          type: 'text',   required: true },
    { name: 'description',   label: 'Descripció',   type: 'text' },
    { name: 'price_per_gram',label: 'Preu/gram (€)',type: 'number', required: true, step: '0.01', min: '0.01' },
    { name: 'max_grams',     label: 'Màxim grams',  type: 'number', required: true, min: '1' },
    { name: 'stock',         label: 'Stock',        type: 'number', required: true, min: '0' },
    { name: 'image',         label: 'Imatge (URL)', type: 'text' },
  ],
  organs: [
    { name: 'name',          label: 'Nom',          type: 'text',   required: true },
    { name: 'health_status', label: 'Estat salut',  type: 'text',   required: true },
    { name: 'price',         label: 'Preu (€)',     type: 'number', required: true, step: '0.01', min: '0.01' },
    { name: 'stock',         label: 'Stock',        type: 'number', required: true, min: '0' },
    { name: 'weight',        label: 'Pes (kg)',     type: 'number', step: '0.1', min: '0' },
    { name: 'quantity',      label: 'Quantitat',    type: 'number', min: '1' },
    { name: 'image',         label: 'Imatge (URL)', type: 'text' },
  ],
};

let editState = { category: null, id: null };

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  loadCategory('weapons');
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});

// ── NAVIGATION ────────────────────────────────────────────
function setupNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
  });
}

function switchSection(section) {
  document.querySelectorAll('.section').forEach(s => s.hidden = true);
  document.querySelectorAll('.nav-btn').forEach(b => {
    const active = b.dataset.section === section;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', active);
  });
  document.getElementById(`${section}-section`).hidden = false;

  if (section === 'orders') loadOrders();
  else loadCategory(section);
}

// ── ADD FORM TOGGLE ───────────────────────────────────────
function toggleForm(category) {
  const form = document.getElementById(`${category}-form`);
  const btn  = document.querySelector(`[aria-controls="${category}-form"]`);
  const hidden = !form.hidden;
  form.hidden = hidden;
  btn.setAttribute('aria-expanded', !hidden);
  if (hidden) form.querySelector('form').reset();
}

// ── LOAD & RENDER ─────────────────────────────────────────
async function loadCategory(category) {
  try {
    const res  = await fetch(`${API}/${category}`);
    const data = await res.json();
    renderTable(category, data);
  } catch {
    notify('Error carregant dades', 'error');
  }
}

function renderTable(category, items) {
  const tbody = document.getElementById(`${category}-tbody`);
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-msg">&gt; Cap registre trobat.</td></tr>`;
    return;
  }
  tbody.innerHTML = items.map(item => buildRow(category, item)).join('');
}

function buildRow(category, item) {
  let specs = '', price = '';
  if (category === 'weapons') {
    specs = `${esc(item.size)} / ${esc(item.bullet_type)}`;
    price = fmt(item.price);
  } else if (category === 'drugs') {
    specs = esc(item.description || '—');
    price = `${fmt(item.price_per_gram)}/g`;
  } else {
    specs = `${esc(item.health_status)} / ${item.weight ?? '—'}kg`;
    price = fmt(item.price);
  }

  const itemJson = esc(JSON.stringify(item));
  return `
    <tr>
      <td class="col-name">${esc(item.name)}</td>
      <td class="col-specs">${specs}</td>
      <td class="col-price">${price}</td>
      <td class="col-stock">${item.stock}</td>
      <td class="col-actions">
        <button class="btn-edit" onclick='openEditModal("${category}", ${JSON.stringify(item)})' aria-label="Editar ${esc(item.name)}">EDITAR</button>
        <button class="btn-del"  onclick="deleteProduct('${category}',${item.id},'${esc(item.name)}')" aria-label="Eliminar ${esc(item.name)}">ELIMINAR</button>
      </td>
    </tr>`;
}

// ── ADD PRODUCT ───────────────────────────────────────────
async function submitAdd(e, category) {
  e.preventDefault();
  const form = e.target;
  const body = {};
  new FormData(form).forEach((v, k) => { if (v !== '') body[k] = isNaN(v) || v === '' ? v : Number(v); });

  try {
    const res = await fetch(`${API}/${category}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
    notify(`${body.name} afegit correctament`, 'success');
    form.reset();
    toggleForm(category);
    loadCategory(category);
  } catch (err) {
    notify(err.message || 'Error afegint el registre', 'error');
  }
}

// ── DELETE ────────────────────────────────────────────────
async function deleteProduct(category, id, name) {
  if (!confirm(`Eliminar "${name}"?\nAquesta acció no es pot desfer.`)) return;
  try {
    const res = await fetch(`${API}/${category}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    notify(`${name} eliminat`, 'success');
    loadCategory(category);
  } catch {
    notify('Error eliminant el registre', 'error');
  }
}

// ── EDIT MODAL ────────────────────────────────────────────
function openEditModal(category, item) {
  editState = { category, id: item.id };
  const container = document.getElementById('edit-fields');
  container.innerHTML = FIELDS[category].map(f => `
    <div class="field">
      <label for="edit-${f.name}">${f.label}${f.required ? ' *' : ''}</label>
      <input id="edit-${f.name}" name="${f.name}" type="${f.type}"
        ${f.step   ? `step="${f.step}"`   : ''}
        ${f.min    ? `min="${f.min}"`     : ''}
        ${f.required ? 'required' : ''}
        value="${esc(String(item[f.name] ?? ''))}" >
    </div>`).join('');

  document.getElementById('edit-modal').hidden = false;
  document.getElementById('edit-fields').querySelector('input')?.focus();
}

function closeModal() {
  document.getElementById('edit-modal').hidden = true;
  editState = { category: null, id: null };
}

async function submitEdit(e) {
  e.preventDefault();
  const { category, id } = editState;
  const body = {};
  new FormData(e.target).forEach((v, k) => { if (v !== '') body[k] = isNaN(v) || v === '' ? v : Number(v); });

  try {
    const res = await fetch(`${API}/${category}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
    notify(`Registre actualitzat`, 'success');
    closeModal();
    loadCategory(category);
  } catch (err) {
    notify(err.message || 'Error actualitzant el registre', 'error');
  }
}

// ── ORDERS ────────────────────────────────────────────────
async function loadOrders() {
  try {
    const res    = await fetch(`${API}/orders`);
    const orders = await res.json();
    const tbody  = document.getElementById('orders-tbody');

    if (!orders.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-msg">&gt; Cap comanda registrada.</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(o => {
      const date = new Date(o.created_at).toLocaleString('ca');
      return `
        <tr>
          <td class="col-ref">${esc(o.ref)}</td>
          <td>${date}</td>
          <td>${o.items.length}</td>
          <td class="col-price">${fmt(o.total)}</td>
          <td><button class="btn-edit" onclick="toggleOrderDetail(${o.id})" aria-expanded="false" aria-controls="order-detail-${o.id}">DETALL</button></td>
        </tr>
        <tr id="order-detail-${o.id}" hidden>
          <td colspan="5">
            <table class="detail-table" aria-label="Articles de la comanda ${esc(o.ref)}">
              <thead><tr><th scope="col">Producte</th><th scope="col">Categoria</th><th scope="col">Qtd</th><th scope="col">Preu unit.</th><th scope="col">Total</th></tr></thead>
              <tbody>${o.items.map(i => `
                <tr>
                  <td>${esc(i.product_name)}</td>
                  <td class="col-specs">${esc(i.category)}</td>
                  <td>${i.quantity}</td>
                  <td>${fmt(i.unit_price)}</td>
                  <td>${fmt(i.total_price)}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </td>
        </tr>`;
    }).join('');
  } catch {
    notify('Error carregant les comandes', 'error');
  }
}

function toggleOrderDetail(id) {
  const row = document.getElementById(`order-detail-${id}`);
  const btn = row.previousElementSibling.querySelector('button');
  row.hidden = !row.hidden;
  btn.setAttribute('aria-expanded', !row.hidden);
  btn.textContent = row.hidden ? 'DETALL' : 'TANCAR';
}

// ── HELPERS ───────────────────────────────────────────────
function fmt(n) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
}

function esc(text) {
  return String(text).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

function notify(msg, type = 'info') {
  const el = document.getElementById('notification');
  el.textContent = msg;
  el.className = `notification ${type} show`;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 3500);
}
