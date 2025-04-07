import { useState } from 'react';
import { Technology } from './stacks';
export default function TechnologySection(props: {
  title: string;
  contents: Technology['contents'];
}) {
  const [enabled, setEnabled] = useState(true);
  function toggleDropDown() {
    setEnabled(!enabled);
  }
  return (
    <div className="pb-6  flex flex-col items-center">
      <button
        onClick={toggleDropDown}
        className="pb-2 transition-all transition-color text-light-text-primary dark:text-dark-text-primary  text-center duration-300 mt-1 text-2xl  sm:text-2xl sm:tracking-tight md:text-2xl lg:text-3xl z-30"
      >
        {props.title}
      </button>
      <ul>
        <div className="z-10 overflow-hidden transition-height ease-in-out duration-300">
          <div className="transition-all duration-300 ease-in-out transform">
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
          </div>
        </div>
      </ul>
    </div>
  );
}
