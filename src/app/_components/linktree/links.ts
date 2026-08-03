import { FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa';
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
