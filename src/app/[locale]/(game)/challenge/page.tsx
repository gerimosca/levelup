import { requireUser } from '@/shared/auth';
import { ChallengeClient } from '@/features/game';

export default async function ChallengePage() {
  await requireUser();
  return (
    <main className="mx-auto max-w-md px-4 pb-28 pt-6">
      <ChallengeClient />
    </main>
  );
}
