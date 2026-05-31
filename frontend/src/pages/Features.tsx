import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, ExternalLink } from 'lucide-react'
import { gsap } from '../lib/gsap'
import api from '../lib/api'
import PageHeader from '../components/PageHeader'
import '../components/PageHeader.css'

interface Lugar { id: string; name: string; description: string; country: string; city: string; visited: boolean; visited_at: string; wish_level: number; image_url: string }
interface Restaurante { id: string; name: string; cuisine: string; city: string; address: string; visited: boolean; rating: number; notes: string; maps_url: string; image_url: string }
interface Filme { id: string; title: string; year: number; status: string; rating: number; notes: string; poster_url: string; stream_on: string }
interface PlaylistItem { id: string; title: string; artist: string; spotify_url: string; youtube_url: string; meaning: string; added_by: string }

// ── Lugares ───────────────────────────────────────────────────────────────────

export function Lugares() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', country: '', city: '', wish_level: 3 })

  const { data: lugares = [] } = useQuery<Lugar[]>({ queryKey: ['lugares'], queryFn: () => api.get('/lugares').then((r) => r.data) })

  const add = useMutation({
    mutationFn: () => api.post('/lugares', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lugares'] }); setShowForm(false) },
  })

  const toggleVisited = useMutation({
    mutationFn: (l: Lugar) => api.put(`/lugares/${l.id}`, { ...l, visited: !l.visited, visited_at: !l.visited ? new Date().toISOString().slice(0, 10) : '' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lugares'] }),
  })

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/lugares/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lugares'] }),
  })

  const todo = lugares.filter((l) => !l.visited)
  const done = lugares.filter((l) => l.visited)

  return (
    <div className="page-wrapper">
      <PageHeader emoji="🗺️" title="Lugares" subtitle="Onde queremos ir" action={{ label: '+ Lugar', onClick: () => setShowForm(true) }} />

      <div className="list-container">
        {todo.map((l, i) => (
          <motion.div key={l.id} className="place-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} layout>
            <div className="place-content">
              <div>
                <p className="place-name">{l.name}</p>
                <p className="place-location">{[l.city, l.country].filter(Boolean).join(', ')}</p>
                {l.description && <p className="place-desc">{l.description}</p>}
              </div>
              <div className="place-actions">
                <div className="wish-stars">
                  {[1,2,3,4,5].map((s) => <Star key={s} size={14} fill={s <= l.wish_level ? 'var(--amber-400)' : 'none'} color={s <= l.wish_level ? 'var(--amber-400)' : 'var(--color-border)'} />)}
                </div>
                <button className="btn-ghost" style={{ fontSize: '.75rem', padding: '4px 12px' }} onClick={() => toggleVisited.mutate(l)}>já fui ✓</button>
                <button className="list-del" onClick={() => del.mutate(l.id)}><X size={14} /></button>
              </div>
            </div>
          </motion.div>
        ))}

        {done.length > 0 && (
          <>
            <p className="list-divider">Lugares visitados ✓</p>
            {done.map((l) => (
              <div key={l.id} className="place-card place-card--done" style={{ opacity: .7 }}>
                <div className="place-content">
                  <div>
                    <p className="place-name">{l.name} <span style={{ color: 'var(--green-500)', fontSize: '.8em' }}>✓</span></p>
                    <p className="place-location">{[l.city, l.country].filter(Boolean).join(', ')}</p>
                  </div>
                  <button className="list-del" onClick={() => del.mutate(l.id)}><X size={14} /></button>
                </div>
              </div>
            ))}
          </>
        )}

        {lugares.length === 0 && <div className="empty-state"><span>🗺️</span><p>Nenhum lugar na lista ainda.</p></div>}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="modal-backdrop" onClick={() => setShowForm(false)}>
            <motion.div className="modal-box" initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }} onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowForm(false)}><X size={18} /></button>
              <h3 className="modal-title">Novo Lugar</h3>
              <div className="form-stack">
                <input className="form-input" placeholder="Nome do lugar" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <div className="form-row">
                  <input className="form-input" placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  <input className="form-input" placeholder="País" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                </div>
                <textarea className="form-input form-textarea" placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <label style={{ fontSize: '.875rem', color: 'var(--ink-muted)' }}>
                  Nível de desejo: {form.wish_level}/5
                  <input type="range" min={1} max={5} value={form.wish_level} onChange={(e) => setForm({ ...form, wish_level: +e.target.value })} style={{ width: '100%', marginTop: 4 }} />
                </label>
                <button className="btn-primary" onClick={() => form.name && add.mutate()}>Adicionar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Restaurantes ──────────────────────────────────────────────────────────────

