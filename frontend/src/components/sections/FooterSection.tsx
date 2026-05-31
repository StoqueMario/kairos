import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from '../../lib/gsap'
import FloatingFlowers from '../FloatingFlowers'

export default function FooterSection() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.from('.footer-message', {
        scale: 0.9,
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
      <FloatingFlowers count={20} />
      <div className="footer-message text-glow">
        <p className="footer-line-1">feito com</p>
        <p className="footer-heart">💚</p>
        <p className="footer-line-2">pra Yasmin</p>
      </div>
      <div className="footer-cta">
        <Link to="/cartas" className="btn-primary">ler uma carta agora</Link>
      </div>
      <p className="footer-tag">— sempre, kairos</p>
    </section>
  )
}
