"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  stagger?: boolean;
}

export default function ScrollReveal({ children, stagger = false }: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = containerRef.current?.querySelectorAll('.fade-section');
    elements?.forEach((el, index) => {
      if (stagger) {
        (el as HTMLElement).style.transitionDelay = `${index * 0.1}s`;
      }
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [stagger]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}
