"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { PublicContentRevision } from "@/lib/content/projection";
import { recordContentBlockProgressAction, recordContentSectionOpenAction } from "@/lib/content/learning-actions";
import ContentBlockRenderer from "./ContentBlockRenderer";

export default function StudentContentRuntime({ cohortId, weekId, sectionId, revision, assetUrls }: { cohortId: string; weekId: string; sectionId: string; revision: PublicContentRevision; assetUrls: Record<string, string> }) {
  const router = useRouter();
  const furthest = useRef(-1);
  useEffect(() => {
    void recordContentSectionOpenAction(cohortId, weekId, sectionId, crypto.randomUUID());
    if (!("IntersectionObserver" in window)) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const blocks = [...document.querySelectorAll<HTMLElement>("[data-block-key]")];
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const index = blocks.indexOf(entry.target as HTMLElement);
        if (index <= furthest.current) continue;
        furthest.current = index;
        if (timer) clearTimeout(timer);
        timer = setTimeout(async () => {
          const blockKey = blocks[furthest.current]?.dataset.blockKey;
          if (!blockKey) return;
          const result = await recordContentBlockProgressAction(cohortId, weekId, sectionId, { revisionId: revision.revisionId, blockKey, progressKey: crypto.randomUUID() });
          if (result.success && result.data.completed) router.refresh();
        }, 800);
      }
    }, { threshold: 0.65 });
    for (const block of blocks) observer.observe(block);
    return () => { if (timer) clearTimeout(timer); observer.disconnect(); };
  }, [cohortId, weekId, sectionId, revision.revisionId, router]);
  return <ContentBlockRenderer blocks={revision.blocks} assetUrls={assetUrls} learningContext={{ cohortId, weekId, sectionId, revisionId: revision.revisionId }} onSectionCompleted={() => router.refresh()} />;
}
