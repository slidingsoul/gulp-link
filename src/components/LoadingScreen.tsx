import { Mascot } from './Mascot'

export function LoadingScreen() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <Mascot className="h-28 w-28" mood="gulping" />
      <p className="text-sm font-semibold text-muted">Waking the gulper…</p>
    </main>
  )
}
