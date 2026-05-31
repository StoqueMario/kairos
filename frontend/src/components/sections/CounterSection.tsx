import { useEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap'
import { heroMosaic } from '../../data/placeholderPhotos'
import FloatingFlowers from '../FloatingFlowers'

const START_DATE = new Date('2025-01-29T00:00:00')

export default function CounterSection() {
  const ref = useRef<HTMLElement>(null)
  const [days, setDays] = useState(0)

  useEffect(() => {
    const calc = () =>
      Math.floor((Date.now() - START_DATE.getTime()) / 86_400_000)
    setDays(calc())
    const id = setInterval(() => setDays(calc()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      // Counter aparece com brilho
      gsap.from('.counter-num', {
        scale: 0.6,
        opacity: 0,
        filter: 'blur(20px)',
        duration: 1.2,
        ease: 'power4.out',
        scrollTrigger: { trigger: ref.current, start: 'top 70%' },
      })

      // Mosaico — cada foto entra em sequência com parallax leve
      gsap.utils.toArray<HTMLElement>('.mosaic-tile').forEach((tile, i) => {
        gsap.from(tile, {
          y: 80,
          opacity: 0,
          rotation: gsap.utils.random(-6, 6),
          duration: 1,
          delay: i * 0.04,
          ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 60%' },
        })
        gsap.to(tile, {
          yPercent: gsap.utils.random(-20, 20),
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section className="section counter-section" ref={ref}>
      <FloatingFlowers count={8} />

      <div className="counter-stack">
        <p className="counter-label">já são</p>
        <div className="counter-num text-glow">{days}</div>
        <p className="counter-sub">dias com você</p>
      </div>

      <div className="mosaic-grid" aria-hidden>
        {heroMosaic.map((p, i) => (
          <div key={i} className="mosaic-tile">
            <img src={p.src} alt={p.alt} loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  )
}
