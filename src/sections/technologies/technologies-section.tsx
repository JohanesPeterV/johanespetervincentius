import { Technology } from './technologies';
export default function TechnologySection(props: {
  title: string;
  contents: Technology['contents'];
}) {
  return (
    <div className="h-full flex flex-col">
      <h2 className="pb-2 transition-all transition-color text-light-text-primary dark:text-dark-text-primary text-center duration-300 text-2xl sm:text-2xl sm:tracking-tight md:text-2xl lg:text-3xl z-30">
        {props.title}
      </h2>
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-transparent scrollbar-thumb-light-text-primary/20 dark:scrollbar-thumb-dark-text-primary/20 hover:scrollbar-thumb-light-text-primary/30 dark:hover:scrollbar-thumb-dark-text-primary/30">
        <ul className="h-full pr-2">
          {props.contents.map((content, index) => (
            <li
              key={index}
              className="py-2 w-42 transition-transform transform duration-300 hover:scale-150 z-0"
            >
              <a href={content.link}>
                <div className="text-lg text-light-text-primary dark:text-dark-text-primary w-100 text-center">
                  {content.name}
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
