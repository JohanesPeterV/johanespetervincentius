import { STACK } from '@/app/_components/stack';

// REASON: the main stack hangs from a line strung across the seam between
// the two decks; the rest blows through the chapter behind the cards like
// paper scraps, each tag's lane, speed, depth and phase set by nth-child
// cycles in CSS
export const StackField = () => (
  <div className="stack-field type-meta" aria-label="Stack">
    <ul className="stack-line">
      {STACK.primary.map((name) => (
        <li key={name} className="stack-hang">
          <span className="stack-tag surface-panel">{name}</span>
        </li>
      ))}
    </ul>
    <ul className="stack-field-drift">
      {STACK.secondary.map((name) => (
        <li key={name} className="stack-drift">
          <span className="stack-tag stack-scrap">{name}</span>
        </li>
      ))}
    </ul>
  </div>
);
