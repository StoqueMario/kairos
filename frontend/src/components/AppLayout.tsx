import { useEffect, useRef } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Heart, BookOpen, Image, Star, Target, MapPin, Utensils, Clock, Film, Music } from 'lucide-react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import './AppLayout.css'

const navItems = [
  { to: '/',            icon: Heart,     label: 'Início' },
  { to: '/cartas',      icon: BookOpen,  label: 'Cartas' },
  { to: '/album',       icon: Image,     label: 'Álbum' },
  { to: '/desejos',     icon: Star,      label: 'Desejos' },
  { to: '/metas',       icon: Target,    label: 'Metas' },
  { to: '/lugares',     icon: MapPin,    label: 'Lugares' },
  { to: '/restaurantes',icon: Utensils,  label: 'Restaurantes' },
  { to: '/timeline',    icon: Clock,     label: 'Linha do Tempo' },
  { to: '/filmes',      icon: Film,      label: 'Filmes' },
  { to: '/playlist',    icon: Music,     label: 'Playlist' },
]

export default function AppLayout() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: 'top top',
        end: 'max',
        onUpdate: (self) => {
          gsap.set(barRef.current, { scaleX: self.progress })
        },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="app-layout">
      <div className="scroll-progress-bar" ref={barRef} />
      {/* Sidebar desktop */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">🌿</span>
          <span className="sidebar-brand-name">Kairos</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <p className="sidebar-footer">feito com 💚</p>
      </aside>

      {/* Conteúdo */}
      <main className="app-main">
        <Outlet />
      </main>

      {/* Bottom nav mobile */}
      <nav className="bottom-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}`
            }
          >
            <Icon size={20} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
