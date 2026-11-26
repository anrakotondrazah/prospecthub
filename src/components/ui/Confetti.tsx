'use client'

import { useEffect, useState } from 'react'

interface ConfettiProps {
  onComplete?: () => void
  duration?: number
}

export function Confetti({ onComplete, duration = 2000 }: ConfettiProps) {
  const [particles] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 0.5,
      color: ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EC4899'][Math.floor(Math.random() * 5)]
    }))
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onComplete])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full animate-confetti-fall"
          style={{
            left: `${particle.left}%`,
            top: '-10px',
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti-fall {
          animation: confetti-fall forwards;
        }
      `}</style>
    </div>
  )
}
