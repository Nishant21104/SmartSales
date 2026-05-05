import { useEffect, useState } from "react";
import { dataAPI } from "../api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const s = { fontFamily: "'DM Sans', 'Segoe UI', sans-serif" };

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

export default function Analytics() {
  const [productAnalytics, setProductAnalytics] = useState([]);
  const [regionAnalytics, setRegionAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categoryId: '',
    year: new Date().getFullYear().toString(),
    month: '',
  });

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [productRes, regionRes] = await Promise.all([
        dataAPI.getAnalytics.products(filters),
        dataAPI.getAnalytics.regions(filters),
      ]);
      setProductAnalytics(productRes.data);
      setRegionAnalytics(regionRes.data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #E6F1FB', borderTopColor: '#378ADD', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const productChartData = {
    labels: productAnalytics.map(p => p.product),
    datasets: [
      {
        label: 'Quantity Sold',
        data: productAnalytics.map(p => p.quantity),
        backgroundColor: '#378ADD20',
        borderColor: '#378ADD',
        borderWidth: 2,
        yAxisID: 'y',
      },
      {
        label: 'Revenue',
        data: productAnalytics.map(p => p.total),
        backgroundColor: '#1D9E7520',
        borderColor: '#1D9E75',
        borderWidth: 2,
        yAxisID: 'y1',
      }
    ],
  };

  const regionChartData = {
    labels: regionAnalytics.map(r => r.region),
    datasets: [{
      data: regionAnalytics.map(r => r.total),
      backgroundColor: ACCENT_COLORS,
      borderWidth: 0,
    }],
  };

  const topProducts = productAnalytics.slice(0, 5);
  const topRegions = regionAnalytics.slice(0, 5);

  return (
    <div style={{ ...s, padding: '2rem', background: '#FAFAF8', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .chart-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.09) !important; transform: translateY(-1px); }
        .chart-card { transition: box-shadow 0.2s, transform 0.2s; }
        .stat-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important; transform: translateY(-1px); }
        .stat-card { transition: box-shadow 0.2s, transform 0.2s; }
      `}</style>

      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#BA7517' }} />
          <p style={{ fontSize: 12, color: '#888780', margin: 0, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Analytics</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1C1B19', margin: 0, letterSpacing: '-0.02em' }}>Sales Analytics</h1>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #EEECEA', borderRadius: 16, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 12, flex: 1, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <Select value={filters.year} onChange={e => handleFilterChange('year', e.target.value)}>
              <option value="">All Years</option>
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Select>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <Select value={filters.month} onChange={e => handleFilterChange('month', e.target.value)}>
              <option value="">All Months</option>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                <option key={month} value={index + 1}>{month}</option>
              ))}
            </Select>
          </div>
        </div>
        {(filters.year || filters.month) && (
          <PillButton variant="secondary" onClick={() => setFilters({
            categoryId: '',
            year: new Date().getFullYear().toString(),
            month: '',
          })}>
            Clear
          </PillButton>
        )}
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: '1.5rem' }}>
        {[
          {
            label: 'Total Products Sold',
            value: productAnalytics.reduce((sum, p) => sum + p.quantity, 0).toLocaleString(),
            accent: '#378ADD',
            icon: '📦'
          },
          {
            label: 'Total Revenue',
            value: `₹${productAnalytics.reduce((sum, p) => sum + p.total, 0).toFixed(0)}`,
            accent: '#1D9E75',
            icon: '💰'
          },
          {
            label: 'Active Regions',
            value: regionAnalytics.length,
            accent: '#7F77DD',
            icon: '🌍'
          },
          {
            label: 'Avg Product Price',
            value: `₹${productAnalytics.length > 0
              ? (productAnalytics.reduce((sum, p) => sum + p.total, 0) / productAnalytics.reduce((sum, p) => sum + p.quantity, 0)).toFixed(0)
              : '0'
            }`,
            accent: '#BA7517',
            icon: '📊'
          },
        ].map(stat => (
          <div key={stat.label} className="stat-card" style={{
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

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="chart-card" style={{ background: '#fff', border: '1px solid #EEECEA', borderRadius: 16, padding: '1.5rem' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#2C2C2A', margin: '0 0 1.25rem' }}>Product Performance</h3>
          {/* Fixed-height wrapper stops Chart.js infinite-growth loop */}
          <div style={{ position: 'relative', height: 300 }}>
            <Bar
              data={productChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: '#F1EFE8' },
                    ticks: { color: '#888780', font: { size: 11 } },
                    title: { display: true, text: 'Quantity', color: '#888780', font: { size: 11 } },
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#888780', font: { size: 11 } },
                    title: { display: true, text: 'Revenue (₹)', color: '#888780', font: { size: 11 } },
                  },
                  x: { grid: { display: false }, ticks: { color: '#888780', font: { size: 11 } } },
                },
                plugins: {
                  legend: {
                    labels: { color: '#444441', font: { size: 12 }, boxWidth: 12 }
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-card" style={{ background: '#fff', border: '1px solid #EEECEA', borderRadius: 16, padding: '1.5rem' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#2C2C2A', margin: '0 0 1.25rem' }}>Revenue by Region</h3>
          {/* Fixed-height wrapper stops Chart.js infinite-growth loop */}
          <div style={{ position: 'relative', height: 300 }}>
            <Pie
              data={regionChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#444441', font: { size: 12 }, padding: 12, boxWidth: 12 },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Top Lists */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #EEECEA', borderRadius: 16, padding: '1.5rem' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#2C2C2A', margin: '0 0 1rem' }}>Top Products</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topProducts.map((product, index) => (
              <div key={product.product} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', background: '#FAFAF8', borderRadius: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#185FA5', flexShrink: 0,
                  }}>{index + 1}</div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#1C1B19' }}>{product.product}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#888780' }}>{product.quantity} units sold</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#0F6E56' }}>₹{product.total.toFixed(2)}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#B4B2A9' }}>Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #EEECEA', borderRadius: 16, padding: '1.5rem' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#2C2C2A', margin: '0 0 1rem' }}>Top Regions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topRegions.map((region, index) => (
              <div key={region.region} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', background: '#FAFAF8', borderRadius: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#3B6D11', flexShrink: 0,
                  }}>{index + 1}</div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#1C1B19' }}>{region.region}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#888780' }}>Region</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#0F6E56' }}>₹{region.total.toFixed(2)}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#B4B2A9' }}>Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {productAnalytics.length === 0 && regionAnalytics.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888780' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📈</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2C2C2A', margin: '0 0 6px' }}>No analytics data available</h3>
          <p style={{ fontSize: 13, margin: 0 }}>Start making sales to see detailed analytics</p>
        </div>
      )}
    </div>
  );
}