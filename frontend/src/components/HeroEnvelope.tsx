import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from '../lib/gsap'
import './HeroEnvelope.css'

// Data de início do namoro
const START_DATE = new Date('2025-01-29T00:00:00')

function getDaysTogeather() {
  const now = new Date()
  const diff = now.getTime() - START_DATE.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// URL da foto do casal — configurar via env ou default placeholder
const COUPLE_PHOTO = import.meta.env.VITE_COUPLE_PHOTO || null

export default function HeroEnvelope() {
  const [opened, setOpened] = useState(false)
  const [days, setDays] = useState(getDaysTogeather())
  const sectionRef = useRef<HTMLElement>(null)

  // Atualiza o contador todo dia
  useEffect(() => {
    const timer = setInterval(() => setDays(getDaysTogeather()), 60_000)
    return () => clearInterval(timer)
  }, [])

  // Parallax: envelope flutua pra cima e esmaece ao rolar
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.envelope-wrapper', {
        y: -70,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      })
      gsap.to('.hero-eyebrow, .hero-title', {
        y: -40,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '60% top',
          scrub: 1,
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="hero-section" ref={sectionRef}>
      {/* Decorações de folha */}
      <div className="hero-leaf hero-leaf--tl" aria-hidden />
      <div className="hero-leaf hero-leaf--br" aria-hidden />

      <div className="hero-inner">
        <motion.p
          className="hero-eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          uma carta pra você
        </motion.p>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          Yasmin
        </motion.h1>

        {/* Envelope */}
        <motion.div
          className={`envelope-wrapper ${opened ? 'envelope-wrapper--opened' : ''}`}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div
            className={`envelope ${opened ? 'envelope--open' : ''}`}
            onClick={() => !opened && setOpened(true)}
            role="button"
            tabIndex={0}
            aria-label="Abrir carta"
            onKeyDown={(e) => e.key === 'Enter' && setOpened(true)}
          >
            {/* Corpo do envelope */}
            <div className="envelope-body">
              {/* Aba inferior */}
              <div className="envelope-flap envelope-flap--bottom" />
              {/* Abas laterais */}
              <div className="envelope-flap envelope-flap--left" />
              <div className="envelope-flap envelope-flap--right" />
              {/* Aba superior (que abre) */}
              <div className="envelope-flap envelope-flap--top" />

              {/* Lacre */}
              {!opened && (
                <div className="envelope-seal">
                  <span className="envelope-seal-letter">K</span>
                </div>
              )}

              {/* Hint de clique */}
              {!opened && (
                <motion.p
                  className="envelope-hint"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  clique para abrir
                </motion.p>
              )}
            </div>
          </div>

          {/* Carta que sai do envelope */}
          <AnimatePresence>
            {opened && (
              <motion.div
                className="letter-card"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: -30, opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
              >
                {/* Foto do casal */}
                <div className="letter-photo-frame">
                  {COUPLE_PHOTO ? (
                    <img src={COUPLE_PHOTO} alt="Nós duas" className="letter-photo" />
                  ) : (
                    <div className="letter-photo-placeholder">
                      <span>📸</span>
                      <p>nossa foto aqui</p>
                    </div>
                  )}
                </div>

                {/* Contador */}
                <div className="letter-counter">
                  <CounterNumber value={days} />
                  <p className="letter-counter-label">dias juntas</p>
                </div>

                <p className="letter-since">desde 29 de janeiro de 2025 💚</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {!opened && (
          <motion.p
            className="hero-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            Este é o nosso cantinho.<br />Um lugar só nosso.
          </motion.p>
        )}
      </div>
    </section>
  )
}

// Animação dos dígitos do contador
function CounterNumber({ value }: { value: number }) {
  const digits = String(value).split('')
  return (
    <div className="counter-number">
      {digits.map((d, i) => (
        <motion.span
          key={`${i}-${d}`}
          className="counter-digit"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 + i * 0.08, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {d}
        </motion.span>
      ))}
    </div>
  )
}
