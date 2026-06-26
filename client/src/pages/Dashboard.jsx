import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const { user, logout, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileRef.current?.files[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { data } = await api.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.user);
      setMessage('Avatar uploaded successfully!');
      setPreview(null);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user.avatar) return;

    setUploading(true);
    setMessage('');

    try {
      // Extract publicId from Cloudinary URL
      const parts = user.avatar.split('/');
      const filename = parts[parts.length - 1];
      const publicId = `uploads/${filename.split('.')[0]}`;

      await api.delete('/upload/image', { data: { publicId } });
      updateUser({ ...user, avatar: '' });
      setMessage('Avatar removed');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Delete failed');
    } finally {
      setUploading(false);
    }
  };

  const avatarSrc = preview || user.avatar || null;

  return (
    <div className="dashboard">
      <div className="dashboard-card">
        <div className="profile-section">
          <div className="avatar-wrapper">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                {user.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div className="avatar-ring" />
          </div>

          <h2 className="user-name">{user.name}</h2>
          <p className="user-email">{user.email}</p>
          <p className="user-joined">
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="upload-section">
          <h3>Upload Avatar</h3>

          <div className="file-input-wrapper">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              id="avatar-input"
              className="file-input"
            />
            <label htmlFor="avatar-input" className="file-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Choose Image
            </label>
          </div>

          {preview && (
            <button
              className="upload-btn"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? <span className="spinner" /> : 'Upload Avatar'}
            </button>
          )}

          {user.avatar && !preview && (
            <button
              className="delete-btn"
              onClick={handleDeleteAvatar}
              disabled={uploading}
            >
              Remove Avatar
            </button>
          )}

          {message && (
            <div className={`upload-message ${message.includes('success') || message.includes('removed') ? 'success' : ''}`}>
              {message}
            </div>
          )}
        </div>

        <div className="dashboard-actions">
          <button className="logout-btn" onClick={logout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
