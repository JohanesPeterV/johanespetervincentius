import ScrollContainer from '@/components/scroll-container';
import RandomColorButton from '@/components/theme-buttons/random-color-button';
import { Title } from '@/components/title';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaGithub } from 'react-icons/fa';
import { projects } from './projects';

export const Projects = () => {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 flex flex-col items-center justify-center max-h-screen py-8">
        <div className="flex justify-center mb-6">
          <Title>
            Pr
            <RandomColorButton />
            jects
          </Title>
        </div>
        <div className="w-full max-w-7xl mx-auto px-4 overflow-hidden">
          <ScrollContainer className="pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-4">
              {projects.map((project, index) => (
                <Card
                  key={index}
                  onClick={() => window.open(project.repoLink, '_blank')}
                  className="relative bg-opacity-60 backdrop-blur-2xl cursor-pointer group/card transition-all duration-300 hover:scale-[1.02] flex flex-col"
                >
                  <div className="w-full h-full absolute inset-0 hidden group-hover/card:flex justify-center items-center rounded-xl bg-background/80 backdrop-blur-sm transition-all duration-300">
                    <FaGithub size={60} />
                  </div>
                  <div className="group-hover/card:blur-md transition-all duration-300 flex flex-col flex-1">
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="text-lg sm:text-xl lg:text-2xl">
                        {project.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-xs sm:text-sm lg:text-base flex-1">
                      {project.description}
                    </CardContent>
                    {project.technologies && (
                      <div className="px-4 sm:px-6 pb-3 sm:pb-4 flex flex-wrap gap-1.5 sm:gap-2 mt-auto">
                        {project.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-2 py-1 text-xs bg-primary/10 rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollContainer>
        </div>
      </div>
    </div>
  );
};
