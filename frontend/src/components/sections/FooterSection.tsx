import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'

export default function FooterSection() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.from('.footer-portrait', {
        scale: 0.94,
        opacity: 0,
        duration: 1.4,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 70%' },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section className="section footer-section" ref={ref}>
      <figure className="footer-portrait">
        <img src="/foto-nos.jpeg" alt="Nós" loading="lazy" />
        <figcaption className="footer-quote">
          “Esqueça-me quando eu te esquecer, assim nunca me esquecerás.”
        </figcaption>
      </figure>
    </section>
  )
}
