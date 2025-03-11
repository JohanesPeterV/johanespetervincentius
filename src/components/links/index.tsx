import { SOCIAL_LINKS } from "./social_links";

export default function Links() {
  return (
    <div className="bg-transparent flex space-x-2 p-0">
      {SOCIAL_LINKS.map(({ icon: Icon, url }, i) => (
        <a href={url} key={i} target="_blank" rel="noopener noreferrer">
          <Icon size={15} className="text-primary" />
        </a>
      ))}
    </div>
  );
}
