import RandomColorButton from '@/components/theme-buttons/random-color-button';
import { Title } from '@/components/title';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import React from 'react';
import { projects } from './projects';

export const Projects = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  return (
    <div className="flex flex-col items-center justify-center relative py-8 w-full overflow-hidden">
      <Title className="mb-8">
        Pr
        <RandomColorButton />
        jects
      </Title>
      <div className="w-full max-w-[90%] sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] mx-auto">
        <Carousel
          {...{ setApi }}
          className="w-full"
          opts={{
            align: 'start',
            loop: true,
            containScroll: 'trimSnaps',
          }}
        >
          <CarouselContent className="-ml-4">
            {projects.map((project, index) => (
              <CarouselItem
                key={index}
                className="basis-full md:basis-1/2 lg:basis-1/3 pl-4"
              >
                <div className="p-1">
                  <Card
                    onClick={() => window.open(project.repoLink, '_blank')}
                    className="relative bg-opacity-60 backdrop-blur-2xl min-h-[180px] h-full cursor-pointer group transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="w-full h-full absolute inset-0 hidden group-hover:flex justify-center items-center text-xl rounded-xl bg-background/80 backdrop-blur-sm transition-all duration-300">
                      Visit Github
                    </div>
                    <div className="group-hover:blur-sm transition-all duration-300">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl sm:text-2xl">
                          {project.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-muted-foreground text-sm sm:text-base">
                        {project.description}
                      </CardContent>
                    </div>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center items-center gap-4 mt-8">
            <CarouselPrevious
              className="static translate-y-0 opacity-70 hover:opacity-100 transition-opacity h-9 w-9 rounded-full bg-background border-2"
              variant="outline"
            />
            <CarouselNext
              className="static translate-y-0 opacity-70 hover:opacity-100 transition-opacity h-9 w-9 rounded-full bg-background border-2"
              variant="outline"
            />
          </div>
        </Carousel>
      </div>
    </div>
  );
};
