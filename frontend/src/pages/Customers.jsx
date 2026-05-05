import { useEffect, useState } from "react";
import { dataAPI, customerAPI } from "../api";

const s = { fontFamily: "'DM Sans', 'Segoe UI', sans-serif" };

const PillButton = ({ onClick, children, variant = 'primary', disabled }) => {
  const styles = {
    primary: { background: '#378ADD', color: '#fff', border: 'none' },
    secondary: { background: '#fff', color: '#5F5E5A', border: '1px solid #D3D1C7' },
    danger: { background: '#fff', color: '#C0392B', border: '1px solid #E8C5BF' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles[variant], padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
      display: 'flex', alignItems: 'center', gap: 6, opacity: disabled ? 0.5 : 1, transition: 'opacity 0.15s',
    }}>
      {children}
    </button>
  );
};

const FieldLabel = ({ children }) => (
  <label style={{ fontSize: 12, fontWeight: 600, color: '#5F5E5A', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{children}</label>
);

const Input = ({ value, onChange, placeholder, type = 'text', required }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} style={{
    width: '100%', padding: '10px 12px', border: '1px solid #D3D1C7', borderRadius: 10,
    fontSize: 13, color: '#1C1B19', fontFamily: 'inherit', outline: 'none', background: '#FAFAF8', marginTop: 6,
  }} />
);

const Modal = ({ title, onClose, onSubmit, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,27,25,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
    <div style={{ background: '#fff', borderRadius: 18, padding: '2rem', width: '100%', maxWidth: 440, boxShadow: '0 24px 48px rgba(0,0,0,0.12)' }}>
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

const GRADIENT_PAIRS = [
  ['#378ADD', '#7F77DD'],
  ['#1D9E75', '#378ADD'],
  ['#D85A30', '#BA7517'],
  ['#7F77DD', '#D4537E'],
  ['#BA7517', '#D85A30'],
];

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ productId: '', categoryId: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', city: '' });

  useEffect(() => { fetchCustomers(); }, [search, filters]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await dataAPI.getCustomers({ search, ...filters });
      setCustomers(res.data);
    } catch (err) {
      console.error('Customers fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await customerAPI.createCustomer(newCustomer);
      setShowAddModal(false);
      setNewCustomer({ name: '', email: '', city: '' });
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add customer');
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (confirm('Delete this customer?')) {
      try {
        await customerAPI.deleteCustomer(id);
        fetchCustomers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete customer');
      }
    }
  };

  const totalRevenue = customers.reduce((s, c) => s + (c.revenue || 0), 0);
  const totalOrders = customers.reduce((s, c) => s + (c.orders || 0), 0);
  const highValue = customers.filter(c => c.revenue > 1000).length;

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
        .customer-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.09) !important; transform: translateY(-2px); }
        .customer-card { transition: box-shadow 0.2s, transform 0.2s; }
        .del-btn:hover { background: #FDF1EE !important; color: #C0392B !important; }
        .search-input:focus { border-color: #378ADD !important; box-shadow: 0 0 0 3px #378ADD22; }
      `}</style>

      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1D9E75' }} />
          <p style={{ fontSize: 12, color: '#888780', margin: 0, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>CRM</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1C1B19', margin: 0, letterSpacing: '-0.02em' }}>Customers</h1>
          <PillButton onClick={() => setShowAddModal(true)}>＋ Add Customer</PillButton>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Customers', value: customers.length, accent: '#378ADD', icon: '👥' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, accent: '#1D9E75', icon: '💰' },
          { label: 'Total Orders', value: totalOrders.toLocaleString(), accent: '#7F77DD', icon: '📦' },
          { label: 'High-Value', value: highValue, accent: '#BA7517', icon: '⭐' },
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
              <p style={{ fontSize: 22, fontWeight: 700, color: '#1C1B19', margin: '3px 0 0', lineHeight: 1 }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter Bar */}
      <div style={{ background: '#fff', border: '1px solid #EEECEA', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#B0AEA8' }}>🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search customers…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9,
              border: '1px solid #D3D1C7', borderRadius: 10, fontSize: 13, color: '#1C1B19',
              fontFamily: 'inherit', outline: 'none', background: '#FAFAF8', transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
          />
        </div>
        {(search || filters.productId) && (
          <button onClick={() => { setSearch(''); setFilters({ productId: '', categoryId: '' }); }}
            style={{ padding: '8px 14px', background: 'none', border: '1px solid #D3D1C7', borderRadius: 10, fontSize: 13, color: '#888780', cursor: 'pointer', fontFamily: 'inherit' }}>
            Clear
          </button>
        )}
        <p style={{ margin: 0, fontSize: 13, color: '#888780', marginLeft: 'auto' }}>
          {customers.length} result{customers.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Customer Grid */}
      {customers.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #EEECEA', borderRadius: 16, padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1C1B19', margin: '0 0 6px' }}>No customers found</h3>
          <p style={{ fontSize: 13, color: '#888780', margin: '0 0 20px' }}>Add your first customer to get started</p>
          <PillButton onClick={() => setShowAddModal(true)}>＋ Add Customer</PillButton>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {customers.map((customer, i) => {
            const [c1, c2] = GRADIENT_PAIRS[i % GRADIENT_PAIRS.length];
            const initials = customer.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'C';
            const avgOrder = customer.orders > 0 ? (customer.revenue / customer.orders).toFixed(2) : '0.00';
            return (
              <div key={customer._id} className="customer-card" style={{
                background: '#fff', border: '1px solid #EEECEA', borderRadius: 16, overflow: 'hidden',
              }}>
                {/* Card Header */}
                <div style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, padding: '1.25rem', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.25)',
                      backdropFilter: 'blur(4px)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0,
                    }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customer.name}</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{customer.email || 'No email'}</p>
                    </div>
                    <button className="del-btn" onClick={() => handleDeleteCustomer(customer._id)} style={{
                      background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8,
                      padding: '6px', cursor: 'pointer', color: '#fff', transition: 'background 0.15s, color 0.15s',
                    }}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    {customer.revenue > 1000 && (
                      <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>⭐ High Value</span>
                    )}
                    {customer.orders > 10 && (
                      <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>🔄 Frequent</span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    <div style={{ background: '#F5F3EE', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                      <p style={{ fontSize: 20, fontWeight: 700, color: '#378ADD', margin: 0 }}>{customer.orders || 0}</p>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#888780', margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Orders</p>
                    </div>
                    <div style={{ background: '#F5F3EE', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                      <p style={{ fontSize: 20, fontWeight: 700, color: '#1D9E75', margin: 0 }}>₹{(customer.revenue || 0).toFixed(0)}</p>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#888780', margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Revenue</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#888780', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span>📍</span> City
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1C1B19' }}>{customer.city || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#888780', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span>📊</span> Avg Order
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#7F77DD' }}>₹{avgOrder}</span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #F1EFE8', marginTop: 12, paddingTop: 10 }}>
                    {/* <p style={{ fontSize: 11, color: '#B0AEA8', margin: 0 }}>
                      Customer since {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p> */}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showAddModal && (
        <Modal title="Add New Customer" onClose={() => setShowAddModal(false)} onSubmit={handleAddCustomer}>
          <div>
            <FieldLabel>Full Name *</FieldLabel>
            <Input value={newCustomer.name} onChange={e => setNewCustomer(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Priya Sharma" required />
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" value={newCustomer.email} onChange={e => setNewCustomer(p => ({ ...p, email: e.target.value }))} placeholder="e.g. priya@example.com" />
          </div>
          <div>
            <FieldLabel>City</FieldLabel>
            <Input value={newCustomer.city} onChange={e => setNewCustomer(p => ({ ...p, city: e.target.value }))} placeholder="e.g. Mumbai" />
          </div>
        </Modal>
      )}
    </div>
  );
}