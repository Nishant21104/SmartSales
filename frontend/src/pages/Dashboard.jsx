import { useEffect, useState } from "react";
import { dashboardAPI } from "../api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const PALETTE = ['#378ADD', '#1D9E75', '#D85A30', '#7F77DD', '#BA7517', '#D4537E'];
const generateColors = (count) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(`hsl(${(i * 360) / count}, 70%, 60%)`);
  }
  return colors;
};
const KPICard = ({ label, value, icon, trend, trendLabel, accent }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #EEECEA',
    borderRadius: 16,
    padding: '1.4rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', top: 0, left: 0, width: 4,
      height: '100%', background: accent, borderRadius: '16px 0 0 16px'
    }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: 8 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 500, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{label}</p>
        <p style={{ fontSize: 28, fontWeight: 700, color: '#2C2C2A', margin: '6px 0 0', lineHeight: 1 }}>{value}</p>
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: accent + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
      }}>{icon}</div>
    </div>
    {trendLabel && (
      <p style={{ fontSize: 12, color: trend >= 0 ? '#0F6E56' : '#993C1D', fontWeight: 500, margin: 0, paddingLeft: 8 }}>
        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% {trendLabel}
      </p>
    )}
  </div>
);

const FilterSelect = ({ value, onChange, children }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{
      padding: '8px 12px',
      border: '1px solid #D3D1C7',
      borderRadius: 10,
      fontSize: 13,
      color: '#444441',
      background: '#fff',
      outline: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
    }}
  >
    {children}
  </select>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    productId: '',
    categoryId: '',
    year: '',
    month: '',
    region: '',
  });

  // Reset month when year changes
  useEffect(() => {
    if (filters.year === '') {
      setFilters(prev => ({ ...prev, month: '' }));
    }
  }, [filters.year]);

  useEffect(() => { fetchDashboard(); }, [filters]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getMetrics(filters);
      setData(res.data);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

 const handleFilterChange = (key, value) => {
  setFilters(prev => {
    // 🚫 block month if no year
    if (key === 'month' && !prev.year) return prev;

    // 🔄 reset month when year is cleared
    if (key === 'year') {
      return {
        ...prev,
        year: value,
        month: value ? prev.month : '' // 👈 KEY FIX
      };
    }

    return { ...prev, [key]: value };
  });
};
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid #E6F1FB',
        borderTopColor: '#378ADD',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!data) return (
    <div style={{ color: '#993C1D', padding: '2rem', textAlign: 'center', fontSize: 14 }}>
      Failed to load dashboard data
    </div>
  );

  const avgOrder = data.totalOrders > 0 ? (data.totalRevenue / data.totalOrders).toFixed(2) : '0.00';

  const barData = {
    labels: data.monthly?.map(m => m.month) || [],
    datasets: [{
      label: 'Revenue',
      data: data.monthly?.map(m => m.total) || [],
      backgroundColor: '#378ADD22',
      borderColor: '#378ADD',
      borderWidth: 2,
      borderRadius: 6,
    }],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `₹${ctx.raw.toLocaleString()}`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#888780', font: { size: 11 } } },
      y: {
        grid: { color: '#F1EFE8' },
        ticks: { color: '#888780', font: { size: 11 }, callback: v => `₹${v.toLocaleString()}` }
      },
    },
  };

  const donutOpts = {
    responsive: true,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#444441', font: { size: 12 }, padding: 12, boxWidth: 12, borderRadius: 4 }
      },
    },
  };

  const catData = {
    labels: data.categoryData?.map(c => c.name) || [],
    datasets: [{ data: data.categoryData?.map(c => c.total) || [], backgroundColor: generateColors(data.categoryData.length), borderWidth: 0 }],
  };

  const regionData = {
    labels: data.regionData?.map(r => r.name) || [],
    datasets: [{ data: data.regionData?.map(r => r.total) || [],backgroundColor: generateColors(data.regionData.length), borderWidth: 0 }],
  };

  const s = { fontFamily: "'DM Sans', 'Segoe UI', sans-serif" };

  return (
    <div style={{ ...s, padding: '2rem', background: '#FAFAF8', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1D9E75' }} />
          <p style={{ fontSize: 12, color: '#888780', margin: 0, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Sales Overview
          </p>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1C1B19', margin: 0, letterSpacing: '-0.02em' }}>
          Dashboard
        </h1>
      </div>

      {/* Filters Bar */}
      <div style={{
        background: '#fff',
        border: '1px solid #EEECEA',
        borderRadius: 14,
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 4 }}>
          Filters
        </span>

        <FilterSelect value={filters.year} onChange={v => handleFilterChange('year', v)}>
          <option value="">All Years</option>
          {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </FilterSelect>

      <FilterSelect
  key={filters.year} // 🔥 forces re-render
  value={filters.month}
  onChange={v => handleFilterChange('month', v)}
  disabled={!filters.year}
>
         <option value="">
  {filters.year ? "All Months" : "Select year first"}
</option>
          {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) =>
            <option key={m} value={i + 1}>{m}</option>
          )}
        </FilterSelect>

        {/* <input
          type="text"
          placeholder="Region…"
          value={filters.region}
          onChange={e => handleFilterChange('region', e.target.value)}
          style={{
            padding: '8px 12px', border: '1px solid #D3D1C7', borderRadius: 10,
            fontSize: 13, color: '#444441', outline: 'none', fontFamily: 'inherit', width: 130,
          }}
        /> */}

        <button
          onClick={() => setFilters({ productId: '', categoryId: '', year: new Date().getFullYear().toString(), month: (new Date().getMonth() + 1).toString(), region: '' })}
          style={{
            marginLeft: 'auto', padding: '8px 16px', background: 'transparent',
            border: '1px solid #D3D1C7', borderRadius: 10, fontSize: 13,
            color: '#5F5E5A', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
          }}
        >
          Reset
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: '1.5rem' }}>
        <KPICard label="Total Revenue" value={`₹${data.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`} icon="💰" trend={data.growthPercentage} trendLabel="vs last period" accent="#378ADD" />
        <KPICard label="Total Orders" value={data.totalOrders?.toLocaleString() || '0'} icon="📦" accent="#1D9E75" />
        <KPICard label="Products" value={data.totalProducts?.toLocaleString() || '0'} icon="🗂️" accent="#7F77DD" />
        <KPICard label="Avg. Order Value" value={`₹${avgOrder}`} icon="📊" trend={data.growthPercentage} trendLabel="growth" accent="#BA7517" />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Monthly Bar */}
        <div style={{ background: '#fff', border: '1px solid #EEECEA', borderRadius: 16, padding: '1.5rem', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#2C2C2A', margin: 0 }}>Monthly Revenue Trend</h3>
            <span style={{ fontSize: 12, color: '#888780', fontWeight: 500 }}>
              {filters.year || 'All time'}
            </span>
          </div>
          <Bar data={barData} options={barOptions} height={80} />
        </div>

        {/* Category Donut */}
        <div style={{ background: '#fff', border: '1px solid #EEECEA', borderRadius: 16, padding: '1.5rem' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#2C2C2A', margin: '0 0 1.25rem' }}>Revenue by Category</h3>
          <Doughnut data={catData} options={donutOpts} />
        </div>

        {/* Region Donut */}
        <div style={{ background: '#fff', border: '1px solid #EEECEA', borderRadius: 16, padding: '1.5rem' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#2C2C2A', margin: '0 0 1.25rem' }}>Revenue by Region</h3>
          <Doughnut data={regionData} options={donutOpts} />
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ background: '#fff', border: '1px solid #EEECEA', borderRadius: 16, padding: '1.5rem' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#2C2C2A', margin: '0 0 1rem' }}>Quick Stats</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { label: 'Avg. Order Value', value: `₹${avgOrder}` },
            { label: 'Top Category', value: data.categoryData?.[0]?.name || 'N/A' },
            { label: 'Top Region', value: data.regionData?.[0]?.name || 'N/A' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#FAFAF8', borderRadius: 12, padding: '1rem 1.25rem' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#888780', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#1C1B19', margin: 0 }}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}