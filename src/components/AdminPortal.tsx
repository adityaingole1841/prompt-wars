import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  LogIn,
  LogOut,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Newspaper,
  Upload,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  Edit3,
  Send,
  Map,
  Tag,
  Clock,
  User,
  ToggleLeft,
  ToggleRight,
  Download,
  Loader2,
  Lock,
  Flame,
} from 'lucide-react';
import {
  loginAdmin,
  logoutAdmin,
  getAdminSession,
  getAllPosts,
  savePost,
  deletePost,
  togglePostActive,
  createPost,
  fetchPublicDisasterData,
  SEVERITY_CONFIG,
  CATEGORY_ICONS,
  INDIA_STATES,
} from '../utils/adminStore';
import {
  AdminPost,
  PublicDataItem,
  DisasterCategory,
  DisasterSeverity,
} from '../types/admin';

// ── Severity Badge Component ─────────────────────────────────────────
const SeverityBadge: React.FC<{ severity: DisasterSeverity }> = ({ severity }) => {
  const cfg = SEVERITY_CONFIG[severity];
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        borderRadius: '20px',
        padding: '2px 10px',
        fontSize: '0.7rem',
        fontWeight: 800,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}
    >
      {severity === 'CRITICAL' && '🔴 '}
      {severity === 'WARNING' && '🟠 '}
      {severity === 'WATCH' && '🟡 '}
      {severity === 'INFO' && 'ℹ️ '}
      {cfg.label}
    </span>
  );
};

