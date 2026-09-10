import ScrollContainer from '@/components/scroll-container';
import { Title } from '@/components/title';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { FaExternalLinkAlt, FaGithub } from 'react-icons/fa';
import { POMODORO_PLANTER, projects } from './projects';
import { PomoplanterPreview } from './pomoplanter-preview';

export const Projects = () => {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 flex flex-col items-center justify-center max-h-screen py-8">
        <div className="flex justify-center mb-6">
          <Title>Projects</Title>
        </div>
        <div className="w-full max-w-7xl mx-auto px-4 overflow-hidden">
          <ScrollContainer className="pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-4">
              <article className="col-span-full grid items-center gap-4 pb-4 md:grid-cols-2 md:gap-10">
                <PomoplanterPreview />
                <div className="flex flex-col items-start gap-4">
                  <h2 className="text-2xl font-semibold sm:text-3xl">
                    {POMODORO_PLANTER.title}
                  </h2>
                  <p className="text-sm text-muted-foreground sm:text-base">
                    {POMODORO_PLANTER.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {POMODORO_PLANTER.stack.primary.join(' · ')}
                  </p>
                  <Button asChild size="lg" className="h-11">
                    <a
                      href={POMODORO_PLANTER.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Try Pomodoro Planter <FaExternalLinkAlt />
                    </a>
                  </Button>
                </div>
              </article>
              {projects
                .filter((project) => project !== POMODORO_PLANTER)
                .map((project) => (
                  <a
                    key={project.title}
                    href={project.link ?? project.repoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/card block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Card className="relative h-full bg-opacity-60 backdrop-blur-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col overflow-hidden">
                      <div className="w-full h-full absolute inset-0 z-10 hidden group-hover/card:flex justify-center items-center rounded-2xl bg-background/80 backdrop-blur-sm transition-all duration-300">
                        {project.link ? (
                          <FaExternalLinkAlt size={48} />
                        ) : (
                          <FaGithub size={60} />
                        )}
                      </div>
                      <div className="group-hover/card:blur-md transition-all duration-300 flex flex-col flex-1">
                        {project.image && (
                          <div className="relative aspect-[16/10] border-b border-border/60">
                            <Image
                              src={project.image}
                              alt={`${project.title} live site`}
                              fill
                              sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <CardHeader className="pb-2 sm:pb-3">
                          <CardTitle className="text-lg sm:text-xl lg:text-2xl">
                            {project.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground text-xs sm:text-sm lg:text-base flex-1">
                          {project.description}
                        </CardContent>
                        <p className="type-meta mt-auto px-4 pb-3 text-muted-foreground sm:px-6 sm:pb-4">
                          {project.stack.primary.join(' · ')}
                        </p>
                      </div>
                    </Card>
                  </a>
                ))}
            </div>
          </ScrollContainer>
        </div>
      </div>
    </div>
  );
};
