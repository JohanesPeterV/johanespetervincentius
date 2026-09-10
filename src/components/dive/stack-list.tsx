import type { Stack } from '@/app/_components/stack';

type StackListProps = {
  stack: Stack;
};

export const StackList = ({ stack }: StackListProps) => (
  <p className="type-meta">
    {stack.primary.join(' · ')}
    {stack.others.length > 0 ? (
      <span className="text-muted-foreground">
        {' · '}
        {stack.others.join(' · ')}
      </span>
    ) : null}
  </p>
);
