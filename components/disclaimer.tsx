import { Info } from 'lucide-react'

export function Disclaimer({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm text-foreground ${className}`}
      role="note"
    >
      <Info className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
      <p className="leading-relaxed">
        This tool provides educational information and does not replace professional medical advice, diagnosis, or
        treatment. In an emergency, contact your local emergency services immediately.
      </p>
    </div>
  )
}
