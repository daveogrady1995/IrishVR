import { useEffect, useRef, useState } from 'react';
import { input } from '@/game/input';

export function Joystick() {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const center = useRef({ x: 0, y: 0 });
  const maxRadius = 48;

  useEffect(() => {
    const base = baseRef.current;
    if (!base) return;

    const update = (clientX: number, clientY: number) => {
      let dx = clientX - center.current.x;
      let dy = clientY - center.current.y;
      const dist = Math.hypot(dx, dy);
      if (dist > maxRadius) {
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
      }
      if (knobRef.current) {
        knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
      }
      input.joystick.x = dx / maxRadius;
      input.joystick.y = -dy / maxRadius;
    };

    const start = (clientX: number, clientY: number) => {
      const rect = base.getBoundingClientRect();
      center.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      setActive(true);
      input.joystick.active = true;
      update(clientX, clientY);
    };

    const end = () => {
      setActive(false);
      input.joystick.active = false;
      input.joystick.x = 0;
      input.joystick.y = 0;
      if (knobRef.current) knobRef.current.style.transform = 'translate(0, 0)';
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      start(t.clientX, t.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!input.joystick.active) return;
      e.preventDefault();
      const t = e.touches[0];
      update(t.clientX, t.clientY);
    };
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      end();
    };
    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      start(e.clientX, e.clientY);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!input.joystick.active) return;
      e.preventDefault();
      update(e.clientX, e.clientY);
    };
    const onMouseUp = () => end();

    base.addEventListener('touchstart', onTouchStart, { passive: false });
    base.addEventListener('touchmove', onTouchMove, { passive: false });
    base.addEventListener('touchend', onTouchEnd, { passive: false });
    base.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      base.removeEventListener('touchstart', onTouchStart);
      base.removeEventListener('touchmove', onTouchMove);
      base.removeEventListener('touchend', onTouchEnd);
      base.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div
      ref={baseRef}
      className={`pointer-events-auto relative h-32 w-32 rounded-full border-2 transition-all duration-200 ${
        active
          ? 'border-primary-300 bg-primary-500/15 scale-105'
          : 'border-white/25 bg-white/8'
      }`}
      style={{ backdropFilter: 'blur(6px)' }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Move
        </span>
      </div>
      <div
        ref={knobRef}
        className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 shadow-lg transition-transform"
        style={{ transition: active ? 'none' : 'transform 0.15s ease-out' }}
      />
    </div>
  );
}
