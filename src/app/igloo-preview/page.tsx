import LinktreeSection from '@/app/_components/linktree';
import CrystalBackground from '@/components/backgrounds/crystal-background';

export default function IglooPreviewPage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center">
      <CrystalBackground />
      <LinktreeSection />
    </main>
  );
}
