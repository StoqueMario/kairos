import { useEffect, useRef } from 'react'
import HeroEnvelope from '../HeroEnvelope'
import FloatingFlowers from '../FloatingFlowers'
import { gsap } from '../../lib/gsap'

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-name-giant', {
        y: 200,
        opacity: 0,
        duration: 1.6,
        ease: 'power4.out',
        delay: 0.4,
      })
      gsap.to('.hero-name-giant', {
        yPercent: -40,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section className="section hero-section-v2" ref={ref}>
      <FloatingFlowers count={18} />
      <HeroEnvelope />
      <div className="hero-name-giant" aria-hidden>yasmin</div>
    </section>
  )
}
