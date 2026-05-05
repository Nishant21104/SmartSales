import { useEffect, useState } from "react";
import { uploadAPI } from "../api";

const s = { fontFamily: "'DM Sans', 'Segoe UI', sans-serif" };

const PillButton = ({ onClick, children, variant = 'primary', disabled }) => {
  const styles = {
    primary: { background: '#378ADD', color: '#fff', border: 'none' },
    secondary: { background: '#fff', color: '#5F5E5A', border: '1px solid #D3D1C7' },
    success: { background: '#1D9E75', color: '#fff', border: 'none' },
    danger: { background: '#D4537E', color: '#fff', border: 'none' },
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

export default function Upload() {
  const [uploadHistory, setUploadHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchUploadHistory();
  }, []);

  const fetchUploadHistory = async () => {
    try {
      const res = await uploadAPI.getHistory();
      setUploadHistory(res.data);
    } catch (err) {
      console.error('Upload history fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please select an Excel or CSV file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = 'http://localhost:5000/api/upload/download-template';
    link.download = 'sample-sales-template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const response = await uploadAPI.uploadFile(selectedFile);
      console.log('Upload response:', response.data);
      
      if (response.data.totalErrors > 0) {
        alert(`⚠️ Upload completed with issues!\n\n✅ ${response.data.success} records imported successfully\n❌ ${response.data.totalErrors} records had errors\n\n📥 Please download the sample template and ensure your column names match exactly:\n• CustomerName, Email, City, Product, Category, Quantity, Price, Date, Region, PaymentMode`);
      } else {
        alert(`🎉 File uploaded successfully! ${response.data.message || ''}`);
      }
      
      setSelectedFile(null);
      fetchUploadHistory();
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Upload failed. Please try again.';
      alert(`❌ Upload failed: ${errorMessage}\n\n📥 Please download the sample template and ensure your column names match exactly.`);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return { background: '#1D9E7515', color: '#1D9E75', label: '✓ Success' };
      case 'processing':
        return { background: '#BA751715', color: '#BA7517', label: '⟳ Processing' };
      case 'failed':
        return { background: '#D4537E15', color: '#D4537E', label: '✗ Failed' };
      default:
        return { background: '#EEECEA', color: '#888780', label: '⏸ Pending' };
    }
  };

  return (
    <div style={{ ...s, padding: '2rem', background: '#FAFAF8', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .upload-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.09) !important; transform: translateY(-1px); }
        .upload-card { transition: box-shadow 0.2s, transform 0.2s; }
        .drag-active { background: #E6F1FB !important; border-color: #378ADD !important; }
        .file-row:hover { background: #F5F3EE !important; }
        .file-row { transition: background 0.15s; }
      `}</style>

      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D85A30' }} />
          <p style={{ fontSize: 12, color: '#888780', margin: 0, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Data Management</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1C1B19', margin: 0, letterSpacing: '-0.02em' }}>Data Upload</h1>
        </div>
      </div>

      {/* Upload Area */}
      <div className="upload-card" style={{ background: '#fff', border: '1px solid #EEECEA', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1C1B19', margin: '0 0 1rem' }}>Upload New File</h2>
        
        <div
          className={dragActive ? 'drag-active' : ''}
          style={{
            border: '2px dashed #D3D1C7',
            borderRadius: 12,
            padding: '3rem 2rem',
            textAlign: 'center',
            transition: 'all 0.15s',
            cursor: 'pointer',
            background: dragActive ? '#E6F1FB' : '#FAFAF8',
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>📤</div>
          
          {selectedFile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              <div style={{
                background: '#378ADD15',
                padding: '16px',
                borderRadius: 12,
                border: '1px solid #378ADD30',
                width: '100%',
                maxWidth: 400,
              }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#378ADD', margin: '0 0 4px' }}>{selectedFile.name}</p>
                <p style={{ fontSize: 12, color: '#5F5E5A', margin: 0 }}>{formatFileSize(selectedFile.size)}</p>
              </div>
              
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <PillButton variant="secondary" onClick={() => setSelectedFile(null)}>
                  Remove
                </PillButton>
                <PillButton onClick={handleUpload} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload File'}
                </PillButton>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              <p style={{ fontSize: 14, color: '#5F5E5A', margin: 0 }}>
                Drag and drop your Excel or CSV file here, or click to browse
              </p>
                
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                  id="file-input"
                />
                
                <label
                  htmlFor="file-input"
                  style={{
                    display: 'inline-block',
                    padding: '10px 16px',
                    background: '#378ADD',
                    color: '#fff',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.target.style.background = '#2E6BB3'}
                  onMouseLeave={e => e.target.style.background = '#378ADD'}
                >
                  Choose File
                </label>
                
                <PillButton variant="success" onClick={handleDownloadTemplate}>
                  <span>📥</span>
                  <span>Download Template</span>
                </PillButton>
              </div>
                
              <div style={{ fontSize: 12, color: '#888780', textAlign: 'center' }}>
                <p>Supported formats: Excel (.xlsx, .xls), CSV</p>
                <p>Maximum file size: 10MB</p>
                <p style={{ color: '#1D9E75', fontWeight: 600, margin: '4px 0 0' }}>📋 Download the sample template for correct column names</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload History */}
      <div className="upload-card" style={{ background: '#fff', border: '1px solid #EEECEA', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1C1B19', margin: '0 0 1rem' }}>Upload History</h2>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '2px solid #E6F1FB', borderTopColor: '#378ADD',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : uploadHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1C1B19', margin: '0 0 6px' }}>No upload history</h3>
            <p style={{ fontSize: 13, color: '#888780', margin: 0 }}>Your uploaded files will appear here</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FAFAF8' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    File Name
                  </th>
                  {/* <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Size
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Status
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Records
                  </th> */}
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Upload Date
                  </th>
                  {/* <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Status
                  </th> */}
                </tr>
              </thead>
              <tbody>
                {uploadHistory.map((upload) => {
                  const statusInfo = getStatusColor(upload.status);
                  return (
                    <tr key={upload._id} className="file-row" style={{ borderBottom: '1px solid #F1EFE8' }}>
                      <td style={{ padding: '16px', fontSize: 13, color: '#1C1B19' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 20 }}>📊</span>
                          <span style={{ fontWeight: 500 }}>{upload.fileName}</span>
                        </div>
                      </td>
                      {/* <td style={{ padding: '16px', fontSize: 13, color: '#5F5E5A' }}>
                        {formatFileSize(upload.fileSize)}
                      </td> */}
                      {/* <td style={{ padding: '16px' }}>
                        <span style={{
                          background: statusInfo.background,
                          color: statusInfo.color,
                          fontSize: 11, fontWeight: 600,
                          padding: '4px 10px', borderRadius: 20,
                          display: 'inline-block',
                        }}>
                          {statusInfo.label}
                        </span>
                      </td> */}
                      {/* <td style={{ padding: '16px', fontSize: 13, color: '#1C1B19', fontWeight: 600 }}>
                        {upload.recordsProcessed || 0}
                      </td> */}
                      <td style={{ padding: '16px', fontSize: 13, color: '#5F5E5A' }}>
                        {new Date(upload.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      {/* <td style={{ padding: '16px' }}>
                        <span style={{
                          color: statusInfo.color,
                          fontSize: 12, fontWeight: 600,
                        }}>
                          {statusInfo.label}
                        </span>
                      </td> */}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="upload-card" style={{ 
        background: 'linear-gradient(135deg, #E6F1FB 0%, #F5F3EE 100%)', 
        border: '1px solid #C3DCF5', 
        borderRadius: 16, 
        padding: '1.5rem' 
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1C1B19', margin: '0 0 1rem' }}>📋 Upload Instructions & Template</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, marginBottom: 20 }}>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#378ADD', margin: '0 0 12px' }}>✅ Required Columns:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['CustomerName', 'Product', 'Quantity', 'Price', 'Date'].map(col => (
                <div key={col} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1C1B19' }}>
                  <span style={{ color: '#1D9E75', fontWeight: 700 }}>✓</span>
                  <span>{col}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#378ADD', margin: '0 0 12px' }}>🔧 Optional Columns:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['Email', 'City', 'Category', 'Region', 'PaymentMode'].map(col => (
                <div key={col} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#5F5E5A' }}>
                  <span style={{ color: '#888780', fontWeight: 700 }}>○</span>
                  <span>{col}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div style={{ 
          background: '#BA751715', 
          padding: '12px 16px', 
          borderRadius: 10, 
          border: '1px solid #BA751730',
          marginBottom: 20 
        }}>
          <p style={{ fontSize: 13, color: '#BA7517', margin: 0, lineHeight: 1.5 }}>
            <strong style={{ fontWeight: 700 }}>⚠️ Important:</strong> Column names must match exactly as shown above. 
            Download the sample template to ensure correct formatting.
          </p>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <PillButton variant="success" onClick={handleDownloadTemplate} style={{ padding: '10px 20px', fontSize: 14 }}>
            <span>📥</span>
            <span>Download Sample Template</span>
          </PillButton>
        </div>
      </div>
    </div>
  );
}
