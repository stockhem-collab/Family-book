export default async function FamiljMemberPage({
  params,
}: {
  params: Promise<{ memberId: string }>
}) {
  const { memberId } = await params
  void memberId

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-lg font-semibold text-foreground">Familjemedlem</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        Profilsidan (Info/Aktiviteter/Preferenser/Önskelista/Mer) byggs i
        steg 8 av byggordningen.
      </p>
    </div>
  )
}
