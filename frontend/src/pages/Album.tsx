import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { X, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { gsap, ScrollTrigger } from '../lib/gsap'
import api from '../lib/api'
import PageHeader from '../components/PageHeader'
import '../components/PageHeader.css'

interface Foto {
  id: string
  url: string
  caption: string
  event_name: string
  taken_at: string
}

export default function Album() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ caption: '', event_name: '', taken_at: '' })
  const [file, setFile] = useState<File | null>(null)

  const { data: fotos = [] } = useQuery<Foto[]>({
    queryKey: ['fotos'],
    queryFn: () => api.get('/fotos').then((r) => r.data),
  })

  // Batch reveal: fotos escalam de 0.82 pra 1 quando entram na viewport
  useEffect(() => {
    if (!fotos.length) return
    const ctx = gsap.context(() => {
      ScrollTrigger.batch('.album-item', {
        onEnter: (els) =>
          gsap.from(els, {
            scale: 0.82,
            opacity: 0,
            duration: 0.55,
            stagger: 0.07,
            ease: 'power2.out',
          }),
        once: true,
        start: 'top 92%',
      })
    })
    return () => ctx.revert()
  }, [fotos])

  const upload = useMutation({
    mutationFn: (fd: FormData) => api.post('/fotos', fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fotos'] })
      setShowForm(false)
      setFile(null)
      setForm({ caption: '', event_name: '', taken_at: '' })
      toast.success('Foto adicionada 📸')
    },
    onError: () => toast.error('Erro ao enviar foto'),
  })

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/fotos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fotos'] }),
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: ([f]) => f && setFile(f),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return toast.error('Selecione uma foto')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('caption', form.caption)
    fd.append('event_name', form.event_name)
    fd.append('taken_at', form.taken_at)
    upload.mutate(fd)
  }

  // Agrupa por evento
  const events = [...new Set(fotos.map((f) => f.event_name || 'Sem evento'))]

  return (
    <div className="page-wrapper">
      <PageHeader emoji="📸" title="Álbum" subtitle="Todas as nossas memórias" action={{ label: '+ Foto', onClick: () => setShowForm(true) }} />

      {fotos.length === 0 && (
        <div className="empty-state"><span>📷</span><p>Nenhuma foto ainda.<br />Começa a guardar as memórias!</p></div>
      )}

      {events.map((event) => (
        <section key={event} className="album-section">
          <h2 className="album-section-title">{event}</h2>
          <div className="album-grid">
            {fotos.filter((f) => (f.event_name || 'Sem evento') === event).map((f) => (
              <div key={f.id} className="album-item">
                <img src={f.url} alt={f.caption} />
                {f.caption && <p className="album-caption">{f.caption}</p>}
                <button className="album-del" onClick={() => del.mutate(f.id)} aria-label="Excluir"><X size={12} /></button>
              </div>
            ))}
          </div>
        </section>
      ))}

      <AnimatePresence>
        {showForm && (
          <div className="modal-backdrop" onClick={() => setShowForm(false)}>
            <motion.div className="modal-box" initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }} onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowForm(false)}><X size={18} /></button>
              <h3 className="modal-title">Nova Foto</h3>
              <form onSubmit={handleSubmit} className="form-stack">
                <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzone--active' : ''}`}>
                  <input {...getInputProps()} />
                  {file ? <p className="dropzone-file">{file.name}</p> : (<><Upload size={28} color="var(--accent-primary)" /><p>Selecionar foto</p></>)}
                </div>
                <input className="form-input" placeholder="Legenda" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
                <input className="form-input" placeholder="Evento (ex: Primeiro encontro)" value={form.event_name} onChange={(e) => setForm({ ...form, event_name: e.target.value })} />
                <input className="form-input" type="date" value={form.taken_at} onChange={(e) => setForm({ ...form, taken_at: e.target.value })} />
                <button type="submit" className="btn-primary" disabled={upload.isPending}>{upload.isPending ? 'Enviando…' : 'Salvar foto'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
