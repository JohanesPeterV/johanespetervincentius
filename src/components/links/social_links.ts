import { FaFileAlt, FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { IconType } from 'react-icons/lib';

type SocialLink = {
  label: string;
  icon: IconType;
  url: string;
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: 'linkedin',
    icon: FaLinkedin,
    url: 'https://www.linkedin.com/in/johanes-vincentius-714b311a4',
  },
  {
    label: 'instagram',
    icon: FaInstagram,
    url: 'https://www.instagram.com/johanespeterv',
  },
  {
    label: 'github',
    icon: FaGithub,
    url: 'https://github.com/JohanesPeterV',
  },
  {
    label: 'cv',
    icon: FaFileAlt,
    url: '/cv',
  },
];