export function Restaurantes() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', cuisine: '', city: '', address: '', maps_url: '' })

  const { data: restaurantes = [] } = useQuery<Restaurante[]>({ queryKey: ['restaurantes'], queryFn: () => api.get('/restaurantes').then((r) => r.data) })

  const add = useMutation({
    mutationFn: () => api.post('/restaurantes', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['restaurantes'] }); setShowForm(false) },
  })

  const rate = useMutation({
    mutationFn: ({ r, rating }: { r: Restaurante; rating: number }) =>
      api.put(`/restaurantes/${r.id}`, { ...r, rating, visited: true, visited_at: new Date().toISOString().slice(0, 10) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['restaurantes'] }),
  })

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/restaurantes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['restaurantes'] }),
  })

  return (
    <div className="page-wrapper">
      <PageHeader emoji="🍽️" title="Restaurantes" subtitle="Onde queremos comer" action={{ label: '+ Restaurante', onClick: () => setShowForm(true) }} />

      <div className="list-container">
        {restaurantes.map((r, i) => (
          <motion.div key={r.id} className="rest-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} layout>
            <div className="rest-header">
              <div>
                <p className="rest-name">{r.name} {r.visited && <span style={{ color: 'var(--green-500)', fontSize: '.75em' }}>✓ visitamos</span>}</p>
                <p className="rest-meta">{[r.cuisine, r.city].filter(Boolean).join(' · ')}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {r.maps_url && <a href={r.maps_url} target="_blank" rel="noreferrer" className="btn-ghost" style={{ padding: '4px 10px', fontSize: '.75rem' }}><ExternalLink size={12} /> maps</a>}
                <button className="list-del" onClick={() => del.mutate(r.id)}><X size={14} /></button>
              </div>
            </div>
            {/* Avaliação */}
            <div className="rest-stars">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={16} style={{ cursor: 'pointer' }}
                  fill={s <= r.rating ? 'var(--amber-400)' : 'none'}
                  color={s <= r.rating ? 'var(--amber-400)' : 'var(--color-border)'}
                  onClick={() => rate.mutate({ r, rating: s })}
                />
              ))}
              {!r.visited && <span style={{ fontSize: '.75rem', color: 'var(--ink-faint)', marginLeft: 4 }}>clique para avaliar</span>}
            </div>
          </motion.div>
        ))}

        {restaurantes.length === 0 && <div className="empty-state"><span>🍽️</span><p>Nenhum restaurante ainda.</p></div>}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="modal-backdrop" onClick={() => setShowForm(false)}>
            <motion.div className="modal-box" initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }} onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowForm(false)}><X size={18} /></button>
              <h3 className="modal-title">Novo Restaurante</h3>
              <div className="form-stack">
                <input className="form-input" placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <div className="form-row">
                  <input className="form-input" placeholder="Culinária" value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })} />
                  <input className="form-input" placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <input className="form-input" placeholder="Link Google Maps (opcional)" value={form.maps_url} onChange={(e) => setForm({ ...form, maps_url: e.target.value })} />
                <button className="btn-primary" onClick={() => form.name && add.mutate()}>Adicionar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Timeline ──────────────────────────────────────────────────────────────────

interface TimelineItem { id: string; title: string; description: string; date: string; emoji: string }

