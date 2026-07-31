"use client";

import { useEffect } from "react";
import { RouteErrorState } from "@/components/ui";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <RouteErrorState reset={reset} />;
}
