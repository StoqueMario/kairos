import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'

const FLOWERS = ['🌸', '🌺', '🌷', '🌼', '🌻', '💐', '🪻', '🌹', '🪷']

interface Props {
  count?: number
  scope?: 'section' | 'fixed'
  scrollParallax?: boolean
  /** elemento que dispara as flores ao entrar/sair do viewport */
  triggerSelector?: string
}

export default function FloatingFlowers({
  count = 14,
  scope = 'section',
  scrollParallax = true,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wrap.current
    if (!el) return

    const items = Array.from(el.querySelectorAll<HTMLSpanElement>('.flower'))

    items.forEach((f) => {
      const x = gsap.utils.random(0, 100)
      const y = gsap.utils.random(0, 100)
      const scale = gsap.utils.random(0.6, 1.6)
      const rot = gsap.utils.random(-30, 30)

      gsap.set(f, {
        left: `${x}%`,
        top: `${y}%`,
        scale,
        rotation: rot,
        opacity: 0,
      })

      gsap.to(f, {
        opacity: gsap.utils.random(0.4, 0.85),
        duration: 1.4,
        delay: gsap.utils.random(0, 1.2),
        ease: 'power2.out',
      })

      // Flutuação infinita
      gsap.to(f, {
        y: `+=${gsap.utils.random(-30, 30)}`,
        x: `+=${gsap.utils.random(-20, 20)}`,
        rotation: `+=${gsap.utils.random(-25, 25)}`,
        duration: gsap.utils.random(6, 12),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })

      if (scrollParallax) {
        gsap.to(f, {
          yPercent: gsap.utils.random(-80, 80),
          ease: 'none',
          scrollTrigger: {
            trigger: el.parentElement || el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === (el.parentElement || el)) t.kill()
      })
    }
  }, [scrollParallax])

  return (
    <div
      ref={wrap}
      className={`flowers-layer ${scope === 'fixed' ? 'is-fixed' : ''}`}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="flower">
          {FLOWERS[i % FLOWERS.length]}
        </span>
      ))}
    </div>
  )
}
