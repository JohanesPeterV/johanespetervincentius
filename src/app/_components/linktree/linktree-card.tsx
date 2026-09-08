import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

import { CONTACT_ICONS, LINKTREE_LINKS } from './links';

export default function LinktreeCard() {
  return (
    <div className="pointer-events-auto relative z-10 mx-auto w-full max-w-md">
      <Card className="profile-card flex flex-col items-center gap-6 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-5 text-center">
          <Image
            src="/peter.webp"
            alt="Portrait of Johanes Peter Vincentius"
            width={192}
            height={192}
            priority
            className="profile-avatar h-24 w-24 object-cover"
          />
          <div className="flex flex-col items-center gap-3">
            <h2 className="profile-card-name">Johanes Peter Vincentius</h2>
            <p className="text-sm text-muted-foreground">
              Building things for the web
            </p>
          </div>
        </div>
        <nav aria-label="Find me online" className="flex w-full flex-col gap-3">
          {LINKTREE_LINKS.map(({ icon: Icon, label, handle, url }) => (
            <Button
              key={url}
              asChild
              variant="outline"
              className="relative h-auto w-full rounded-2xl px-5 py-3 sm:py-4 [&_svg]:size-5"
            >
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Icon className="absolute left-5" aria-hidden />
                <span className="flex flex-col items-center gap-0.5">
                  <span>{label}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {handle}
                  </span>
                </span>
              </a>
            </Button>
          ))}
        </nav>
        <nav aria-label="Contact" className="flex items-center gap-5">
          {CONTACT_ICONS.map(({ icon: Icon, label, url }) => {
            const isExternal = url.startsWith('http');
            return (
              <a
                key={label}
                href={url}
                aria-label={label}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="contact-link flex h-11 w-11 items-center justify-center"
              >
                <Icon className="text-xl" aria-hidden />
              </a>
            );
          })}
        </nav>
      </Card>
    </div>
  );
}
