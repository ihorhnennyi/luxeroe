let igLoader: Promise<void> | null = null

export function loadInstagramScript(): Promise<void> {
  if (igLoader) return igLoader
  igLoader = new Promise<void>(resolve => {
    const src = 'https://www.instagram.com/embed.js'
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)
    const onReady = () => resolve()
    if (existing) {
      if ((window as any).instgrm?.Embeds) onReady()
      else existing.addEventListener('load', onReady, { once: true })
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.addEventListener('load', onReady, { once: true })
    document.body.appendChild(s)
  })
  return igLoader
}
