import type { Metadata } from "next";
import { ChallengeView } from "@/features/challenge/components/ChallengeView";

export const metadata: Metadata = { title: "Our challenge · Flame in Freefall" };

/** Nuestro Reto: el encargo de NASA y cómo responde la plataforma. */
export default function ChallengePage() {
  return <ChallengeView />;
}
