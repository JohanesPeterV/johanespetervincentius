import { WORK_EXPERIENCES } from '@/app/_components/work-experience/work-experiences';

type WorkChapterProps = {
  index: number;
  chapter: number;
};

export const WorkChapter = ({ index, chapter }: WorkChapterProps) => {
  const job = WORK_EXPERIENCES[index];
  const active = chapter === index;

  return (
    <article
      id={`work-story-${index}`}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${WORK_EXPERIENCES.length}: ${job.company}`}
      aria-hidden={!active}
      inert={!active}
      data-active={active}
      data-artifact={job.artifact}
      className="work-shot relative grid h-full min-w-0 shrink-0 basis-full"
    >
      <div className="work-art-space" aria-hidden />
      <div
        className="work-shot-copy min-h-0 overflow-y-auto overscroll-contain pr-3 scrollbar-thin"
        data-section-scroll
      >
        <p className="type-meta text-primary-text">0{index + 1}</p>
        <h3 className="work-story-title font-display my-4 md:mb-6">
          {job.company}
        </h3>
        {job.positions.map((position) => (
          <div key={position.name} className="mb-5">
            <h4 className="type-label">{position.name}</h4>
            <p className="type-meta mt-1 text-muted-foreground">
              {position.workPeriod}
            </p>
            <p className="work-description mt-4 text-muted-foreground">
              {position.description}
            </p>
          </div>
        ))}
        <ul className="flex flex-col gap-4 pb-3">
          {job.showcases.map((showcase) => (
            <li key={showcase.title}>
              <h4 className="type-label mb-1">{showcase.title}</h4>
              <p className="work-description text-muted-foreground">
                {showcase.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
};
