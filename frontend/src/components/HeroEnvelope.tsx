import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { gsap } from '../lib/gsap'
import './HeroEnvelope.css'

// Data de início do namoro
const START_DATE = new Date('2026-01-29T00:00:00')

function getDaysTogeather() {
  const now = new Date()
  const diff = now.getTime() - START_DATE.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// URL da foto do casal — configurar via env ou usar a foto padrão do repo
const COUPLE_PHOTO = import.meta.env.VITE_COUPLE_PHOTO || '/foto-inicial-carta.jpeg'

// Data formatada por extenso (pt-BR), derivada de START_DATE — fonte única
const START_DATE_LABEL = START_DATE.toLocaleDateString('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

interface Props {
  onOpened?: () => void
}

export default function HeroEnvelope({ onOpened }: Props) {
  const [opened, setOpened] = useState(false)
  const [showLetter, setShowLetter] = useState(false)
  const [days, setDays] = useState(getDaysTogeather())
  const sectionRef = useRef<HTMLElement>(null)

  // Bloqueia o scroll até a carta ser aberta ou enquanto o modal da carta estiver aberto
  useEffect(() => {
    if (!opened || showLetter) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [opened, showLetter])

  const handleOpen = () => {
    if (opened) return
    setOpened(true)
    onOpened?.()
  }

  // Atualiza o contador todo dia
  useEffect(() => {
    const timer = setInterval(() => setDays(getDaysTogeather()), 60_000)
    return () => clearInterval(timer)
  }, [])

  // Parallax: envelope flutua pra cima e esmaece ao rolar (só após abrir)
  useEffect(() => {
    if (!opened) return
    const ctx = gsap.context(() => {
      gsap.to('.envelope-parallax-wrapper', {
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
      gsap.to('.hero-header-parallax-wrapper', {
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
  }, [opened])

  return (
    <section className="hero-section" ref={sectionRef}>
      {/* Decorações de folha */}
      <div className="hero-leaf hero-leaf--tl" aria-hidden />
      <div className="hero-leaf hero-leaf--br" aria-hidden />

      <div className="hero-inner">
        <div className="hero-header-parallax-wrapper">
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
        </div>

        {/* Envelope */}
        <div className="envelope-parallax-wrapper">
          <motion.div
            className={`envelope-wrapper ${opened ? 'envelope-wrapper--opened' : ''}`}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div
            className={`envelope ${opened ? 'envelope--open' : ''}`}
            onClick={handleOpen}
            role="button"
            tabIndex={0}
            aria-label="Abrir carta"
            onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
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

          {/* Carta que sai do envelope — wrapper centraliza no meio do envelope/seção */}
          <div className="letter-card-center">
          <AnimatePresence>
            {opened && (
              <motion.div
                className="letter-card"
                initial={{ y: 24, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 24, opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => setShowLetter(true)}
                transition={{ delay: 0.35, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
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

                {/* Lado direito: contador + desde + botão */}
                <div className="letter-card-info">
                  {/* Contador */}
                  <div className="letter-counter">
                    <CounterNumber value={days} />
                    <p className="letter-counter-label">dias juntas</p>
                  </div>

                  <p className="letter-since">desde {START_DATE_LABEL} 💚</p>

                  {/* Dica para abrir a carta escrita */}
                  <div className="letter-read-badge">
                    <span>clique para ler a carta ✍️</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </motion.div>
        </div>

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

      {/* Modal da Carta Escrita */}
      <AnimatePresence>
        {showLetter && (
          <motion.div
            className="letter-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLetter(false)}
          >
            <motion.div
              className="letter-modal-paper"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="letter-modal-close"
                onClick={() => setShowLetter(false)}
                aria-label="Fechar carta"
              >
                <X size={20} />
              </button>

              <div className="letter-modal-content">
                {/* Foto do casal no topo da carta (polaroid) */}
                <div className="letter-modal-photo">
                  <img src={COUPLE_PHOTO} alt="Nós" />
                  <span className="letter-modal-photo-caption">eu & você 💚</span>
                </div>

                <p className="letter-modal-date">
                  {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                
                <h2 className="letter-modal-greeting">Minha querida Yasmin,</h2>
                
                <div className="letter-modal-body">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
                    porttitor magna eu ante sollicitudin vulputate. Cras dictum arcu
                    non nisi lacinia, tristique semper tortor finibus.
                  </p>
                  <p>
                    Donec finibus, mi sed finibus eleifend, lectus magna sodales ligula,
                    a congue ligula lectus a nunc. In a pretium purus. Sed molestie
                    ligula eget sem luctus, sed porta est molestie.
                  </p>
                  <p>
                    Curabitur imperdiet, urna eget vestibulum maximus, justo purus
                    aliquet magna, nec dictum mi diam in augue. Vivamus non sem et diam
                    laoreet hendrerit id vitae leo.
                  </p>
                  <p>
                    Quisque et purus vel sapien commodo sodales a eget eros. Duis
                    consequat metus nibh, in tincidunt dui dictum non. Mauris feugiat
                    ante nec tellus accumsan pulvinar.
                  </p>
                </div>

                <p className="letter-modal-signature">
                  Com todo o meu amor,
                  <br />
                  <span className="signature-name">K. 💚</span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
