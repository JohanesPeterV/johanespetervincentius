"use client";

import { useConfig } from "@/hooks/use-config";
import { useEffect, useRef } from "react";

interface SnapScrollContainerProps {
  children: React.ReactNode[];
  className?: string;
}

export default function SnapScrollContainer({
  children,
  className,
}: SnapScrollContainerProps) {
  const [, setConfig] = useConfig();
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-index"));
          if (entry.isIntersecting) {
            setConfig((prev) => ({ ...prev, scrollSectionIndex: index }));
          }
        });
      },
      {
        root: null,
        threshold: 0.5,
      }
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sectionRefs.current.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, [setConfig]);

  return (
    <div
      className={`${className} h-screen w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide`}
    >
      {children.map((child, index) => (
        <div
          key={index}
          ref={(el) => {
            sectionRefs.current[index] = el;
          }}
          data-index={index}
          className="h-screen w-full snap-center flex items-center justify-center"
        >
          {child}
        </div>
      ))}
    </div>
  );
}
