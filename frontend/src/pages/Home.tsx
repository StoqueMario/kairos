import HeroSection from '../components/sections/HeroSection'
import CounterSection from '../components/sections/CounterSection'
import QuoteSection from '../components/sections/QuoteSection'
import FeaturesHorizontalSection from '../components/sections/FeaturesHorizontalSection'
import GallerySection from '../components/sections/GallerySection'
import FooterSection from '../components/sections/FooterSection'
import '../styles/sections.css'

export default function Home() {
  return (
    <div className="home-v2">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="home-video-bg"
        src="/bg-video.mp4"
      />
      <div className="video-scrim" aria-hidden />
      <HeroSection />
      <CounterSection />
      <QuoteSection />
      <FeaturesHorizontalSection />
      <GallerySection />
      <FooterSection />
    </div>
  )
}
