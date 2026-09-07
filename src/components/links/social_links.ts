import { FaFileAlt, FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { IconType } from 'react-icons/lib';

type SocialLink = {
  icon: IconType;
  label: string;
  url: string;
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    icon: FaLinkedin,
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/in/johanes-vincentius-714b311a4',
  },
  {
    icon: FaInstagram,
    label: 'Instagram',
    url: 'https://www.instagram.com/johanespeterv',
  },
  {
    icon: FaGithub,
    label: 'GitHub',
    url: 'https://github.com/JohanesPeterV',
  },
  {
    icon: FaFileAlt,
    label: 'CV',
    url: '/cv',
  },
];
