'use client'

type LoaderProps = {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

const SIZES = {
  sm: '24px',
  md: '35px',
  lg: '50px',
}

export function Loader({ size = 'md', color = '#5D3FD3', className = '' }: LoaderProps) {
  const sizeValue = SIZES[size]

  return (
    <div
      className={`three-body ${className}`}
      style={{
        '--uib-size': sizeValue,
        '--uib-speed': '0.8s',
        '--uib-color': color,
      } as React.CSSProperties}
    >
      <div className="three-body__dot" />
      <div className="three-body__dot" />
      <div className="three-body__dot" />

      <style jsx>{`
        .three-body {
          position: relative;
          display: inline-block;
          height: var(--uib-size);
          width: var(--uib-size);
          animation: spin78236 calc(var(--uib-speed) * 2.5) infinite linear;
        }

        .three-body__dot {
          position: absolute;
          height: 100%;
          width: 30%;
        }

        .three-body__dot:after {
          content: '';
          position: absolute;
          height: 0%;
          width: 100%;
          padding-bottom: 100%;
          background-color: var(--uib-color);
          border-radius: 50%;
        }

        .three-body__dot:nth-child(1) {
          bottom: 5%;
          left: 0;
          transform: rotate(60deg);
          transform-origin: 50% 85%;
        }

        .three-body__dot:nth-child(1)::after {
          bottom: 0;
          left: 0;
          animation: wobble1 var(--uib-speed) infinite ease-in-out;
          animation-delay: calc(var(--uib-speed) * -0.3);
        }

        .three-body__dot:nth-child(2) {
          bottom: 5%;
          right: 0;
          transform: rotate(-60deg);
          transform-origin: 50% 85%;
        }

        .three-body__dot:nth-child(2)::after {
          bottom: 0;
          left: 0;
          animation: wobble1 var(--uib-speed) infinite calc(var(--uib-speed) * -0.15) ease-in-out;
        }

        .three-body__dot:nth-child(3) {
          bottom: -5%;
          left: 0;
          transform: translateX(116.666%);
        }

        .three-body__dot:nth-child(3)::after {
          top: 0;
          left: 0;
          animation: wobble2 var(--uib-speed) infinite ease-in-out;
        }

        @keyframes spin78236 {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes wobble1 {
          0%,
          100% {
            transform: translateY(0%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-66%) scale(0.65);
            opacity: 0.8;
          }
        }

        @keyframes wobble2 {
          0%,
          100% {
            transform: translateY(0%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(66%) scale(0.65);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-live="polite">
      <div className="text-center">
        <Loader size="lg" />
        <span className="sr-only">Chargement...</span>
      </div>
    </div>
  )
}

export function InlineLoader({ text = 'Chargement...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Loader size="sm" />
      <span className="text-sm text-[#4E525A] dark:text-[#8B949E]">{text}</span>
    </div>
  )
}

export function ButtonLoader({ className = '' }: { className?: string }) {
  return (
    <Loader size="sm" color="currentColor" className={className} />
  )
}
