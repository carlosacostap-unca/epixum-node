import Link from "next/link";
import type { Inquiry, User } from "@/types";
import { Badge, Card, CardContent } from "@/components/ui";

export default function InquiryCard({ inquiry, currentUser, basePath }: { inquiry: Inquiry; currentUser: User | null; basePath?: string }) {
  const resolved = inquiry.status === "Resuelta";
  const author = inquiry.author === currentUser?.id ? "Vos" : inquiry.expand?.author?.name || "Usuario";
  const context = inquiry.expand?.class?.title || inquiry.expand?.assignment?.title || inquiry.expand?.week?.title || "Consulta general";
  const href = basePath?.includes("/cohorts/") ? `${basePath}/${inquiry.id}` : `/inquiries/${inquiry.id}`;
  return <Link href={href} className="group block rounded-lg focus:outline-none">
    <Card className={`h-full transition group-hover:border-primary group-hover:shadow-md ${resolved ? "opacity-80" : "border-warning/30"}`}>
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3"><Badge variant={resolved ? "success" : "warning"}>{inquiry.status}</Badge><time className="text-right text-xs text-muted" dateTime={inquiry.updated || inquiry.created}>{resolved ? formatDate(inquiry.updated || inquiry.created) : waitingTime(inquiry.updated || inquiry.created)}</time></div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-primary">{context}</p>
        <h3 className="mt-2 text-lg font-bold group-hover:text-primary">{inquiry.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{inquiry.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t pt-4 text-xs text-muted"><span>Por {author}</span><span className="font-semibold text-primary">Abrir conversación →</span></div>
      </CardContent>
    </Card>
  </Link>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(value)); }
function waitingTime(value: string) { const hours = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 3_600_000)); return hours < 24 ? `Espera ${hours} h` : `Espera ${Math.floor(hours / 24)} d`; }
