export function FormErrorMessage({ error }: { error?: string }) {
  if (!error) {
    return null
  }

  return <p className="text-sm text-destructive">{error}</p>
}
