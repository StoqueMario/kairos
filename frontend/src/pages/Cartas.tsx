import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { X, Upload, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { gsap } from '../lib/gsap'
import api from '../lib/api'
import PageHeader from '../components/PageHeader'
import './Cartas.css'

interface Carta {
  id: string
  title: string
  description: string
  file_url: string
  file_type: string
  from: string
  date: string
  created_at: string
}

export default function Cartas() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [viewing, setViewing] = useState<Carta | null>(null)
  const [form, setForm] = useState({ title: '', description: '', from: 'eu', date: '' })
  const [file, setFile] = useState<File | null>(null)

  const { data: cartas = [] } = useQuery<Carta[]>({
    queryKey: ['cartas'],
    queryFn: () => api.get('/cartas').then((r) => r.data),
  })

  // Cards entram em leque: rotateY + y staggerados
  useEffect(() => {
    if (!cartas.length) return
    const ctx = gsap.context(() => {
      gsap.from('.carta-card', {
        rotateY: 14,
        y: 36,
        opacity: 0,
        duration: 0.65,
        stagger: 0.09,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.cartas-grid',
          start: 'top 88%',
          once: true,
        },
      })
    })
    return () => ctx.revert()
  }, [cartas])

  const upload = useMutation({
    mutationFn: (fd: FormData) => api.post('/cartas', fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cartas'] })
      setShowForm(false)
      setFile(null)
      setForm({ title: '', description: '', from: 'eu', date: '' })
      toast.success('Carta guardada 💚')
    },
    onError: () => toast.error('Erro ao salvar carta'),
  })

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/cartas/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cartas'] }); toast.success('Carta removida') },
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: ([f]) => f && setFile(f),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return toast.error('Selecione um arquivo')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('title', form.title)
    fd.append('description', form.description)
    fd.append('from', form.from)
    fd.append('date', form.date)
    upload.mutate(fd)
  }

  return (
    <div className="page-wrapper">
      <PageHeader
        emoji="💌"
        title="Cartas"
        subtitle="Tudo que colocamos no papel"
        action={{ label: '+ Nova carta', onClick: () => setShowForm(true) }}
      />

      <div className="cartas-grid">
        <AnimatePresence>
          {cartas.map((c) => (
            <div
              key={c.id}
              className="carta-card"
            >
              <div className="carta-preview" onClick={() => setViewing(c)}>
                {c.file_type === 'image' ? (
                  <img src={c.file_url} alt={c.title} className="carta-img" />
                ) : (
                  <div className="carta-pdf-icon">📄</div>
                )}
                <div className="carta-overlay"><Eye size={20} /></div>
              </div>
              <div className="carta-meta">
                <div>
                  <p className="carta-title">{c.title || 'Sem título'}</p>
                  <p className="carta-from">de {c.from === 'eu' ? 'mim' : 'Yasmin'} · {c.date}</p>
                </div>
                <button className="carta-del" onClick={() => del.mutate(c.id)} aria-label="Excluir">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </AnimatePresence>

        {cartas.length === 0 && (
          <div className="empty-state">
            <span>💌</span>
            <p>Nenhuma carta ainda.<br />Adicione a primeira!</p>
          </div>
        )}
      </div>

      {/* Modal upload */}
      <AnimatePresence>
        {showForm && (
          <Modal onClose={() => setShowForm(false)}>
            <h3 className="modal-title">Nova Carta</h3>
            <form onSubmit={handleSubmit} className="form-stack">
              <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzone--active' : ''}`}>
                <input {...getInputProps()} />
                {file ? (
                  <p className="dropzone-file">{file.name}</p>
                ) : (
                  <>
                    <Upload size={28} color="var(--accent-primary)" />
                    <p>Arraste ou clique para selecionar</p>
                    <p className="dropzone-hint">JPG, PNG, PDF</p>
                  </>
                )}
              </div>

              <input className="form-input" placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <textarea className="form-input form-textarea" placeholder="Descrição (opcional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="form-row">
                <select className="form-input" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })}>
                  <option value="eu">De mim</option>
                  <option value="yasmin">De Yasmin</option>
                </select>
                <input className="form-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>

              <button type="submit" className="btn-primary" disabled={upload.isPending}>
                {upload.isPending ? 'Salvando…' : 'Guardar carta'}
              </button>
            </form>
          </Modal>
        )}

        {viewing && (
          <Modal onClose={() => setViewing(null)} wide>
            <h3 className="modal-title">{viewing.title || 'Carta'}</h3>
            {viewing.file_type === 'image' ? (
              <img src={viewing.file_url} alt="" className="modal-image" />
            ) : (
              <iframe src={viewing.file_url} className="modal-pdf" title="carta" />
            )}
            {viewing.description && <p className="modal-desc">{viewing.description}</p>}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

function Modal({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className={`modal-box ${wide ? 'modal-box--wide' : ''}`}
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        transition={{ ease: [0.34, 1.56, 0.64, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Fechar"><X size={18} /></button>
        {children}
      </motion.div>
    </motion.div>
  )
}
