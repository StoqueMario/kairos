import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from '../../lib/gsap'
import { featurePreviewPhotos } from '../../data/placeholderPhotos'

interface F { to: string; title: string; sub: string; emoji: string; key: keyof typeof featurePreviewPhotos }

const FEATURES: F[] = [
  { to: '/cartas',       title: 'Cartas',       sub: 'palavras pra você ler quando precisar', emoji: '💌', key: 'cartas' },
  { to: '/album',        title: 'Álbum',        sub: 'cada momento congelado em luz',          emoji: '📸', key: 'album' },
  { to: '/timeline',     title: 'Linha do tempo', sub: 'a história que estamos escrevendo',    emoji: '🕰️', key: 'timeline' },
  { to: '/lugares',      title: 'Lugares',      sub: 'mapas que viramos casa',                 emoji: '🗺️', key: 'lugares' },
  { to: '/restaurantes', title: 'Restaurantes', sub: 'sabores que dividimos',                  emoji: '🍽️', key: 'restaurantes' },
  { to: '/filmes',       title: 'Filmes',       sub: 'sessões só nossas',                      emoji: '🎬', key: 'filmes' },
  { to: '/playlist',     title: 'Playlist',     sub: 'a trilha sonora do que somos',           emoji: '🎵', key: 'playlist' },
  { to: '/desejos',      title: 'Desejos',      sub: 'o que ainda quero com você',             emoji: '⭐', key: 'desejos' },
  { to: '/metas',        title: 'Metas',        sub: 'os planos que fazemos a dois',           emoji: '🎯', key: 'metas' },
]

export default function FeaturesHorizontalSection() {
  const wrap = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const w = wrap.current
    const t = track.current
    if (!w || !t) return
    const mm = gsap.matchMedia()

    mm.add('(min-width: 761px) and (prefers-reduced-motion: no-preference)', () => {
      const totalScroll = () => t.scrollWidth - window.innerWidth + 80
      gsap.to(t, {
        x: () => -totalScroll(),
        ease: 'none',
        scrollTrigger: {
          trigger: w,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: () => `+=${totalScroll()}`,
          invalidateOnRefresh: true,
        },
      })
      gsap.utils.toArray<HTMLElement>('.feat-card').forEach((card) => {
        gsap.from(card, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'left 90%' },
        })
      })
    })

    return () => mm.revert()
  }, [])

  return (
    <section className="section features-h" ref={wrap}>
      <header className="features-h-head">
        <p className="features-h-eyebrow">o que vive aqui</p>
        <h2 className="features-h-title">tudo nosso, em um lugar.</h2>
      </header>

      <div className="features-h-track" ref={track}>
        {FEATURES.map((f) => (
          <Link key={f.to} to={f.to} className="feat-card glass-card">
            <div className="feat-card-img">
              <img src={featurePreviewPhotos[f.key]} alt="" loading="lazy" />
              <span className="feat-card-emoji">{f.emoji}</span>
            </div>
            <div className="feat-card-body">
              <h3>{f.title}</h3>
              <p>{f.sub}</p>
              <span className="feat-card-cta">explorar →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
