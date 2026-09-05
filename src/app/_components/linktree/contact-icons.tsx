import { FaEnvelope, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa';
import { IconType } from 'react-icons/lib';

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
    <div className="flex items-center justify-center gap-5">
      {CONTACT_ICONS.map(({ icon: Icon, label, url }) => {
        const isExternal = url.startsWith('http');
        return (
          <a
            key={label}
            href={url}
            aria-label={label}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-background/25 text-muted-foreground transition-[transform,color,border-color] hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none motion-reduce:transition-none"
          >
            <Icon className="text-xl" />
          </a>
        );
      })}
    </div>
  );
}
