import { useEffect, useRef, type RefObject } from 'react'
import { gsap } from '../lib/gsap'

/**
 * Hook que cria um gsap.context() escopado a um elemento e faz cleanup automático.
 * Usage:
 *   const ref = useGsapContext<HTMLDivElement>((ctx) => { gsap.from(...) }, [deps])
 */
export function useGsapContext<T extends HTMLElement = HTMLDivElement>(
  fn: (ctx: gsap.Context) => void,
  deps: unknown[] = [],
): RefObject<T | null> {
  const scope = useRef<T | null>(null)

  useEffect(() => {
    const ctx = gsap.context(fn, scope)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return scope
}
