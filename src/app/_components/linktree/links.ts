import {
  FaEnvelope,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaLinkedinIn,
  FaWhatsapp,
} from 'react-icons/fa';
import { IconType } from 'react-icons/lib';

export type LinktreeLink = {
  icon: IconType;
  label: string;
  handle: string;
  url: string;
};

export const LINKTREE_LINKS: LinktreeLink[] = [
  {
    icon: FaLinkedin,
    label: 'LinkedIn',
    handle: 'Johanes Vincentius',
    url: 'https://www.linkedin.com/in/johanes-vincentius-714b311a4',
  },
  {
    icon: FaInstagram,
    label: 'Instagram',
    handle: '@johanespeterv',
    url: 'https://www.instagram.com/johanespeterv',
  },
  {
    icon: FaGithub,
    label: 'GitHub',
    handle: 'JohanesPeterV',
    url: 'https://github.com/JohanesPeterV',
  },
];

export type ContactIcon = {
  icon: IconType;
  label: string;
  url: string;
};

export const CONTACT_ICONS: ContactIcon[] = [
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
