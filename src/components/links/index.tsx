import { SOCIAL_LINKS } from "./social_links";
export default function Links() {
  return (
    <div className="flex space-x-2 p-0 ">
      {SOCIAL_LINKS.map(({ icon: Icon, url }, i) => {
        return (
          <a href={url} key={i} target="_blank" rel="noopener noreferrer">
            <Icon
              size={35}
              // style={{ fill: "url(#blue-gradient)" }}
              className=" text-primary "
            />
          </a>
        );
      })}
    </div>
  );
}
