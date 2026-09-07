import { FaEnvelope, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa';
import { IconType } from 'react-icons/lib';

import { Button } from '@/components/ui/button';

type ContactIcon = {
  icon: IconType;
  label: string;
  url: string;
};

const CONTACT_ICONS: ContactIcon[] = [
  {
    icon: FaWhatsapp,
    label: 'WhatsApp',
    url: 'https://api.whatsapp.com/send?phone=628118503508',
  },
  {
    icon: FaEnvelope,
    label: 'Email',
    url: 'mailto:johanespeter.jp@gmail.com',
  },
  {
    icon: FaLinkedinIn,
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/in/johanes-vincentius-714b311a4',
  },
];

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
