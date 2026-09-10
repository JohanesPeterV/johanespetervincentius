import type { Stack } from '@/app/_components/stack';

type StackListProps = {
  stack: Stack;
  tier: 'primary' | 'all';
};

export const StackList = ({ stack, tier }: StackListProps) => (
  <ul className="stack-list type-meta" aria-label="Stack">
    {stack.primary.map((name) => (
      <li key={name} className="stack-tag" data-tier="primary">
        {name}
      </li>
    ))}
    {tier === 'all'
      ? stack.others.map((name) => (
          <li key={name} className="stack-tag">
            {name}
          </li>
        ))
      : null}
  </ul>
);
