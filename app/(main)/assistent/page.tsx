export default function AssistentPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-lg font-semibold text-foreground">Assistent</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        AI-chatten byggs i steg 10 av byggordningen (kräver
        ANTHROPIC_API_KEY).
      </p>
    </div>
  )
}
