import { ChevronsDown } from 'lucide-react';

export default function ScrollCue() {
  return (
    <div className="flex flex-col items-center gap-2 text-muted-foreground">
      <span className="text-xs uppercase tracking-[0.3em]">Scroll</span>
      <ChevronsDown className="h-5 w-5 animate-bounce" />
    </div>
  );
}
