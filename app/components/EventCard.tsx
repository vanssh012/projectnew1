"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastProvider";

interface EventCardProps {
  id: string | number;
  title: string;
  date: string;
  location: string;
  hostInitial: string;
  hostName: string;
  category: "farewell" | "freshers" | "house_party";
  spots: number;
  price: string;
}

export default function EventCard({
  id,
  title,
  date,
  location,
  hostInitial,
  hostName,
  category,
  spots,
  price,
}: EventCardProps) {
  const router = useRouter();
  const { showToast } = useToast();

  let bg = "#1E1A0E";
  let symbol = "✦";
  let badgeText = "Farewell";

  if (category === "freshers") {
    bg = "#0E1A1E";
    symbol = "◈";
    badgeText = "Freshers";
  } else if (category === "house_party") {
    bg = "#1A0E1E";
    symbol = "◉";
    badgeText = "House Party";
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/events/${id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this event on Afterly — ${title}`,
          url: url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      showToast("link copied to clipboard");
    }
  };

  return (
    <div className="event-card" onClick={() => router.push(`/events/${id}`)}>
      <div className="card-img" style={{ background: bg }}>
        <span className="card-symbol">{symbol}</span>
        <span className="card-badge">{badgeText}</span>
        
        {/* SHARE BUTTON */}
        <button className="share-btn" onClick={handleShare}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
          </svg>
        </button>

        <div className="card-gradient">
          <div className="card-title-overlay">{title}</div>
        </div>
      </div>
      <div className="card-body">
        <div className="card-meta">
          {date} · {location}
        </div>
        <div className="card-host">
          <div className="card-host-avatar">{hostInitial}</div>
          <span className="card-host-name">hosted by {hostName}</span>
          <span className="card-verified-dot" />
        </div>
        <div className="card-bottom">
          <div className="card-price">{price}</div>
          <div className="card-spots">{spots} spots left</div>
        </div>
      </div>

      <style>{`
        .event-card {
          background: #111;
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          cursor: pointer;
        }
        .event-card:hover {
          transform: translateY(-6px);
          border-color: rgba(255,255,255,0.15);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .card-img {
          height: 200px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-symbol {
          font-size: 64px;
          opacity: 0.1;
        }
        .card-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #FFF;
          color: #000;
          font-size: 10px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 100px;
          text-transform: uppercase;
        }
        .share-btn {
          position: absolute;
          top: 12px;
          right: 90px;
          background: rgba(255,255,255,0.06);
          border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 100px;
          padding: 8px 10px;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          z-index: 10;
        }
        .share-btn:hover {
          background: rgba(255,255,255,0.1);
          color: #FFF;
        }
        .card-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%);
          display: flex;
          align-items: flex-end;
          padding: 16px;
        }
        .card-title-overlay {
          color: #FFF;
          font-size: 16px;
          font-weight: 500;
          letter-spacing: -0.3px;
        }
        .card-body {
          padding: 16px;
        }
        .card-meta {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.3px;
          margin-bottom: 12px;
        }
        .card-host {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }
        .card-host-avatar {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          color: rgba(255,255,255,0.6);
        }
        .card-host-name {
          font-size: 12px;
          color: rgba(255,255,255,0.6);
        }
        .card-verified-dot {
          width: 4px;
          height: 4px;
          background: #C9A050;
          border-radius: 50%;
        }
        .card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 0.5px solid rgba(255,255,255,0.06);
        }
        .card-price {
          color: #FFF;
          font-weight: 500;
          font-size: 14px;
        }
        .card-spots {
          background: rgba(255,255,255,0.06);
          border-radius: 100px;
          padding: 4px 10px;
          font-size: 11px;
          color: rgba(255,255,255,0.7);
        }
      `}</style>
    </div>
  );
}
