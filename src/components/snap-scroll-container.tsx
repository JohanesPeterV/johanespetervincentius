"use client";

interface SnapScrollContainerProps {
  children: React.ReactNode[];
}

export default function SnapScrollContainer({
  children,
}: SnapScrollContainerProps) {
  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
      {children.map((child, index) => (
        <div
          key={index}
          className="h-screen w-full snap-center flex items-center justify-center"
        >
          {child}
        </div>
      ))}
    </div>
  );
}
