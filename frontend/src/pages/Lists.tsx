import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { gsap } from '../lib/gsap'
import api from '../lib/api'
import PageHeader from '../components/PageHeader'
import '../components/PageHeader.css'
import '../pages/features.css'

interface Desejo { id: string; text: string; completed: boolean; category: string; added_by: string }
interface Meta { id: string; title: string; description: string; progress: number; completed: boolean; deadline: string; emoji: string }

const categories = ['viagem', 'presente', 'experiência', 'outro']

// ── Desejos ───────────────────────────────────────────────────────────────────

export function Desejos() {
  const qc = useQueryClient()
  const [text, setText] = useState('')
  const [category, setCategory] = useState('outro')
  const [addedBy, setAddedBy] = useState('eu')

  const { data: desejos = [] } = useQuery<Desejo[]>({
    queryKey: ['desejos'],
    queryFn: () => api.get('/desejos').then((r) => r.data),
  })

  const add = useMutation({
    mutationFn: () => api.post('/desejos', { text, category, added_by: addedBy }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['desejos'] }); setText('') },
    onError: () => toast.error('Erro ao adicionar'),
  })

  const toggle = useMutation({
    mutationFn: (d: Desejo) => api.put(`/desejos/${d.id}`, { ...d, completed: !d.completed }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['desejos'] }),
  })

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/desejos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['desejos'] }),
  })

  const done = desejos.filter((d) => d.completed)
  const todo = desejos.filter((d) => !d.completed)

  return (
    <div className="page-wrapper">
      <PageHeader emoji="⭐" title="Lista de Desejos" subtitle="Tudo que queremos ter ou fazer" />

      <div className="list-container">
        {/* Adicionar */}
        <div className="add-row">
          <input className="form-input" placeholder="Adicionar desejo…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && text && add.mutate()} />
          <select className="form-input" style={{ width: 'auto' }} value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className="form-input" style={{ width: 'auto' }} value={addedBy} onChange={(e) => setAddedBy(e.target.value)}>
            <option value="eu">Eu</option>
            <option value="yasmin">Yasmin</option>
          </select>
          <button className="btn-primary" onClick={() => text && add.mutate()}>+</button>
        </div>

        {/* Pendentes */}
        <div className="list-section">
          {todo.map((d, i) => (
            <motion.div key={d.id} className="list-item" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} layout>
              <button className="list-check" onClick={() => toggle.mutate(d)} aria-label="Marcar" />
              <span className="list-text">{d.text}</span>
              <span className="list-tag">{d.category}</span>
              <button className="list-del" onClick={() => del.mutate(d.id)}><X size={12} /></button>
            </motion.div>
          ))}
        </div>

        {/* Completos */}
        {done.length > 0 && (
          <>
            <p className="list-divider">Realizados ✨</p>
            <div className="list-section list-section--done">
              {done.map((d) => (
                <motion.div key={d.id} className="list-item list-item--done" layout>
                  <button className="list-check list-check--done" onClick={() => toggle.mutate(d)} aria-label="Desmarcar">
                    <Check size={10} />
                  </button>
                  <span className="list-text">{d.text}</span>
                  <button className="list-del" onClick={() => del.mutate(d.id)}><X size={12} /></button>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {desejos.length === 0 && <div className="empty-state"><span>⭐</span><p>Lista vazia.<br />O que vocês querem?</p></div>}
      </div>
    </div>
  )
}

// ── Metas ─────────────────────────────────────────────────────────────────────

export function Metas() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', deadline: '', emoji: '🎯' })

  const { data: metas = [] } = useQuery<Meta[]>({
    queryKey: ['metas'],
    queryFn: () => api.get('/metas').then((r) => r.data),
  })

  const add = useMutation({
    mutationFn: () => api.post('/metas', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['metas'] }); setShowForm(false); setForm({ title: '', description: '', deadline: '', emoji: '🎯' }) },
  })

  const updateProgress = useMutation({
    mutationFn: ({ id, progress, completed }: { id: string; progress: number; completed: boolean }) =>
      api.put(`/metas/${id}`, { progress, completed }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['metas'] }),
  })

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/metas/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['metas'] }),
  })

  // Progress bars animam de 0% ao valor real quando o card entra na viewport
  useEffect(() => {
    if (!metas.length) return
    const ctx = gsap.context(() => {
      document.querySelectorAll<HTMLElement>('.meta-card').forEach((card) => {
        const fill = card.querySelector<HTMLElement>('.meta-bar-fill')
        if (!fill) return
        const target = +(fill.dataset.progress ?? 0)
        gsap.fromTo(
          fill,
          { width: '0%' },
          {
            width: `${target}%`,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              once: true,
            },
          },
        )
      })
    })
    return () => ctx.revert()
  }, [metas])

  return (
    <div className="page-wrapper">
      <PageHeader emoji="🎯" title="Metas" subtitle="Onde queremos chegar juntas" action={{ label: '+ Meta', onClick: () => setShowForm(true) }} />

      <div className="list-container">
        {metas.map((m, i) => (
          <motion.div key={m.id} className="meta-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} layout>
            <div className="meta-header">
              <span className="meta-emoji">{m.emoji}</span>
              <div className="meta-info">
                <p className="meta-title">{m.title}</p>
                {m.description && <p className="meta-desc">{m.description}</p>}
                {m.deadline && <p className="meta-deadline">até {m.deadline}</p>}
              </div>
              <button className="list-del" onClick={() => del.mutate(m.id)}><X size={14} /></button>
            </div>
            <div className="meta-progress-row">
              <div className="meta-bar">
                <div className="meta-bar-fill" data-progress={m.progress} />
              </div>
              <span className="meta-pct">{m.progress}%</span>
            </div>
            <div className="meta-actions">
              {[0, 25, 50, 75, 100].map((p) => (
                <button key={p} className={`meta-pct-btn ${m.progress === p ? 'meta-pct-btn--active' : ''}`}
                  onClick={() => updateProgress.mutate({ id: m.id, progress: p, completed: p === 100 })}>
                  {p === 100 ? '✓' : `${p}%`}
                </button>
              ))}
            </div>
          </motion.div>
        ))}

        {metas.length === 0 && <div className="empty-state"><span>🎯</span><p>Nenhuma meta ainda.</p></div>}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="modal-backdrop" onClick={() => setShowForm(false)}>
            <motion.div className="modal-box" initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }} onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowForm(false)}><X size={18} /></button>
              <h3 className="modal-title">Nova Meta</h3>
              <div className="form-stack">
                <input className="form-input" placeholder="Emoji (ex: 🏡)" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} style={{ width: 80 }} />
                <input className="form-input" placeholder="Título da meta" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <textarea className="form-input form-textarea" placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <input className="form-input" type="date" placeholder="Prazo (opcional)" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                <button className="btn-primary" onClick={() => form.title && add.mutate()}>Criar meta</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
