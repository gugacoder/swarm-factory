import { useParams } from 'react-router-dom'

export function useSlug(): string | null {
  const { slug } = useParams<{ slug: string }>()
  return slug ?? null
}
