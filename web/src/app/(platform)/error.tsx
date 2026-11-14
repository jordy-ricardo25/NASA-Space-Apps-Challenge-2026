"use client";

import { Notice } from "@/shared/components/Notice";

/** Error dentro de la plataforma: el centro de mando sigue en pie y ofrece reintentar. */
export default function PlatformError({ reset }: { error: Error; reset: () => void }) {
  return <Notice kind="error" onRetry={reset} />;
}
