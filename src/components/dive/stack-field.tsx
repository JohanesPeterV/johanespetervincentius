import { STACK } from '@/app/_components/stack';

// REASON: the main stack is pinned in the seam between the two card decks;
// the rest drifts through the chapter behind the cards like passing debris,
// each tag's lane, speed and phase assigned by nth-child cycles in CSS
export const StackField = () => (
  <div className="stack-field" aria-label="Stack">
    <ul className="stack-field-primary">
      {STACK.primary.map((name) => (
        <li key={name} className="stack-tag stack-bob" data-tier="primary">
          {name}
        </li>
      ))}
    </ul>
    <ul className="stack-field-drift">
      {STACK.secondary.map((name) => (
        <li key={name} className="stack-tag stack-drift">
          {name}
        </li>
      ))}
    </ul>
  </div>
);