// ── Login Screen ─────────────────────────────────────────────────────
const AdminLoginScreen: React.FC<{ onLogin: (u: string, p: string) => boolean }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onLogin(username.trim(), password);
    if (!ok) {
      setError('Invalid credentials. Use admin / disaster@2024 for demo.');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div className="admin-login-wrap">
      <div className={`admin-login-card ${shaking ? 'shake' : ''}`}>
        <div className="admin-login-logo">
          <Shield size={36} className="admin-login-icon" />
          <h1 className="admin-login-title">Admin Portal</h1>
          <p className="admin-login-sub">Disaster Management Control Panel</p>
        </div>

        <div className="admin-demo-hint">
          <Lock size={13} />
          <span>Demo credentials — Username: <b>admin</b> · Password: <b>disaster@2024</b></span>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-field-group">
            <label className="admin-field-label">Username</label>
            <div className="admin-input-wrap">
              <User size={16} className="admin-input-icon" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="admin-input"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="admin-field-group">
            <label className="admin-field-label">Password</label>
            <div className="admin-input-wrap">
              <Lock size={16} className="admin-input-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="admin-input"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="admin-pass-toggle"
                onClick={() => setShowPass((v) => !v)}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="admin-login-error">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <button type="submit" className="admin-login-btn">
            <LogIn size={18} />
            Sign In to Admin Portal
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Post Form (Create / Edit) ─────────────────────────────────────────
const DEFAULT_FORM: Omit<AdminPost, 'id' | 'publishedAt' | 'isActive'> = {
  title: '',
  category: 'flood',
  severity: 'WARNING',
  location: '',
  state: 'National',
  description: '',
  source: 'admin',
  sourceUrl: '',
  author: 'Admin',
  tags: [],
};

const PostForm: React.FC<{
  initial?: AdminPost;
  onSave: (post: AdminPost) => void;
  onCancel: () => void;
}> = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState<Omit<AdminPost, 'id' | 'publishedAt' | 'isActive'>>(
    initial
      ? {
          title: initial.title,
          category: initial.category,
          severity: initial.severity,
          location: initial.location,
          state: initial.state,
          description: initial.description,
          source: initial.source,
          sourceUrl: initial.sourceUrl || '',
          imageDataUrl: initial.imageDataUrl,
          author: initial.author,
          tags: initial.tags,
          latitude: initial.latitude,
          longitude: initial.longitude,
        }
      : { ...DEFAULT_FORM }
  );
  const [tagInput, setTagInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | undefined>(initial?.imageDataUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: string, val: unknown) => setForm((f) => ({ ...f, [key]: val }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      set('imageDataUrl', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) {
      set('tags', [...form.tags, t]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => set('tags', form.tags.filter((t) => t !== tag));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initial) {
      onSave({ ...initial, ...form });
    } else {
      onSave(createPost(form));
    }
  };

  const CATEGORIES: DisasterCategory[] = [
    'flood', 'cyclone', 'earthquake', 'fire', 'landslide',
    'heatwave', 'drought', 'tsunami', 'accident', 'industrial', 'epidemic', 'other',
  ];
  const SEVERITIES: DisasterSeverity[] = ['INFO', 'WATCH', 'WARNING', 'CRITICAL'];
  const SOURCES = [
    { val: 'admin', label: '✏️ Admin (Own)' },
    { val: 'ndma', label: '🏛️ NDMA' },
    { val: 'imd', label: '🌦️ IMD' },
    { val: 'pib', label: '📰 PIB' },
    { val: 'reuters', label: '📡 PTI / ANI' },
    { val: 'public', label: '🌐 Public Data' },
  ];

  return (
    <form onSubmit={handleSubmit} className="admin-post-form">
      <div className="apf-row">
        <div className="admin-field-group apf-full">
          <label className="admin-field-label">📰 Bulletin Title *</label>
          <input
            type="text"
            className="admin-input"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Red Alert: Heavy Rainfall in Uttarakhand"
            required
            maxLength={120}
          />
        </div>
      </div>

      <div className="apf-row apf-3col">
        <div className="admin-field-group">
          <label className="admin-field-label">🌀 Category *</label>
          <select className="admin-select" value={form.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-field-group">
          <label className="admin-field-label">🔴 Severity *</label>
          <select className="admin-select" value={form.severity} onChange={(e) => set('severity', e.target.value as DisasterSeverity)}>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="admin-field-group">
          <label className="admin-field-label">🏛️ Source *</label>
          <select className="admin-select" value={form.source} onChange={(e) => set('source', e.target.value)}>
            {SOURCES.map((s) => (
              <option key={s.val} value={s.val}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="apf-row apf-2col">
        <div className="admin-field-group">
          <label className="admin-field-label">📍 Location / City *</label>
          <input
            type="text"
            className="admin-input"
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="e.g. Rishikesh, Dehradun"
            required
          />
        </div>
        <div className="admin-field-group">
          <label className="admin-field-label">🗺️ State *</label>
          <select className="admin-select" value={form.state} onChange={(e) => set('state', e.target.value)}>
            {INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="apf-row apf-2col">
        <div className="admin-field-group">
          <label className="admin-field-label">🌐 Source URL (optional)</label>
          <input
            type="url"
            className="admin-input"
            value={form.sourceUrl || ''}
            onChange={(e) => set('sourceUrl', e.target.value)}
            placeholder="https://ndma.gov.in/..."
          />
        </div>
        <div className="admin-field-group">
          <label className="admin-field-label">👤 Published By</label>
          <input
            type="text"
            className="admin-input"
            value={form.author}
            onChange={(e) => set('author', e.target.value)}
            placeholder="Admin name"
          />
        </div>
      </div>

      <div className="admin-field-group">
        <label className="admin-field-label">📝 Detailed Description *</label>
        <textarea
          className="admin-textarea"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Provide full details: what happened, affected areas, evacuation orders, helplines, safety instructions..."
          rows={5}
          required
          maxLength={2000}
        />
        <span className="admin-char-count">{form.description.length} / 2000</span>
      </div>

      {/* Tags */}
      <div className="admin-field-group">
        <label className="admin-field-label">🏷️ Tags</label>
        <div className="admin-tag-input-row">
          <input
            type="text"
            className="admin-input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            placeholder="Add tag and press Enter..."
          />
          <button type="button" className="btn-admin-add-tag" onClick={addTag}>
            <Plus size={14} /> Add
          </button>
        </div>
        {form.tags.length > 0 && (
          <div className="admin-tags-list">
            {form.tags.map((tag) => (
              <span key={tag} className="admin-tag-chip">
                #{tag}
                <button type="button" onClick={() => removeTag(tag)} className="admin-tag-remove">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Image Upload */}
      <div className="admin-field-group">
        <label className="admin-field-label">🖼️ Attach Image (optional)</label>
        <div
          className="admin-image-upload-zone"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (ev) => {
                const dataUrl = ev.target?.result as string;
                setImagePreview(dataUrl);
                set('imageDataUrl', dataUrl);
              };
              reader.readAsDataURL(file);
            }
          }}
        >
          {imagePreview ? (
            <div className="admin-image-preview-wrap">
              <img src={imagePreview} alt="Preview" className="admin-image-preview" />
              <button
                type="button"
                className="admin-image-remove"
                onClick={(e) => { e.stopPropagation(); setImagePreview(undefined); set('imageDataUrl', undefined); }}
              >
                <X size={14} /> Remove
              </button>
            </div>
          ) : (
            <div className="admin-upload-placeholder">
              <Upload size={28} className="admin-upload-icon" />
              <span>Click or drag-drop an image</span>
              <span className="admin-upload-hint">JPG, PNG, WebP — max 5 MB</span>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
      </div>

      <div className="admin-form-actions">
        <button type="button" className="btn-admin-cancel" onClick={onCancel}>
          <X size={16} /> Cancel
        </button>
        <button type="submit" className="btn-admin-publish">
          <Send size={16} />
          {initial ? 'Save Changes' : 'Publish Bulletin'}
        </button>
      </div>
    </form>
  );
};

// ── Public Data Importer ─────────────────────────────────────────────
const PublicDataImporter: React.FC<{ onImport: (item: PublicDataItem) => void }> = ({ onImport }) => {
  const [items, setItems] = useState<PublicDataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchPublicDisasterData();
    setItems(data);
    setFetched(true);
    setLoading(false);
  };

  return (
    <div className="admin-public-data-section">
      <div className="admin-section-header">
        <div className="admin-section-title">
          <Globe size={18} className="admin-section-icon globe-icon" />
          <span>Public Disaster Data Feed</span>
        </div>
        <button
          type="button"
          className="btn-admin-fetch"
          onClick={loadData}
          disabled={loading}
        >
          {loading ? <Loader2 size={15} className="spin-icon" /> : <RefreshCw size={15} />}
          {loading ? 'Fetching...' : fetched ? 'Refresh Feed' : 'Load Public Data'}
        </button>
      </div>
      <p className="admin-section-desc">
        Fetch real-time disaster data from NDMA, IMD, PIB, and news agencies. Import any item directly as a public bulletin.
      </p>

      {loading && (
        <div className="admin-fetch-loading">
          <Loader2 size={20} className="spin-icon" />
          <span>Fetching from NDMA · IMD · PIB · PTI/ANI feeds...</span>
        </div>
      )}

      {items.length > 0 && (
        <ul className="admin-public-list">
          {items.map((item) => (
            <li key={item.id} className="admin-public-item">
              <div className="admin-public-item-header">
                <div className="admin-public-item-meta">
                  <SeverityBadge severity={item.severity} />
                  <span className="admin-public-source">{CATEGORY_ICONS[item.category]} {item.source}</span>
                  <span className="admin-public-time">
                    <Clock size={11} /> {new Date(item.publishedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-admin-import"
                  onClick={() => onImport(item)}
                  title="Import this as an admin bulletin"
                >
                  <Download size={14} /> Import
                </button>
              </div>
              <strong className="admin-public-title">{item.title}</strong>
              {item.location && (
                <span className="admin-public-location">
                  <Map size={11} /> {item.location}
                </span>
              )}
              <p className="admin-public-summary">{item.summary}</p>
              {item.sourceUrl && (
                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="admin-public-link">
                  🔗 View original source
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      {fetched && items.length === 0 && !loading && (
        <div className="admin-no-data">No public data available at this time.</div>
      )}
    </div>
  );
};

// ── Posts Management Table ────────────────────────────────────────────
const PostsManager: React.FC<{
  posts: AdminPost[];
  onEdit: (post: AdminPost) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}> = ({ posts, onEdit, onDelete, onToggle }) => {
  if (posts.length === 0) {
    return (
      <div className="admin-empty-state">
        <Newspaper size={36} className="admin-empty-icon" />
        <p>No bulletins published yet. Create your first disaster update!</p>
      </div>
    );
  }

  return (
    <ul className="admin-posts-list">
      {posts.map((post) => {
        const cfg = SEVERITY_CONFIG[post.severity];
        return (
          <li
            key={post.id}
            className={`admin-post-item ${!post.isActive ? 'post-inactive' : ''}`}
            style={{ borderLeft: `4px solid ${cfg.border}` }}
          >
            <div className="admin-post-main">
              <div className="admin-post-badges">
                <SeverityBadge severity={post.severity} />
                <span className="admin-post-category">
                  {CATEGORY_ICONS[post.category]} {post.category}
                </span>
                <span className={`admin-post-status ${post.isActive ? 'status-live' : 'status-hidden'}`}>
                  {post.isActive ? <><Eye size={11} /> Live</> : <><EyeOff size={11} /> Hidden</>}
                </span>
              </div>

              <h3 className="admin-post-title">{post.title}</h3>

              <div className="admin-post-meta-row">
                <span><Map size={11} /> {post.location}, {post.state}</span>
                <span><User size={11} /> {post.author}</span>
                <span><Clock size={11} /> {new Date(post.publishedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                <span className="admin-post-source-tag">
                  {post.source === 'admin' ? '✏️ Own' : `📡 ${post.source.toUpperCase()}`}
                </span>
              </div>

              <p className="admin-post-desc">{post.description.slice(0, 180)}{post.description.length > 180 ? '…' : ''}</p>

              {post.tags.length > 0 && (
                <div className="admin-post-tags">
                  <Tag size={11} />
                  {post.tags.map((t) => <span key={t} className="admin-post-tag-chip">#{t}</span>)}
                </div>
              )}
            </div>

            {post.imageDataUrl && (
              <div className="admin-post-thumb-wrap">
                <img src={post.imageDataUrl} alt="Attached" className="admin-post-thumb" />
              </div>
            )}

            <div className="admin-post-actions">
              <button
                type="button"
                className={`btn-admin-toggle ${post.isActive ? 'btn-toggle-off' : 'btn-toggle-on'}`}
                onClick={() => onToggle(post.id)}
                title={post.isActive ? 'Hide from public' : 'Show to public'}
              >
                {post.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                {post.isActive ? 'Hide' : 'Publish'}
              </button>
              <button
                type="button"
                className="btn-admin-edit"
                onClick={() => onEdit(post)}
              >
                <Edit3 size={14} /> Edit
              </button>
              <button
                type="button"
                className="btn-admin-delete"
                onClick={() => {
                  if (window.confirm(`Delete "${post.title}"? This cannot be undone.`)) {
                    onDelete(post.id);
                  }
                }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

// ── Main Admin Portal ─────────────────────────────────────────────────
type AdminView = 'dashboard' | 'new-post' | 'manage' | 'public-data';

export const AdminPortal: React.FC = () => {
  const [session, setSession] = useState(getAdminSession());
  const [view, setView] = useState<AdminView>('dashboard');
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [editingPost, setEditingPost] = useState<AdminPost | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load posts
  useEffect(() => {
    if (session.isLoggedIn) {
      setPosts(getAllPosts());
    }
  }, [session.isLoggedIn]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleLogin = (u: string, p: string) => {
    const ok = loginAdmin(u, p);
    if (ok) setSession(getAdminSession());
    return ok;
  };

  const handleLogout = () => {
    logoutAdmin();
    setSession({ isLoggedIn: false, username: '' });
    setView('dashboard');
  };

  const handleSavePost = (post: AdminPost) => {
    savePost(post);
    setPosts(getAllPosts());
    setEditingPost(null);
    setView('manage');
    showSuccess(editingPost ? '✅ Bulletin updated successfully!' : '✅ Bulletin published to public feed!');
  };

  const handleDelete = (id: string) => {
    deletePost(id);
    setPosts(getAllPosts());
    showSuccess('🗑️ Bulletin deleted.');
  };

  const handleToggle = (id: string) => {
    togglePostActive(id);
    setPosts(getAllPosts());
  };

  const handleEdit = (post: AdminPost) => {
    setEditingPost(post);
    setView('new-post');
  };

  const handleImportPublicData = (item: PublicDataItem) => {
    const newPost = createPost({
      title: item.title,
      category: item.category,
      severity: item.severity,
      location: item.location || 'India',
      state: 'National',
      description: item.summary,
      source: item.source.toLowerCase().includes('ndma') ? 'ndma'
        : item.source.toLowerCase().includes('imd') ? 'imd'
        : item.source.toLowerCase().includes('pib') ? 'pib'
        : 'public',
      sourceUrl: item.sourceUrl,
      author: session.username || 'Admin',
      tags: [item.category, item.severity.toLowerCase()],
    });
    savePost(newPost);
    setPosts(getAllPosts());
    showSuccess(`✅ "${item.title.slice(0, 50)}…" imported and published!`);
  };

  // Stats
  const livePosts = posts.filter((p) => p.isActive).length;
  const criticalPosts = posts.filter((p) => p.severity === 'CRITICAL' && p.isActive).length;
  const totalPosts = posts.length;

  if (!session.isLoggedIn) {
    return <AdminLoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="admin-portal-wrap">
      {/* Success Toast */}
      {successMsg && (
        <div className="admin-success-toast">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* Admin Sidebar Nav */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <Shield size={22} className="admin-brand-icon" />
          <div>
            <span className="admin-brand-name">DisasterAdmin</span>
            <span className="admin-brand-role">Control Panel</span>
          </div>
        </div>

        <div className="admin-user-info">
          <div className="admin-user-avatar">
            <User size={20} />
          </div>
          <div>
            <span className="admin-user-name">{session.username}</span>
            <span className="admin-user-role">Administrator</span>
          </div>
        </div>

        <nav className="admin-nav">
          {[
            { id: 'dashboard', icon: <Flame size={16} />, label: 'Dashboard' },
            { id: 'new-post', icon: <Plus size={16} />, label: 'New Bulletin' },
            { id: 'manage', icon: <Newspaper size={16} />, label: 'Manage Posts' },
            { id: 'public-data', icon: <Globe size={16} />, label: 'Public Data Feed' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-nav-btn ${view === item.id && !(item.id === 'new-post' && editingPost) ? 'active' : ''}`}
              onClick={() => {
                setView(item.id as AdminView);
                if (item.id !== 'new-post') setEditingPost(null);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button type="button" className="admin-logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Admin Main Content */}
      <main className="admin-main-content">
        {/* Dashboard */}
        {view === 'dashboard' && (
          <div className="admin-dashboard">
            <div className="admin-page-header">
              <h2 className="admin-page-title">
                <Flame size={22} /> Dashboard
              </h2>
              <span className="admin-live-chip">
                <span className="live-dot-pulse" /> LIVE SYSTEM
              </span>
            </div>

            {/* Stats Cards */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card stat-total">
                <div className="admin-stat-icon"><Newspaper size={24} /></div>
                <div className="admin-stat-info">
                  <span className="admin-stat-num">{totalPosts}</span>
                  <span className="admin-stat-label">Total Bulletins</span>
                </div>
              </div>
              <div className="admin-stat-card stat-live">
                <div className="admin-stat-icon"><Eye size={24} /></div>
                <div className="admin-stat-info">
                  <span className="admin-stat-num">{livePosts}</span>
                  <span className="admin-stat-label">Live / Published</span>
                </div>
              </div>
              <div className="admin-stat-card stat-critical">
                <div className="admin-stat-icon"><AlertTriangle size={24} /></div>
                <div className="admin-stat-info">
                  <span className="admin-stat-num">{criticalPosts}</span>
                  <span className="admin-stat-label">Critical Alerts</span>
                </div>
              </div>
              <div className="admin-stat-card stat-info">
                <div className="admin-stat-icon"><Info size={24} /></div>
                <div className="admin-stat-info">
                  <span className="admin-stat-num">{posts.filter((p) => !p.isActive).length}</span>
                  <span className="admin-stat-label">Hidden / Draft</span>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="admin-quick-actions">
              <button
                type="button"
                className="btn-admin-quick"
                onClick={() => { setEditingPost(null); setView('new-post'); }}
              >
                <Plus size={18} /> Create New Bulletin
              </button>
              <button
                type="button"
                className="btn-admin-quick btn-admin-quick-secondary"
                onClick={() => setView('public-data')}
              >
                <Globe size={18} /> Import Public Data
              </button>
              <button
                type="button"
                className="btn-admin-quick btn-admin-quick-secondary"
                onClick={() => setView('manage')}
              >
                <Newspaper size={18} /> Manage All Posts
              </button>
            </div>

            {/* Recent posts preview */}
            <div className="admin-section-header" style={{ marginTop: '1.5rem' }}>
              <div className="admin-section-title">
                <Clock size={16} /> Recent Bulletins
              </div>
            </div>
            {posts.slice(0, 4).map((post) => {
              const cfg = SEVERITY_CONFIG[post.severity];
              return (
                <div
                  key={post.id}
                  className="admin-recent-post"
                  style={{ borderLeft: `4px solid ${cfg.border}` }}
                >
                  <div className="admin-recent-post-left">
                    <span style={{ fontSize: '18px' }}>{CATEGORY_ICONS[post.category]}</span>
                    <div>
                      <span className="admin-recent-title">{post.title}</span>
                      <span className="admin-recent-meta">
                        {post.location} · {new Date(post.publishedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <SeverityBadge severity={post.severity} />
                    <span className={`admin-post-status ${post.isActive ? 'status-live' : 'status-hidden'}`}>
                      {post.isActive ? '● Live' : '○ Hidden'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* New / Edit Post Form */}
        {view === 'new-post' && (
          <div>
            <div className="admin-page-header">
              <h2 className="admin-page-title">
                {editingPost ? <><Edit3 size={22} /> Edit Bulletin</> : <><Plus size={22} /> New Bulletin</>}
              </h2>
            </div>
            <PostForm
              initial={editingPost || undefined}
              onSave={handleSavePost}
              onCancel={() => { setView('manage'); setEditingPost(null); }}
            />
          </div>
        )}

        {/* Manage Posts */}
        {view === 'manage' && (
          <div>
            <div className="admin-page-header">
              <h2 className="admin-page-title"><Newspaper size={22} /> Manage Bulletins</h2>
              <button
                type="button"
                className="btn-admin-new-inline"
                onClick={() => { setEditingPost(null); setView('new-post'); }}
              >
                <Plus size={15} /> New
              </button>
            </div>
            <PostsManager
              posts={posts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          </div>
        )}

        {/* Public Data Feed */}
        {view === 'public-data' && (
          <div>
            <div className="admin-page-header">
              <h2 className="admin-page-title"><Globe size={22} /> Public Data Feed</h2>
            </div>
            <PublicDataImporter onImport={handleImportPublicData} />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPortal;
