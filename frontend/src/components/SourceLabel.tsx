/** Mandatory next to every price or performance figure — see PRD §6 rule 1. */
export function SourceLabel({ children }: { children: string }) {
  return <span className="text-xs text-muted-foreground">Kaynak: {children}</span>;
}
