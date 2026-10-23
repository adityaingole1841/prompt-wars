import React, { useState, useEffect } from 'react';
import { Newspaper, Clock, Map, Tag, AlertTriangle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { getPublicPosts, SEVERITY_CONFIG, CATEGORY_ICONS } from '../utils/adminStore';
import { AdminPost, DisasterSeverity } from '../types/admin';

const SeverityIcon: Record<DisasterSeverity, string> = {
  CRITICAL: '🔴',
  WARNING: '🟠',
  WATCH: '🟡',
  INFO: 'ℹ️',
};

const BulletinCard: React.FC<{ post: AdminPost }> = ({ post }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[post.severity];
  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <article
      className="bulletin-card"
      style={{ borderLeft: `5px solid ${cfg.border}` }}
      aria-label={`Disaster bulletin: ${post.title}`}
    >
      {/* Header */}
      <div className="bulletin-header">
        <div className="bulletin-badges">
          <span
            className="bulletin-severity-badge"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
          >
            {SeverityIcon[post.severity]} {post.severity}
          </span>
          <span className="bulletin-category-badge">
            {CATEGORY_ICONS[post.category]} {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
          </span>
          {post.source !== 'admin' && (
            <span className="bulletin-source-chip">📡 {post.source.toUpperCase()}</span>
          )}
        </div>
        <span className="bulletin-time">
          <Clock size={12} /> {timeAgo(post.publishedAt)}
        </span>
      </div>

      {/* Title */}
      <h3 className="bulletin-title">{post.title}</h3>

      {/* Location */}
      <div className="bulletin-location">
        <Map size={13} />
        <span>{post.location}, {post.state}</span>
      </div>

      {/* Image (if any) */}
      {post.imageDataUrl && (
        <div className="bulletin-image-wrap">
          <img src={post.imageDataUrl} alt={post.title} className="bulletin-image" loading="lazy" />
        </div>
      )}

      {/* Description — collapsible */}
      <div className={`bulletin-desc ${expanded ? 'expanded' : ''}`}>
        {expanded ? post.description : post.description.slice(0, 220) + (post.description.length > 220 ? '…' : '')}
      </div>

      {post.description.length > 220 && (
        <button
          type="button"
          className="bulletin-expand-btn"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Read more</>}
        </button>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="bulletin-tags">
          <Tag size={11} />
          {post.tags.map((t) => (
            <span key={t} className="bulletin-tag">#{t}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="bulletin-footer">
        <span className="bulletin-author">
          Published by <strong>{post.author}</strong>
        </span>
        {post.sourceUrl && (
          <a
            href={post.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bulletin-source-link"
          >
            <ExternalLink size={12} /> View Source
          </a>
        )}
      </div>
    </article>
  );
};

export const DisasterBulletinBoard: React.FC = () => {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [filter, setFilter] = useState<DisasterSeverity | 'ALL'>('ALL');

  useEffect(() => {
    const load = () => setPosts(getPublicPosts());
    load();
    // Refresh every 60s in case admin publishes something
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === 'ALL' ? posts : posts.filter((p) => p.severity === filter);

  if (posts.length === 0) return null;

  const hasCritical = posts.some((p) => p.severity === 'CRITICAL');

  return (
    <section className="bulletin-board-section" aria-label="Disaster Bulletin Board">
      {/* Section Header */}
      <div className="bulletin-board-header">
        <div className="bulletin-board-title-row">
          <div className="bulletin-title-group">
            {hasCritical && <span className="bulletin-critical-pulse" />}
            <Newspaper size={20} />
            <h2 className="bulletin-board-heading">Official Disaster Bulletins</h2>
            <span className="bulletin-count-chip">{posts.length}</span>
          </div>
          <span className="bulletin-admin-tag">
            <AlertTriangle size={12} /> Admin Verified
          </span>
        </div>

        {/* Severity Filter */}
        <div className="bulletin-filter-row">
          {(['ALL', 'CRITICAL', 'WARNING', 'WATCH', 'INFO'] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`bulletin-filter-btn ${filter === s ? 'active' : ''} ${s !== 'ALL' ? `filter-${s.toLowerCase()}` : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'ALL' ? '📋 All' : `${SeverityIcon[s]} ${s}`}
              {s !== 'ALL' && (
                <span className="bulletin-filter-count">
                  {posts.filter((p) => p.severity === s).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bulletin Cards */}
      {filtered.length === 0 ? (
        <div className="bulletin-no-results">No bulletins found for selected severity level.</div>
      ) : (
        <div className="bulletin-cards-grid">
          {filtered.map((post) => (
            <BulletinCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
};

export default DisasterBulletinBoard;
