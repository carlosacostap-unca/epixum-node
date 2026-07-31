import { Card, CardContent } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";

export function MetricCard({ label, value, detail, href, variant = "neutral" }: { label: string; value: string | number; detail?: string; href?: string; variant?: BadgeVariant }) {
  return <Card><CardContent className="flex h-full flex-col p-5"><Badge variant={variant} className="self-start">{label}</Badge><p className="mt-3 text-3xl font-bold tabular-nums">{value}</p>{detail && <p className="mt-1 text-sm text-muted">{detail}</p>}{href && <LinkButton href={href} variant="ghost" size="sm" className="mt-4 self-start px-0">Ver detalle <span aria-hidden="true">→</span></LinkButton>}</CardContent></Card>;
}
