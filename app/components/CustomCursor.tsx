"use client";

import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [laggingPos, setLaggingPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    // Add listeners for hover states on interactables
    const addHoverListeners = () => {
      const interactables = document.querySelectorAll('a, button, input, select');
      interactables.forEach(el => {
        el.addEventListener('mouseenter', () => setIsHovering(true));
        el.addEventListener('mouseleave', () => setIsHovering(false));
      });
    };
    
    addHoverListeners();
    // Re-bind when DOM changes
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      observer.disconnect();
    };
  }, [isVisible]);

  // Animation loop for the lagging ring
  useEffect(() => {
    let animationFrameId: number;
    
    const updateLaggingPos = () => {
      setLaggingPos(prev => {
        const dx = position.x - prev.x;
        const dy = position.y - prev.y;
        // Ease factor 0.15 makes it lag slightly
        return {
          x: prev.x + dx * 0.15,
          y: prev.y + dy * 0.15
        };
      });
      animationFrameId = requestAnimationFrame(updateLaggingPos);
    };
    
    animationFrameId = requestAnimationFrame(updateLaggingPos);
    return () => cancelAnimationFrame(animationFrameId);
  }, [position]);

  if (!isVisible) return null;

  return (
    <div style={{ pointerEvents: 'none', zIndex: 9999, position: 'fixed', inset: 0 }}>
      {/* Small dot */}
      <div 
        style={{
          position: 'absolute',
          width: 8,
          height: 8,
          backgroundColor: '#FFF',
          borderRadius: '50%',
          transform: `translate(${position.x - 4}px, ${position.y - 4}px)`,
          willChange: 'transform'
        }}
      />
      {/* Lagging ring */}
      <div 
        style={{
          position: 'absolute',
          width: isHovering ? 48 : 32,
          height: isHovering ? 48 : 32,
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: '50%',
          transform: `translate(${laggingPos.x - (isHovering ? 24 : 16)}px, ${laggingPos.y - (isHovering ? 24 : 16)}px)`,
          transition: 'width 0.2s, height 0.2s',
          willChange: 'transform, width, height',
          backgroundColor: isHovering ? 'rgba(255,255,255,0.05)' : 'transparent'
        }}
      />
    </div>
  );
}
