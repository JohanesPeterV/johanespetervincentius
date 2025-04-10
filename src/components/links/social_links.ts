import { FaFileAlt, FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { IconType } from 'react-icons/lib';
export const SOCIAL_LINKS: SocialLink[] = [
  {
    icon: FaLinkedin,
    url: 'https://www.linkedin.com/in/johanes-vincentius-714b311a4',
  },
  {
    icon: FaInstagram,
    url: 'https://www.instagram.com/johanespeterv',
  },
  {
    icon: FaGithub,
    url: 'https://github.com/JohanesPeterV',
  },
  {
    icon: FaFileAlt,
    url: '/cv',
  },
];

type SocialLink = {
  icon: IconType;
  url: string;
};
