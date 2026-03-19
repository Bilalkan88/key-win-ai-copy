import React, { useState, useRef } from 'react';
import { Search } from 'lucide-react';

export function ZoomableImage({ src, alt, className = "" }) {
    const [isHovered, setIsHovered] = useState(false);
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const containerRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;

        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;

        setPosition({ x, y });
    };

    return (
        <div
            className={`relative overflow-hidden cursor-zoom-in group ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
            ref={containerRef}
            style={{ width: '100%', height: '100%' }} // Ensure full size in parent
        >
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-contain transition-transform duration-200 ease-out"
                style={{
                    transformOrigin: `${position.x}% ${position.y}%`,
                    transform: isHovered ? 'scale(2.5)' : 'scale(1)',
                }}
            />

            {/* Simple hint overlay that disappears on hover/zoom */}
            {!isHovered && (
                <div className="absolute bottom-2 right-2 bg-black/50 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <Search className="w-4 h-4" />
                </div>
            )}
        </div>
    );
}
