import React, { useRef, useState, useEffect } from 'react';

interface Card3DProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  depth?: 'sm' | 'md' | 'lg';
  glare?: boolean;
}

export const Card3D: React.FC<Card3DProps> = ({
  children,
  className = '',
  depth = 'md',
  glare = true,
  onClick,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');
  const [glareStyle, setGlareStyle] = useState({ opacity: 0, x: '50%', y: '50%' });
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    // Only enable mouse parallax tilt on devices with precision mouse/pointer (laptops & PCs)
    // On Android phones and tablets, disable mousemove tilt to ensure smooth touch scrolling
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(hover: hover) and (pointer: fine)');
      setCanHover(media.matches);

      const listener = (e: MediaQueryListEvent) => setCanHover(e.matches);
      if (media.addEventListener) {
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
      }
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canHover || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const maxRotation = depth === 'lg' ? 6 : depth === 'md' ? 4 : 2.5;
    const rotateX = ((centerY - y) / centerY) * maxRotation;
    const rotateY = ((x - centerX) / centerX) * maxRotation;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-3px) scale3d(1.01, 1.01, 1.01)`);
    
    if (glare) {
      setGlareStyle({
        opacity: 0.16,
        x: `${(x / rect.width) * 100}%`,
        y: `${(y / rect.height) * 100}%`
      });
    }
  };

  const handleMouseLeave = () => {
    if (!canHover) return;
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)');
    setGlareStyle(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: canHover ? transform : undefined,
        transformStyle: 'preserve-3d',
        transition: transform ? 'transform 0.12s ease-out' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      className={`card-3d relative overflow-hidden max-w-full touch-manipulation active:scale-[0.985] active:translate-y-0.5 transition-transform ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {glare && canHover && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
          style={{
            opacity: glareStyle.opacity,
            background: `radial-gradient(circle 250px at ${glareStyle.x} ${glareStyle.y}, rgba(255, 255, 255, 0.75), transparent 70%)`
          }}
        />
      )}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
