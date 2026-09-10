import { projects } from '@/app/_components/projects/projects';
import { ProjectCard } from './project-card';

export const DiveProjects = () => (
  <section
    className="dive-project-section"
    aria-labelledby="project-deck-title"
  >
    <h3 id="project-deck-title" className="type-label">
      Projects
    </h3>
    <div className="project-card-deck">
      {projects.map((project, index) => (
        <ProjectCard key={project.title} project={project} index={index} />
      ))}
    </div>
  </section>
);
