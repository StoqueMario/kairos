import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { gsap } from '../lib/gsap'
import './HeroEnvelope.css'

interface Props {
  onOpened?: () => void
}

export default function HeroEnvelope({ onOpened }: Props) {
  const [opened, setOpened] = useState(false)
  const [showLetter, setShowLetter] = useState(false)
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
    if (!opened) {
      setOpened(true)
      onOpened?.()
    }
    setShowLetter(true)
  }

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

          {/* Carta intermedi\u00e1ria removida \u2014 clique no envelope abre direto o modal */}
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
                  <img src="/img1.jpg" alt="Nós" />
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
