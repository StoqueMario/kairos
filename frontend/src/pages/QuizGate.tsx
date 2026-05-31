import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuthStore } from '../store/auth'
import './QuizGate.css'

interface Question {
  id: string
  text: string
  options: string[]
}

const LOCAL_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'Qual foi a data que eu te pedi em namoro?',
    options: ['28/01/2026', '29/01/2026', '30/01/2026'],
  },
  {
    id: 'q2',
    text: 'Quais são os dois personagens de animação que você desenhou para mim?',
    options: ['Mickey e Minnie', 'Shrek e Fiona', 'A Bela e a Fera'],
  },
  {
    id: 'q3',
    text: 'Qual é o nome que você escreveu na sacola que desenhou junto com esses personagens?',
    options: ['Kairós', 'Amor', 'Saudade'],
  }
]

export default function QuizGate() {
  const navigate = useNavigate()
  const setToken = useAuthStore((s) => s.setToken)

  const [step, setStep] = useState<'intro' | 'quiz' | 'prize'>('intro')
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (option: string) => {
    if (selected) return
    setSelected(option)

    setTimeout(() => {
      if (current < LOCAL_QUESTIONS.length - 1) {
        setCurrent((c) => c + 1)
        setSelected(null)
      } else {
        setStep('prize')
      }
    }, 800)
  }

  const handleEnter = () => {
    api
      .post('/admin/quiz/bypass', {}, {
        headers: { 'X-Admin-Password': import.meta.env.VITE_ADMIN_PASSWORD },
      })
      .then((r) => { 
        setToken(r.data.token)
        navigate('/') 
      })
      .catch((e) => {
        console.error(e)
        // Se falhar o bypass por algum motivo (ex: senha errada no env)
        alert('Erro ao liberar acesso. Verifique a senha do admin.')
      })
  }

  const q = LOCAL_QUESTIONS[current]
  const progress = ((current) / LOCAL_QUESTIONS.length) * 100

  return (
    <div className="quiz-root">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="quiz-video-bg"
        src="/fundo-inicial.mp4"
      />
      <div className="video-scrim" aria-hidden />
      {/* Flores decorativas espalhadas */}
      {['🌸','🌺','🌼','🌸','🌷','🌻','🌸','🌺','🌼','🌷','🌸','🌻'].map((f, i) => (
        <span key={i} className={`quiz-flower quiz-flower--${i + 1}`}>{f}</span>
      ))}

      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            className="quiz-card"
            initial={{ opacity: 0, y: 32, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div className="quiz-intro-leaf">🪼</div>
            <p className="quiz-eyebrow">bem-vinda ao </p>
            <h1 className="quiz-title">Kairós</h1>
            <p className="quiz-subtitle">
              Este lugar foi feito especialmente pra você.<br />
              Mas primeiro… você precisa provar que me conhece.
            </p>
            <p className="quiz-hint">3 perguntinhas (e um prêmio no final) 💚</p>
            <motion.button
              className="quiz-btn-primary"
              onClick={() => setStep('quiz')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Começar o desafio
            </motion.button>
          </motion.div>
        )}

        {step === 'quiz' && q && (
          <motion.div
            key={`q-${current}`}
            className="quiz-card"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {/* Progress */}
            <div className="quiz-progress-bar">
              <motion.div
                className="quiz-progress-fill"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>

            <p className="quiz-counter">{current + 1} de {LOCAL_QUESTIONS.length}</p>
            <h2 className="quiz-question">{q.text}</h2>

            <div className="quiz-options">
              {q.options.map((opt) => (
                <motion.button
                  key={opt}
                  className={`quiz-option ${selected === opt ? 'quiz-option--selected' : ''} ${selected && selected !== opt ? 'quiz-option--faded' : ''}`}
                  onClick={() => handleSelect(opt)}
                  whileHover={!selected ? { x: 6 } : {}}
                  whileTap={!selected ? { scale: 0.98 } : {}}
                >
                  <span className="quiz-option-dot" />
                  {opt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'prize' && (
          <motion.div
            key="prize"
            className="quiz-prize-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Fundo com a imagem do presente */}
            <div className="quiz-prize-bg" />

            {/* Overlay escuro gradiente */}
            <div className="quiz-prize-overlay" />

            {/* Partículas de celebração */}
            {['🎮','⛏️','🌿','💎','🧱','⭐','🎮','💚','🎮','⛏️'].map((e, i) => (
              <span key={i} className={`quiz-prize-particle quiz-prize-particle--${i + 1}`}>{e}</span>
            ))}

            {/* Conteúdo central */}
            <div className="quiz-prize-content">
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="quiz-prize-badge"
              >
                🎮
              </motion.div>

              <motion.p
                className="quiz-prize-eyebrow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                parabéns, você provou que me conhece
              </motion.p>

              <motion.h1
                className="quiz-prize-title"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.6 }}
              >
                Você ganhou<br />
                <span className="quiz-prize-highlight">Minecraft</span>!
              </motion.h1>

              <motion.p
                className="quiz-prize-sub"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.5 }}
              >
                Mesmo que você tenha errado alguma, eu vou fingir que acertou tudo<br />só pra te dar esse presente 😂💚
              </motion.p>

              <motion.button
                className="quiz-prize-btn"
                onClick={handleEnter}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
              >
                Entrar no Kairós →
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
