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
            className="quiz-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'backOut' }}
          >
            <div className="quiz-error-icon" style={{filter: 'none'}}>🎮</div>
            <h2 className="quiz-title" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Você ganhou!</h2>
            <p className="quiz-subtitle" style={{ fontSize: '1.2rem', marginBottom: '24px' }}>
              Mesmo que você tenha errado alguma, eu vou fingir que você acertou só pra te dar o presente 😂💚
            </p>
            <p className="quiz-hint" style={{ fontSize: '1.4rem' }}>
              Seu prêmio é o <strong>Minecraft</strong>!
            </p>
            
            <p className="quiz-subtitle" style={{ marginTop: '30px', fontWeight: 'bold' }}>
              Bem-vinda ao Kairós.
            </p>
            <motion.button
              className="quiz-btn-primary"
              onClick={handleEnter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Entrar
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
