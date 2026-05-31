import { useState } from 'react'
import HeroSection from '../components/sections/HeroSection'
import CounterSection from '../components/sections/CounterSection'
import QuoteSection from '../components/sections/QuoteSection'
import FeaturesHorizontalSection from '../components/sections/FeaturesHorizontalSection'
import GallerySection from '../components/sections/GallerySection'
import FooterSection from '../components/sections/FooterSection'
import '../styles/sections.css'

export default function Home() {
  const [envelopeOpened, setEnvelopeOpened] = useState(false)

  return (
    <div className="home-v2">
      {/* Vídeo de fundo inicial */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className={`home-video-bg ${envelopeOpened ? 'home-video-bg--hidden' : ''}`}
        src="/bg-video.mp4"
      />

      {/* Foto que aparece quando a carta é aberta */}
      <div
        className={`home-photo-bg ${envelopeOpened ? 'home-photo-bg--visible' : ''}`}
        style={{ backgroundImage: "url('/foto-inicial-carta.jpeg')" }}
        aria-hidden
      />

      <div className="video-scrim" aria-hidden />
      <HeroSection onEnvelopeOpened={() => setEnvelopeOpened(true)} />
      <CounterSection />
      <QuoteSection />
      <FeaturesHorizontalSection />
      <GallerySection />
      <FooterSection />
    </div>
  )
}
