import { useRef, useState } from "react";

interface BannerCropperProps {
  imageUrl: string;
  positionX: number;
  positionY: number;
  zoom: number;
  onChange: (pos: { x: number; y: number; zoom: number }) => void;
}

export function BannerCropper({ imageUrl, positionX, positionY, zoom, onChange }: BannerCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const clamp = (v: number) => Math.min(100, Math.max(0, v));

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !lastPos.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - lastPos.current.x) / rect.width) * 100;
    const dy = ((e.clientY - lastPos.current.y) / rect.height) * 100;
    lastPos.current = { x: e.clientX, y: e.clientY };
    onChange({ x: clamp(positionX - dx), y: clamp(positionY - dy), zoom });
  };

  const onPointerUp = () => {
    setDragging(false);
    lastPos.current = null;
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      className="relative h-40 w-full cursor-move overflow-hidden rounded-2xl border border-border bg-background touch-none select-none"
    >
      <img
        src={imageUrl}
        alt=""
        draggable={false}
        className="absolute h-full w-full object-cover"
        style={{
          objectPosition: `${positionX}% ${positionY}%`,
          transform: `scale(${zoom})`,
          transformOrigin: `${positionX}% ${positionY}%`,
        }}
      />
    </div>
  );
}