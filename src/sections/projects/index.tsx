import RandomColorButton from '@/components/theme-buttons/random-color-button';
import { Title } from '@/components/title';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
          dragFree: true,
        }}
        plugins={[
          Autoplay({
            stopOnInteraction: true,
            stopOnFocusIn: true,
          }),
        ]}
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
        <div className="pt-6 w-full flex justify-end space-x-2">
          <Button
            onClick={() => api?.scrollPrev()}
            className="bg-secondary border-2 rounded-full p-2"
            variant="ghost"
          >
            <ArrowLeft />
          </Button>
          <Button
            onClick={() => api?.scrollNext()}
            className="bg-secondary border-2 rounded-full p-2"
            variant="ghost"
          >
            <ArrowRight />
          </Button>
        </div>
      </Carousel>
    </div>
  );
};
