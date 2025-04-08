import { SOCIAL_LINKS } from './social_links';

type LinkProps = { iconSize?: number };
export default function Links({ iconSize = 15 }: LinkProps) {
  return (
    <div className="bg-transparent flex space-x-2 p-0 w-min">
      {SOCIAL_LINKS.map(({ icon: Icon, url }, i) => (
        <a href={url} key={i} target="_blank" rel="noopener noreferrer">
          <Icon
            className="text-primary transition-transform duration-700 hover:scale-110 hover:text-foreground hidden sm:block"
            size={iconSize}
          />
          <Icon
            className="text-primary transition-transform duration-700 hover:scale-110 hover:text-foreground sm:hidden block"
            size={iconSize * 0.75}
          />
        </a>
      ))}
    </div>
  );
}
