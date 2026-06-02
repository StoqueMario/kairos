import { useEffect, useRef, useMemo } from 'react'
import { gsap } from '../lib/gsap'

const FLOWERS = ['🌸', '🌺', '🌷', '🌼', '🌻', '💐', '🪻', '🌹', '🪷']

interface Props {
  count?: number
  scope?: 'section' | 'fixed'
  scrollParallax?: boolean
  triggerSelector?: string
}

export default function FloatingFlowers({
  count = 14,
  scope = 'section',
  scrollParallax = true,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null)

  // Gera dados estáveis de posição e escala no mount para evitar saltos ou novos valores em re-renders
  const flowersData = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      char: FLOWERS[i % FLOWERS.length],
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      scale: 0.6 + Math.random() * 1.0, // 0.6 a 1.6
      rotation: -30 + Math.random() * 60, // -30deg a 30deg
      delay: Math.random() * 1.2,
      floatDuration: 6 + Math.random() * 6, // 6s a 12s
      floatX: -20 + Math.random() * 40,
      floatY: -30 + Math.random() * 60,
      floatRot: -25 + Math.random() * 50,
    }))
  }, [count])

  useEffect(() => {
    const el = wrap.current
    if (!el) return

    const ctx = gsap.context(() => {
      const items = Array.from(el.querySelectorAll<HTMLSpanElement>('.flower'))

      items.forEach((f, i) => {
        const data = flowersData[i]
        if (!data) return

        // Aparecimento suave inicial
        gsap.to(f, {
          opacity: 0.4 + Math.random() * 0.45,
          duration: 1.4,
          delay: data.delay,
          ease: 'power2.out',
        })

        // Flutuação infinita
        gsap.to(f, {
          y: `+=${data.floatY}`,
          x: `+=${data.floatX}`,
          rotation: `+=${data.floatRot}`,
          duration: data.floatDuration,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      })

      // Parallax de scroll aplicado diretamente no container pai,
      // evitando criar 40+ ScrollTriggers individuais concorrentes.
      if (scrollParallax && scope !== 'fixed') {
        gsap.to(el, {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: el.parentElement || el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      }
    }, wrap)

    return () => ctx.revert()
  }, [flowersData, scrollParallax, scope])

  return (
    <div
      ref={wrap}
      className={`flowers-layer ${scope === 'fixed' ? 'is-fixed' : ''}`}
      aria-hidden
    >
      {flowersData.map((f, i) => (
        <span
          key={i}
          className="flower"
          style={{
            left: f.left,
            top: f.top,
            transform: `scale(${f.scale}) rotate(${f.rotation}deg)`,
            opacity: 0, // Inicia invisível no HTML para prevenir FOUC
          }}
        >
          {f.char}
        </span>
      ))}
    </div>
  )
}
