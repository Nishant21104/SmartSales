import { useEffect, useState } from "react";
import { salesAPI, dataAPI } from "../api";

const s = { fontFamily: "'DM Sans', 'Segoe UI', sans-serif" };

const badge = (text, color = '#378ADD') => ({
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 600,
  background: color + '18',
  color,
  letterSpacing: '0.03em',
});

const PAYMENT_COLORS = { cash: '#1D9E75', card: '#378ADD', online: '#7F77DD' };
const REGION_COLORS = { North: '#BA7517', South: '#D85A30', East: '#D4537E', West: '#378ADD', Central: '#1D9E75' };

function FilterSelect({ value, onChange, children }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      padding: '9px 14px',
      border: '1px solid #E4E2DA',
      borderRadius: 10,
      fontSize: 13,
      color: '#444441',
      background: '#fff',
      outline: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      minWidth: 130,
    }}>
      {children}
    </select>
  );
}

function Modal({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(28,27,25,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
      backdropFilter: 'blur(2px)',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#fff', borderRadius: 20,
        padding: '2rem', width: '100%', maxWidth: 480,
        boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
        animation: 'slideUp 0.2s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1C1B19', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: '#F1EFE8', border: 'none', borderRadius: 8,
            width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#5F5E5A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5F5E5A', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 14px',
  border: '1px solid #E4E2DA',
  borderRadius: 10, fontSize: 13,
  color: '#2C2C2A', outline: 'none',
  fontFamily: 'inherit', background: '#FAFAF8',
  boxSizing: 'border-box',
};

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({ productId: '', categoryId: '', year: '', month: '', region: '' });
  const [newSale, setNewSale] = useState({
    productId: '', customerId: '', quantity: 1, price: 0,
    saleDate: new Date().toISOString().split('T')[0],
    region: '', paymentMode: 'cash',
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchData(); }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesRes, productsRes, customersRes, categoriesRes] = await Promise.all([
        salesAPI.getSales(filters),
        dataAPI.getProducts(),
        dataAPI.getCustomers(),
        dataAPI.getCategories(),
      ]);
      setSales(salesRes.data);
      setProducts(productsRes.data);
      setCustomers(customersRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error('Sales fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSale = async (e) => {
    e.preventDefault();
    if (!newSale.productId) return alert('Please select a product');
    if (!newSale.customerId) return alert('Please select a customer');
    if (newSale.quantity <= 0) return alert('Quantity must be greater than 0');
    if (newSale.price <= 0) return alert('Price must be greater than 0');
    try {
      await salesAPI.createSale(newSale);
      setShowAddModal(false);
      setNewSale({ productId: '', customerId: '', quantity: 1, price: 0, saleDate: new Date().toISOString().split('T')[0], region: '', paymentMode: 'cash' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add sale');
    }
  };

  const handleDeleteSale = async (id) => {
    try {
      await salesAPI.deleteSale(id);
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      console.error('Delete sale error:', err);
    }
  };

  const getProductPrice = (productId) => products.find(p => p._id === productId)?.price || 0;

  useEffect(() => {
    if (newSale.productId) {
      setNewSale(prev => ({ ...prev, price: getProductPrice(prev.productId) }));
    }
  }, [newSale.productId, products]);

  const totalRevenue = sales.reduce((sum, s) => sum + s.quantity * s.price, 0);
  const years = [...new Set(sales.map(s => new Date(s.saleDate).getFullYear()))].sort((a,b) => b-a);
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
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        tr:hover td { background: #F7F6F3 !important; }
      `}</style>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#378ADD' }} />
            <p style={{ fontSize: 11, color: '#888780', margin: 0, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Transactions
            </p>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1C1B19', margin: 0, letterSpacing: '-0.02em' }}>
            Sales
          </h1>
        </div>
      </div>

      {/* Summary Strips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Sales', value: sales.length.toLocaleString(), color: '#378ADD' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: '#1D9E75' },
          { label: 'Avg. Sale Value', value: sales.length > 0 ? `₹${(totalRevenue / sales.length).toFixed(2)}` : '₹0.00', color: '#7F77DD' },
        ].map(item => (
          <div key={item.label} style={{
            background: '#fff',
            border: '1px solid #EEECEA',
            borderRadius: 14,
            padding: '1rem 1.25rem',
            borderLeft: `4px solid ${item.color}`,
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#888780', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#1C1B19', margin: 0 }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff',
        border: '1px solid #EEECEA',
        borderRadius: 14,
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#B4B2A9', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 4 }}>
          Filter
        </span>

        <FilterSelect value={filters.productId} onChange={v => setFilters(p => ({ ...p, productId: v }))}>
          <option value="">All Products</option>
          {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </FilterSelect>

        <FilterSelect value={filters.categoryId} onChange={v => setFilters(p => ({ ...p, categoryId: v }))}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </FilterSelect>

     <FilterSelect value={filters.year} onChange={v => setFilters(p => ({ ...p, year: v, month: v ? p.month : '' }))}>
  <option value="">All Years</option>
  {years.map(y => <option key={y} value={y}>{y}</option>)}
</FilterSelect>

    <FilterSelect key={filters.year} value={filters.month} onChange={v => setFilters(p => (!p.year ? p : { ...p, month: v }))} disabled={!filters.year}>
  <option value="">{filters.year ? "All Months" : "Select year first"}</option>
  {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
    <option key={m} value={m}>{new Date(2024, m - 1).toLocaleString('default', { month: 'long' })}</option>
  ))}
</FilterSelect>

        <FilterSelect value={filters.region} onChange={v => setFilters(p => ({ ...p, region: v }))}>
          <option value="">All Regions</option>
          {[...new Set(sales.map(s => s.region).filter(Boolean))].map(r => <option key={r} value={r}>{r}</option>)}
        </FilterSelect>

        <button
          onClick={() => setFilters({ productId: '', categoryId: '', year: '', month: '', region: '' })}
          style={{
            marginLeft: 'auto', padding: '9px 16px', background: 'transparent',
            border: '1px solid #D3D1C7', borderRadius: 10, fontSize: 12,
            color: '#5F5E5A', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          Clear all
        </button>
      </div>

      {/* Table */}
      <div style={{
        background: '#fff',
        border: '1px solid #EEECEA',
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#F7F6F3' }}>
                {['Date', 'Product', 'Customer', 'Qty', 'Unit Price', 'Total', 'Region', 'Payment', ''].map(col => (
                  <th key={col} style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#888780',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    whiteSpace: 'nowrap',
                    borderBottom: '1px solid #EEECEA',
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '3rem', textAlign: 'center', color: '#B4B2A9', fontSize: 14 }}>
                    No sales found for selected filters
                  </td>
                </tr>
              ) : sales.map((sale, i) => {
                const total = (sale.quantity * sale.price).toFixed(2);
                const pmColor = PAYMENT_COLORS[sale.paymentMode] || '#888780';
                const rgColor = REGION_COLORS[sale.region] || '#888780';
                return (
                  <tr key={sale._id} style={{ borderBottom: '1px solid #F1EFE8' }}>
                    <td style={{ padding: '14px 16px', color: '#5F5E5A', whiteSpace: 'nowrap' }}>
                      {new Date(sale.saleDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#1C1B19', fontWeight: 500 }}>
                      {sale.productId?.name || sale.product?.name || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#444441' }}>
                      {sale.customerId?.name || sale.customer?.name || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#444441', textAlign: 'center' }}>
                      {sale.quantity}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#444441' }}>
                      ₹{sale.price?.toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1C1B19' }}>
                      ₹{total}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={badge(sale.region || '—', rgColor)}>
                        {sale.region || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={badge(sale.paymentMode || '—', pmColor)}>
                        {sale.paymentMode || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => setDeleteConfirm(sale._id)}
                        style={{
                          background: 'transparent', border: 'none',
                          color: '#D3D1C7', cursor: 'pointer', fontSize: 16,
                          transition: 'color 0.15s',
                          padding: '4px 8px',
                          borderRadius: 6,
                        }}
                        onMouseEnter={e => e.target.style.color = '#E24B4A'}
                        onMouseLeave={e => e.target.style.color = '#D3D1C7'}
                        title="Delete sale"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sales.length > 0 && (
          <div style={{ padding: '12px 16px', background: '#FAFAF8', borderTop: '1px solid #EEECEA', fontSize: 12, color: '#888780' }}>
            Showing {sales.length} transaction{sales.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      
      {/* Delete Confirmation Modal */}
      <Modal show={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Sale">
        <p style={{ color: '#5F5E5A', fontSize: 14, marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Are you sure you want to delete this sale? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={() => setDeleteConfirm(null)} style={{
            padding: '10px 20px', background: '#fff', border: '1px solid #D3D1C7',
            borderRadius: 10, fontSize: 13, color: '#444441', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
          }}>Cancel</button>
          <button onClick={() => handleDeleteSale(deleteConfirm)} style={{
            padding: '10px 24px', background: '#E24B4A', color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}