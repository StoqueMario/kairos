// Fotos placeholder do casal (Unsplash). Substitua pelas suas fotos reais.
// Você pode trocar essas URLs por caminhos relativos a /public/photos/ depois.

export interface PhotoPlaceholder {
  src: string
  alt: string
  caption?: string
}

export const heroMosaic: PhotoPlaceholder[] = [
  { src: '/img1.jpg', alt: 'Nosso momento' },
  { src: '/img2.jpg', alt: 'Nós' },
  { src: '/img3.jpg', alt: 'Foto nossa' },
  { src: '/img4.jpg', alt: 'Amor' },
  { src: '/img5.jpg', alt: 'Sorrisos' },
  { src: '/img6.jpg', alt: 'Lembrança' },
  { src: '/img7.jpg', alt: 'Carinho' },
  { src: '/img8.jpg', alt: 'Sempre' },
  { src: '/img9.jpg', alt: 'Juntas' },
]

export const galleryScattered: PhotoPlaceholder[] = [
  { src: '/img10.jpg', alt: 'Nós 1', caption: 'maio' },
  { src: '/img2.jpg', alt: 'Nós 2', caption: 'sempre' },
  { src: '/img4.jpg', alt: 'Nós 3', caption: 'em casa' },
  { src: '/img6.jpg', alt: 'Nós 4', caption: 'nosso' },
  { src: '/img8.jpg', alt: 'Nós 5', caption: 'juntas' },
  { src: '/img9.jpg', alt: 'Nós 6', caption: 'a dois' },
  { src: '/img1.jpg', alt: 'Nós 7', caption: 'tudo' },
  { src: '/img3.jpg', alt: 'Nós 8', caption: 'fim de tarde' },
]

export const featurePreviewPhotos: Record<string, string> = {
  cartas:       '/img1.jpg',
  album:        '/img2.jpg',
  timeline:     '/img3.jpg',
  lugares:      '/img4.jpg',
  restaurantes: '/img5.jpg',
  filmes:       '/img6.jpg',
  playlist:     '/img7.jpg',
  desejos:      '/img8.jpg',
  metas:        '/img9.jpg',
}
