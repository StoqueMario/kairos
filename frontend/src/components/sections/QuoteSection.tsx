import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'

export default function QuoteSection() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.quote-line',
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          ease: 'none',
          stagger: 0.15,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 75%',
            end: 'top 20%',
            scrub: 1,
          },
        },
      )
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section className="section quote-section" ref={ref}>
      <blockquote>
        <span className="quote-mark">&ldquo;</span>
        <p className="quote-line">kairos &mdash; o momento</p>
        <p className="quote-line">certo, o tempo</p>
        <p className="quote-line accent">perfeito.</p>
        <span className="quote-mark closing">&rdquo;</span>
      </blockquote>
    </section>
  )
}
