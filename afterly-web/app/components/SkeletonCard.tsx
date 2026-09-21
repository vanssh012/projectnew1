export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card-image" />
      <div className="skeleton-card-body">
        <div className="skeleton-line skeleton-line-title" />
        <div className="skeleton-line skeleton-line-meta" />
      </div>
      <style>{`
        .skeleton-card {
          background: #111;
          border: 0.5px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          overflow: hidden;
        }
        .skeleton-card-image, .skeleton-line {
          background: linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%);
          background-size: 200% 100%;
          animation: skeletonShimmer 1.5s infinite;
        }
        .skeleton-card-image { height: 180px; }
        .skeleton-card-body { padding: 16px 18px; }
        .skeleton-line { height: 16px; border-radius: 8px; margin-bottom: 10px; }
        .skeleton-line-title { width: 70%; }
        .skeleton-line-meta { width: 45%; height: 12px; border-radius: 6px; animation-delay: 0.2s; }
        @keyframes skeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}