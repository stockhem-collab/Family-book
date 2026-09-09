import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Familjen</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Projektet är scaffoldat. Nästa steg: koppla Supabase och bygga
            autentiseringsflödet.
          </p>
          <Button>Kom igång</Button>
        </CardContent>
      </Card>
    </div>
  )
}