export function Timeline() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', date: '', emoji: '💚' })
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: items = [] } = useQuery<TimelineItem[]>({ queryKey: ['timeline'], queryFn: () => api.get('/timeline').then((r) => r.data) })

  const add = useMutation({
    mutationFn: () => api.post('/timeline', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['timeline'] }); setShowForm(false) },
  })

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/timeline/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['timeline'] }),
  })

  // Linha cresce com o scroll; items entram de lados alternados
  useEffect(() => {
    if (!items.length) return
    const ctx = gsap.context(() => {
      // Linha vertical scrubbed
      gsap.fromTo('.timeline-line',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 70%',
            end: 'bottom 30%',
            scrub: 1,
          },
        }
      )
      // Items entram alternados esquerda/direita
      gsap.utils.toArray<HTMLElement>('.timeline-item').forEach((el, i) => {
        gsap.from(el, {
          opacity: 0,
          x: i % 2 === 0 ? -50 : 50,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        })
      })
    }, containerRef)
    return () => ctx.revert()
  }, [items])

  return (
    <div className="page-wrapper">
      <PageHeader emoji="🕰️" title="Linha do Tempo" subtitle="Nossa história, capítulo por capítulo" action={{ label: '+ Momento', onClick: () => setShowForm(true) }} />

      <div className="timeline-container" ref={containerRef}>
        <div className="timeline-line" />
        {items.map((item) => (
          <div key={item.id} className="timeline-item">
            <div className="timeline-dot"><span>{item.emoji}</span></div>
            <div className="timeline-card">
              <p className="timeline-date">{item.date}</p>
              <p className="timeline-title">{item.title}</p>
              {item.description && <p className="timeline-desc">{item.description}</p>}
              <button className="list-del" style={{ position: 'absolute', top: 12, right: 12 }} onClick={() => del.mutate(item.id)}><X size={12} /></button>
            </div>
          </div>
        ))}

        {items.length === 0 && <div className="empty-state"><span>🕰️</span><p>A história começa aqui.<br />Adicione o primeiro momento!</p></div>}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="modal-backdrop" onClick={() => setShowForm(false)}>
            <motion.div className="modal-box" initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }} onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowForm(false)}><X size={18} /></button>
              <h3 className="modal-title">Novo Momento</h3>
              <div className="form-stack">
                <div className="form-row">
                  <input className="form-input" placeholder="Emoji" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} style={{ width: 80 }} />
                  <input className="form-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <input className="form-input" placeholder="Título do momento" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <textarea className="form-input form-textarea" placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <button className="btn-primary" onClick={() => form.title && add.mutate()}>Adicionar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Filmes ────────────────────────────────────────────────────────────────────

export function Filmes() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('todos')
  const [form, setForm] = useState({ title: '', year: '', status: 'quero ver', stream_on: '', notes: '' })

  const { data: filmes = [] } = useQuery<Filme[]>({ queryKey: ['filmes'], queryFn: () => api.get('/filmes').then((r) => r.data) })

  const add = useMutation({
    mutationFn: () => api.post('/filmes', { ...form, year: +form.year }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['filmes'] }); setShowForm(false) },
  })

  const updateStatus = useMutation({
    mutationFn: ({ f, status }: { f: Filme; status: string }) => api.put(`/filmes/${f.id}`, { ...f, status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['filmes'] }),
  })

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/filmes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['filmes'] }),
  })

  const statusColors: Record<string, string> = { 'quero ver': 'var(--amber-400)', 'assistindo': 'var(--green-400)', 'assistimos': 'var(--green-600)' }
  const filtered = filter === 'todos' ? filmes : filmes.filter((f) => f.status === filter)

  return (
    <div className="page-wrapper">
      <PageHeader emoji="🎬" title="Filmes & Séries" subtitle="Nossa watchlist" action={{ label: '+ Título', onClick: () => setShowForm(true) }} />

      <div className="filter-tabs">
        {['todos', 'quero ver', 'assistindo', 'assistimos'].map((s) => (
          <button key={s} className={`filter-tab ${filter === s ? 'filter-tab--active' : ''}`} onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>

      <div className="list-container">
        {filtered.map((f, i) => (
          <motion.div key={f.id} className="list-item" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} layout>
            <span style={{ fontSize: '1.2rem' }}>🎬</span>
            <div style={{ flex: 1 }}>
              <p className="list-text">{f.title} {f.year ? `(${f.year})` : ''}</p>
              {f.stream_on && <p style={{ fontSize: '.75rem', color: 'var(--ink-faint)' }}>{f.stream_on}</p>}
            </div>
            <select className="form-input" style={{ width: 'auto', fontSize: '.75rem', padding: '4px 8px', color: statusColors[f.status] }}
              value={f.status} onChange={(e) => updateStatus.mutate({ f, status: e.target.value })}>
              <option value="quero ver">quero ver</option>
              <option value="assistindo">assistindo</option>
              <option value="assistimos">assistimos</option>
            </select>
            <button className="list-del" onClick={() => del.mutate(f.id)}><X size={12} /></button>
          </motion.div>
        ))}
        {filtered.length === 0 && <div className="empty-state"><span>🎬</span><p>Nenhum título aqui.</p></div>}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="modal-backdrop" onClick={() => setShowForm(false)}>
            <motion.div className="modal-box" initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }} onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowForm(false)}><X size={18} /></button>
              <h3 className="modal-title">Novo Título</h3>
              <div className="form-stack">
                <input className="form-input" placeholder="Nome" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <div className="form-row">
                  <input className="form-input" placeholder="Ano" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
                  <input className="form-input" placeholder="Onde assistir" value={form.stream_on} onChange={(e) => setForm({ ...form, stream_on: e.target.value })} />
                </div>
                <select className="form-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option>quero ver</option><option>assistindo</option><option>assistimos</option>
                </select>
                <button className="btn-primary" onClick={() => form.title && add.mutate()}>Adicionar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Playlist ──────────────────────────────────────────────────────────────────

