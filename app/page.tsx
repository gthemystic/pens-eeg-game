import { Suspense } from 'react'
import { JoinLiveScreen } from '@/components/join-live-screen'
import { Loader2 } from 'lucide-react'

function JoinFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading join screen…</p>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<JoinFallback />}>
      <JoinLiveScreen />
    </Suspense>
  )
}
