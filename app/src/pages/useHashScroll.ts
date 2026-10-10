import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scroll to the URL's #anchor once a lazily loaded page has mounted. The app's router effect (App.tsx ScrollToHash) runs
 * when the route changes, before a lazy page's chunk has arrived and its anchors exist; a page that arrives later calls
 * this on mount instead (`#/map#map-L3`, `#/arcade#arcade-L7`, `#/formulas#formulas-L1`). A later hash change on the same
 * page scrolls again, as ScrollToHash does (the same element, the same call).
 */
export function useHashScroll(): void {
  const { hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])
}