export function Playlist() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', artist: '', spotify_url: '', youtube_url: '', meaning: '', added_by: 'eu' })

  const { data: items = [] } = useQuery<PlaylistItem[]>({ queryKey: ['playlist'], queryFn: () => api.get('/playlist').then((r) => r.data) })

  const add = useMutation({
    mutationFn: () => api.post('/playlist', form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['playlist'] }); setShowForm(false) },
  })

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/playlist/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['playlist'] }),
  })

  return (
    <div className="page-wrapper">
      <PageHeader emoji="🎵" title="Nossa Playlist" subtitle="Músicas que são nossas" action={{ label: '+ Música', onClick: () => setShowForm(true) }} />

      <div className="list-container">
        {items.map((item, i) => (
          <motion.div key={item.id} className="list-item" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} layout>
            <span style={{ fontSize: '1.3rem' }}>🎵</span>
            <div style={{ flex: 1 }}>
              <p className="list-text">{item.title}</p>
              {item.artist && <p style={{ fontSize: '.8rem', color: 'var(--ink-muted)' }}>{item.artist}</p>}
              {item.meaning && <p style={{ fontSize: '.75rem', color: 'var(--ink-faint)', fontFamily: 'var(--font-hand)' }}>{item.meaning}</p>}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {item.spotify_url && <a href={item.spotify_url} target="_blank" rel="noreferrer" className="btn-ghost" style={{ padding: '4px 10px', fontSize: '.72rem' }}>Spotify</a>}
              {item.youtube_url && <a href={item.youtube_url} target="_blank" rel="noreferrer" className="btn-ghost" style={{ padding: '4px 10px', fontSize: '.72rem' }}>YT</a>}
            </div>
            <button className="list-del" onClick={() => del.mutate(item.id)}><X size={12} /></button>
          </motion.div>
        ))}
        {items.length === 0 && <div className="empty-state"><span>🎵</span><p>Nenhuma música ainda.</p></div>}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="modal-backdrop" onClick={() => setShowForm(false)}>
            <motion.div className="modal-box" initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }} onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowForm(false)}><X size={18} /></button>
              <h3 className="modal-title">Nova Música</h3>
              <div className="form-stack">
                <input className="form-input" placeholder="Nome da música" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <input className="form-input" placeholder="Artista" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} />
                <input className="form-input" placeholder="Link Spotify (opcional)" value={form.spotify_url} onChange={(e) => setForm({ ...form, spotify_url: e.target.value })} />
                <input className="form-input" placeholder="Link YouTube (opcional)" value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} />
                <textarea className="form-input form-textarea" placeholder="Por que essa música é especial?" value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} />
                <select className="form-input" value={form.added_by} onChange={(e) => setForm({ ...form, added_by: e.target.value })}>
                  <option value="eu">Adicionada por mim</option>
                  <option value="yasmin">Adicionada por Yasmin</option>
                </select>
                <button className="btn-primary" onClick={() => form.title && add.mutate()}>Adicionar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
