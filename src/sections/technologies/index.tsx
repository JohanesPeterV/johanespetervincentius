import RandomColorButton from '@/components/theme-buttons/random-color-button';
import { Title } from '@/components/title';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { TECHNOLOGIES } from './technologies';
import TechnologySection from './technologies-section';

export default function Technologies() {
  return (
    <div
      id="technologies"
      className="flex flex-col items-center justify-center relative py-8 px-4 sm:px-6 lg:px-8"
    >
      <Title className="mb-8">
        Techn
        <RandomColorButton />
        logies
      </Title>

      <div className="w-full max-w-7xl mx-auto">
        <div className="relative group">
          <Carousel
            className="w-full"
            opts={{
              align: 'start',
              loop: true,
              skipSnaps: false,
              containScroll: 'trimSnaps',
            }}
            plugins={[
              Autoplay({
                delay: 4000,
                stopOnInteraction: true,
                stopOnMouseEnter: true,
              }),
            ]}
          >
            <CarouselContent className="h-[400px] py-4">
              {TECHNOLOGIES.map((stack, index) => (
                <CarouselItem
                  key={index}
                  className="basis-full md:basis-1/2 lg:basis-1/3"
                >
                  <div className="h-full p-2">
                    <TechnologySection
                      contents={stack.contents}
                      title={stack.category}
                    />
                  </div>
                </CarouselItem>
              ))}
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
      </div>
    </div>
  );
}
