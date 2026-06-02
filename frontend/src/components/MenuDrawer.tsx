import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { gsap } from '../lib/gsap'

interface Item { to: string;  label: string }

const items: Item[] = [
  { to: '/',             label: 'Início' },
  { to: '/cartas',       label: 'Cartas' },
  { to: '/album',        label: 'Álbum' },
  { to: '/timeline',     label: 'Linha do tempo' },
  { to: '/lugares',      label: 'Lugares' },
  { to: '/restaurantes', label: 'Restaurantes' },
  { to: '/filmes',       label: 'Filmes' },
  { to: '/playlist',     label: 'Playlist' },
  { to: '/desejos',      label: 'Desejos' },
  { to: '/metas',        label: 'Metas' },
]

export default function MenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    if (open) {
      document.body.style.overflow = 'hidden'
      gsap.set(root, { display: 'flex', autoAlpha: 0 })
      const tl = gsap.timeline()
      tl.to(root, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' })
        .from(root.querySelectorAll('.drawer-link'), {
          y: 60, opacity: 0, duration: 0.55, stagger: 0.05, ease: 'power3.out',
        }, '-=0.1')
    } else {
      document.body.style.overflow = ''
      gsap.to(root, {
        autoAlpha: 0, duration: 0.3, ease: 'power2.in',
        onComplete: () => gsap.set(root, { display: 'none' }),
      })
    }

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div ref={rootRef} className="drawer-root" style={{ display: 'none' }} role="dialog" aria-modal>
      <button className="drawer-close glass-button" onClick={onClose} aria-label="Fechar menu">
        <X size={22} />
      </button>

      <nav className="drawer-nav">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === '/'}
            onClick={onClose}
            className={({ isActive }) => `drawer-link ${isActive ? 'is-active' : ''}`}
          >
            <span className="drawer-label">{it.label}</span>
          </NavLink>
        ))}
      </nav>

    </div>
  )
}
