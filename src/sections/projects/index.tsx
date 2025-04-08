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
    <div className="flex flex-col items-center justify-center relative space-y-8">
      <Title>
        Pr
        <RandomColorButton />
        jects
      </Title>
      <Carousel
        {...{ setApi }}
        className="lg:px-20 px-6 w-full max-w-sm sm:max-w-md md:max-w-3xl lg:max-w-full"
        opts={{
          align: 'start',
          active: true,
        }}
      >
        <CarouselContent>
          {projects.map((project, index) => {
            return (
              <CarouselItem
                className="basis-full md:basis-1/3 lg:basis-1/4"
                key={index}
              >
                <Card
                  onClick={() => window.open(project.repoLink, '_blank')}
                  className="relative bg-opacity-60 backdrop-blur-2xl h-full hover:mouse cursor-pointer group"
                >
                  <div className="w-full h-full absolute inset-0 hidden group-hover:flex justify-center items-center text-xl rounded-md">
                    Visit Github
                  </div>
                  <div className="group-hover:blur-xl transition">
                    <CardHeader>
                      <CardTitle>{project.title}</CardTitle>
                    </CardHeader>
                    <CardContent>{project.description}</CardContent>
                  </div>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        <div className="flex justify-end items-center gap-4 mt-8">
          <CarouselPrevious
            className="static bg-secondary transition-all"
            variant="outline"
            size="default"
          />
          <CarouselNext
            className="static bg-secondary transition-all"
            variant="outline"
            size="default"
          />
        </div>
      </Carousel>
    </div>
  );
};
