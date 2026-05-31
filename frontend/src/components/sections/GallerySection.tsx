import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'
import { galleryScattered } from '../../data/placeholderPhotos'

export default function GallerySection() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.gal-item').forEach((el) => {
        const speed = parseFloat(el.dataset.speed || '0')
        gsap.to(el, {
          yPercent: speed * 30,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
        gsap.from(el, {
          opacity: 0,
          y: 60,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%' },
        })
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section className="section gallery-section" ref={ref}>
      <header className="gallery-head">
        <p className="eyebrow">um pedacinho</p>
        <h2 className="section-title">do que <span className="accent">a gente vive</span>.</h2>
      </header>

      <div className="gallery-scatter">
        {galleryScattered.map((p, i) => (
          <figure
            key={i}
            className={`gal-item gal-item--${i % 4}`}
            data-speed={(i % 3) - 1}
          >
            <img src={p.src} alt={p.alt} loading="lazy" />
            {p.caption && <figcaption>{p.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  )
}
