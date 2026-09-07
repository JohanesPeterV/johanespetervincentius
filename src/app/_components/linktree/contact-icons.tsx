import { Button } from '@/components/ui/button';

import { CONTACT_ICONS } from './links';

export default function ContactIcons() {
  return (
    <nav aria-label="Contact" className="flex items-center gap-3">
      {CONTACT_ICONS.map(({ icon: Icon, label, url }) => {
        const isExternal = url.startsWith('http');
        return (
          <Button
            key={label}
            asChild
            variant="destination"
            size="icon"
            className="h-11 w-11"
          >
            <a
              href={url}
              aria-label={label}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
            >
              <Icon aria-hidden />
            </a>
          </Button>
        );
      })}
    </nav>
  );
}
