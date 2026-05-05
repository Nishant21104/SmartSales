import { useEffect, useState } from "react";
import { dataAPI } from "../api";

const s = { fontFamily: "'DM Sans', 'Segoe UI', sans-serif" };

const SectionHeader = ({ title, subtitle, action }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1C1B19', margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 13, color: '#888780', margin: '4px 0 0' }}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

const PillButton = ({ onClick, children, variant = 'primary', disabled }) => {
  const styles = {
    primary: { background: '#378ADD', color: '#fff', border: 'none' },
    secondary: { background: '#fff', color: '#5F5E5A', border: '1px solid #D3D1C7' },
    success: { background: '#1D9E75', color: '#fff', border: 'none' },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        padding: '8px 16px',
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {children}
    </button>
  );
};

const Modal = ({ title, onClose, onSubmit, children }) => (
  <div style={{
    position: 'fixed', inset: 0,
    background: 'rgba(28,27,25,0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 50,
  }}>
    <div style={{
      background: '#fff',
      borderRadius: 18,
      padding: '2rem',
      width: '100%',
      maxWidth: 440,
      boxShadow: '0 24px 48px rgba(0,0,0,0.12)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1C1B19', margin: 0 }}>{title}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888780', lineHeight: 1 }}>×</button>
      </div>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <PillButton variant="secondary" onClick={onClose}>Cancel</PillButton>
          <PillButton variant="primary">Save</PillButton>
        </div>
      </form>
    </div>
  </div>
);

const FieldLabel = ({ children }) => (
  <label style={{ fontSize: 12, fontWeight: 600, color: '#5F5E5A', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
    {children}
  </label>
);

const Input = ({ value, onChange, placeholder, type = 'text', required }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    style={{
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #D3D1C7',
      borderRadius: 10,
      fontSize: 13,
      color: '#1C1B19',
      fontFamily: 'inherit',
      outline: 'none',
      background: '#FAFAF8',
      marginTop: 6,
    }}
  />
);

const Select = ({ value, onChange, children, required }) => (
  <select
    value={value}
    onChange={onChange}
    required={required}
    style={{
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #D3D1C7',
      borderRadius: 10,
      fontSize: 13,
      color: '#1C1B19',
      fontFamily: 'inherit',
      outline: 'none',
      background: '#FAFAF8',
      cursor: 'pointer',
      marginTop: 6,
    }}
  >
    {children}
  </select>
);

const ACCENT_COLORS = ['#378ADD', '#1D9E75', '#7F77DD', '#D85A30', '#BA7517', '#D4537E'];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', categoryId: '' });
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      console.log("FETCH DATA CALLED");
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        dataAPI.getProducts(),
        dataAPI.getCategories(),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error('Products fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      if (!newProduct.name.trim()) return alert('Product name is required');
      if (!newProduct.categoryId) return alert('Please select a category first');
      await dataAPI.createProduct(newProduct);
      setShowAddProductModal(false);
      setNewProduct({ name: '', categoryId: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add product');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      if (!newCategory.name.trim()) return alert('Category name is required');
      await dataAPI.createCategory(newCategory);
      setShowAddCategoryModal(false);
      setNewCategory({ name: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add category');
    }
  };

  const getCategoryName = (categoryId) => categories.find(c => c._id === categoryId)?.name || 'N/A';
  //const getProductsByCategory = (categoryId) => products.filter(p => p.categoryId === categoryId);
  const getProductsByCategory = (categoryId) =>  products.filter(p => String(p.categoryId) === String(categoryId));
  //const filteredProducts = activeCategory ? products.filter(p => p.categoryId === activeCategory) : products;
  const filteredProducts = activeCategory ? products.filter(p => String(p.categoryId) === String(activeCategory)): products;
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #E6F1FB', borderTopColor: '#378ADD', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ ...s, padding: '2rem', background: '#FAFAF8', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .cat-chip:hover { background: #F5F3EE !important; }
        .cat-chip.active-chip { background: #EBF3FB !important; color: #2472B3 !important; border-color: #C3DCF5 !important; }
        .product-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important; transform: translateY(-1px); }
        .product-card { transition: box-shadow 0.2s, transform 0.2s; }
      `}</style>

      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7F77DD' }} />
          <p style={{ fontSize: 12, color: '#888780', margin: 0, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Catalog</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1C1B19', margin: 0, letterSpacing: '-0.02em' }}>Products</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <PillButton variant="secondary" onClick={() => setShowAddCategoryModal(true)}>
              <span>＋</span> New Category
            </PillButton>
            <PillButton variant="primary" onClick={() => setShowAddProductModal(true)}>
              <span>＋</span> Add Product
            </PillButton>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Products', value: products.length, accent: '#378ADD', icon: '📦' },
          { label: 'Categories', value: categories.length, accent: '#7F77DD', icon: '🗂️' },
          { label: 'Avg per Category', value: categories.length ? (products.length / categories.length).toFixed(1) : 0, accent: '#1D9E75', icon: '📊' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#fff', border: '1px solid #EEECEA', borderRadius: 14,
            padding: '1.1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 14,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: stat.accent, borderRadius: '14px 0 0 14px' }} />
            <div style={{ width: 40, height: 40, borderRadius: 10, background: stat.accent + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{stat.label}</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#1C1B19', margin: '3px 0 0', lineHeight: 1 }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
        {/* Categories Panel */}
        <div style={{ background: '#fff', border: '1px solid #EEECEA', borderRadius: 16, padding: '1.25rem', height: 'fit-content' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Categories</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button
              className={`cat-chip ${!activeCategory ? 'active-chip' : ''}`}
              onClick={() => setActiveCategory(null)}
              style={{
                background: !activeCategory ? '#EBF3FB' : 'none',
                color: !activeCategory ? '#2472B3' : '#5F5E5A',
                border: '1px solid ' + (!activeCategory ? '#C3DCF5' : 'transparent'),
                borderRadius: 9, padding: '8px 12px', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: 13, fontWeight: !activeCategory ? 600 : 500, fontFamily: 'inherit',
                transition: 'all 0.15s', textAlign: 'left',
              }}
            >
              <span>All Products</span>
              <span style={{ fontSize: 11, background: !activeCategory ? '#C3DCF5' : '#EEECEA', color: !activeCategory ? '#2472B3' : '#888780', borderRadius: 6, padding: '2px 7px', fontWeight: 600 }}>
                {products.length}
              </span>
            </button>
            {categories.map((cat, i) => {
              const count = getProductsByCategory(cat._id).length;
              const isActive = activeCategory === cat._id;
              const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
              return (
                <button
                  key={cat._id}
                  className={`cat-chip ${isActive ? 'active-chip' : ''}`}
                  onClick={() => setActiveCategory(isActive ? null : cat._id)}
                  style={{
                    background: isActive ? '#EBF3FB' : 'none',
                    color: isActive ? '#2472B3' : '#5F5E5A',
                    border: '1px solid ' + (isActive ? '#C3DCF5' : 'transparent'),
                    borderRadius: 9, padding: '8px 12px', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: 13, fontWeight: isActive ? 600 : 500, fontFamily: 'inherit',
                    transition: 'all 0.15s', textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: accent, flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>{cat.name}</span>
                  </div>
                  <span style={{ fontSize: 11, background: isActive ? '#C3DCF5' : '#EEECEA', color: isActive ? '#2472B3' : '#888780', borderRadius: 6, padding: '2px 7px', fontWeight: 600, flexShrink: 0 }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {categories.length === 0 && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#888780' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
              <p style={{ fontSize: 12, margin: 0 }}>No categories yet</p>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ fontSize: 13, color: '#888780', margin: 0, fontWeight: 500 }}>
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}{activeCategory ? ` in ${getCategoryName(activeCategory)}` : ''}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div style={{
              background: '#fff', border: '1px solid #EEECEA', borderRadius: 16,
              padding: '4rem 2rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1C1B19', margin: '0 0 6px' }}>No products yet</h3>
              <p style={{ fontSize: 13, color: '#888780', margin: '0 0 20px' }}>Add your first product to get started</p>
              <PillButton onClick={() => setShowAddProductModal(true)}>＋ Add Product</PillButton>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              {filteredProducts.map((product, i) => {
                const catIndex = categories.findIndex(c => c._id === product.categoryId);
                const accent = ACCENT_COLORS[(catIndex >= 0 ? catIndex : i) % ACCENT_COLORS.length];
                return (
                  <div key={product._id} className="product-card" style={{
                    background: '#fff',
                    border: '1px solid #EEECEA',
                    borderRadius: 14,
                    padding: '1.25rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent }} />
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: accent + '15',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, marginBottom: 12,
                    }}>📦</div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1C1B19', margin: '0 0 8px', lineHeight: 1.3 }}>
                      {product.name}
                    </h3>
                    <span style={{
                      display: 'inline-block',
                      background: accent + '18',
                      color: accent,
                      fontSize: 11, fontWeight: 600,
                      padding: '3px 9px', borderRadius: 6,
                      marginBottom: 12,
                    }}>
                      {getCategoryName(product.categoryId)}
                    </span>
                    <div style={{ borderTop: '1px solid #F1EFE8', paddingTop: 10, marginTop: 4 }}>
                      <p style={{ fontSize: 11, color: '#B0AEA8', margin: 0 }}>
                        Added {new Date(product.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <Modal title="Add New Product" onClose={() => setShowAddProductModal(false)} onSubmit={handleAddProduct}>
          <div>
            <FieldLabel>Product Name *</FieldLabel>
            <Input value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} placeholder="e.g. iPhone 15 Pro" required />
          </div>
          <div>
            <FieldLabel>Category *</FieldLabel>
            <Select value={newProduct.categoryId} onChange={e => setNewProduct(p => ({ ...p, categoryId: e.target.value }))} required>
              <option value="">Select a category</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </Select>
          </div>
        </Modal>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <Modal title="Add New Category" onClose={() => setShowAddCategoryModal(false)} onSubmit={handleAddCategory}>
          <div>
            <FieldLabel>Category Name *</FieldLabel>
            <Input value={newCategory.name} onChange={e => setNewCategory(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Electronics" required />
          </div>
        </Modal>
      )}
    </div>
  );
}