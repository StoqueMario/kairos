import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const haloRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    document.body.classList.add('has-custom-cursor')

    const dot = dotRef.current!
    const halo = haloRef.current!
    gsap.set([dot, halo], { xPercent: -50, yPercent: -50, opacity: 0 })

    const xToD = gsap.quickTo(dot, 'x', { duration: 0.18, ease: 'power3' })
    const yToD = gsap.quickTo(dot, 'y', { duration: 0.18, ease: 'power3' })
    const xToH = gsap.quickTo(halo, 'x', { duration: 0.55, ease: 'power3' })
    const yToH = gsap.quickTo(halo, 'y', { duration: 0.55, ease: 'power3' })

    let revealed = false
    const onMove = (e: MouseEvent) => {
      if (!revealed) {
        gsap.to([dot, halo], { opacity: 1, duration: 0.4 })
        revealed = true
      }
      xToD(e.clientX); yToD(e.clientY)
      xToH(e.clientX); yToH(e.clientY)
    }

    const isInteractive = (el: Element | null) =>
      !!el?.closest('a, button, [role="button"], input, textarea, select, label')

    const onOver = (e: MouseEvent) => {
      if (isInteractive(e.target as Element)) {
        gsap.to(halo, { scale: 2.2, duration: 0.4, ease: 'power2.out' })
        gsap.to(dot, { scale: 0, duration: 0.3 })
      } else {
        gsap.to(halo, { scale: 1, duration: 0.4, ease: 'power2.out' })
        gsap.to(dot, { scale: 1, duration: 0.3 })
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      document.body.classList.remove('has-custom-cursor')
    }
  }, [])

  return (
    <>
      <div ref={haloRef} className="cursor-halo" aria-hidden />
      <div ref={dotRef} className="cursor-dot" aria-hidden />
    </>
  )
}
