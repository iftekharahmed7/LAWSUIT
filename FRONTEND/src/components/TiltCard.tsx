import { useRef, useState, type CSSProperties, type ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees at the card's edge. Default 10. */
  maxTilt?: number;
  /** Scale applied on hover. Default 1.02 (subtle lift). */
  scale?: number;
}

const RESET_TRANSFORM = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
const RESET_TRANSITION = "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)";

export default function TiltCard({ children, className = "", maxTilt = 10, scale = 1.02 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState(RESET_TRANSFORM);
  const [transition, setTransition] = useState(RESET_TRANSITION);
  const [glare, setGlare] = useState<CSSProperties>({ opacity: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * 2 * maxTilt;
    const rotateX = (0.5 - py) * 2 * maxTilt;

    setTransform(
      `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`
    );
    setTransition("transform 0.06s linear");
    setGlare({
      opacity: 1,
      background: `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.35), transparent 55%)`,
    });
  }

  function handleMouseLeave() {
    setTransform(RESET_TRANSFORM);
    setTransition(RESET_TRANSITION);
    setGlare({ opacity: 0, transition: "opacity 0.4s ease" });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative [transform-style:preserve-3d] will-change-transform ${className}`}
      style={{ transform, transition }}
    >
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={glare}
      />
    </div>
  );
}
