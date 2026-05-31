import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { useThemeStore } from '../store/theme'
import ThemeToggle from './ThemeToggle'
import MenuDrawer from './MenuDrawer'
import './ShellLayout.css'

export default function ShellLayout() {
  const [open, setOpen] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)
  const setTheme = useThemeStore((s) => s.set)
  const theme = useThemeStore((s) => s.theme)

  // Aplica tema na primeira renderização (caso o persist não tenha rehidratado)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme, setTheme])

  // Lenis smooth scroll integrado com ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    const ticker = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(ticker)
    gsap.ticker.lagSmoothing(0)
    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      gsap.ticker.remove(ticker)
      lenis.destroy()
    }
  }, [])

  // Barra de progresso de leitura
  useEffect(() => {
    if (!barRef.current) return
    const st = ScrollTrigger.create({
      start: 'top top',
      end: 'max',
      onUpdate: (self) => gsap.set(barRef.current, { scaleX: self.progress }),
    })
    return () => st.kill()
  }, [])

  return (
    <div className="shell-root">
      <div className="aurora-bg" aria-hidden />
      <div className="noise-overlay" aria-hidden />
      <div className="scroll-progress" ref={barRef} />

      <header className="shell-floating">
        <ThemeToggle />
        <button
          type="button"
          className="menu-trigger glass-button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu size={20} />
          <span>menu</span>
        </button>
      </header>

      <main className="shell-main">
        <Outlet />
      </main>

      <MenuDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
