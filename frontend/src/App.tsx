import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/auth'

import ShellLayout from './components/ShellLayout'
import QuizGate from './pages/QuizGate'
import Home from './pages/Home'
import Cartas from './pages/Cartas'
import Album from './pages/Album'
import { Desejos, Metas } from './pages/Lists'
import { Lugares, Restaurantes, Timeline, Filmes, Playlist } from './pages/Features'

import './styles/tokens.css'
import './styles/glass.css'
import './styles/noise.css'
import './components/PageHeader.css'
import './pages/features.css'

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated() ? <>{children}</> : <Navigate to="/quiz" replace />
}

function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/quiz" element={<QuizGate />} />
          <Route path="/" element={<RequireAuth><ShellLayout /></RequireAuth>}>
            <Route index element={<Home />} />
            <Route path="cartas" element={<Cartas />} />
            <Route path="album" element={<Album />} />
            <Route path="desejos" element={<Desejos />} />
            <Route path="metas" element={<Metas />} />
            <Route path="lugares" element={<Lugares />} />
            <Route path="restaurantes" element={<Restaurantes />} />
            <Route path="timeline" element={<Timeline />} />
            <Route path="filmes" element={<Filmes />} />
            <Route path="playlist" element={<Playlist />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-body)',
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-soft)',
            borderRadius: '14px',
            backdropFilter: 'blur(12px)',
          },
        }}
      />
    </QueryClientProvider>
  )
}

export default App
