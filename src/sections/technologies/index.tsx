import RandomColorButton from '@/components/theme-buttons/random-color-button';
import { Title } from '@/components/title';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import TechnologySection from './stack-section';
import { TECHNOLOGIES } from './stacks';

export default function Technologies() {
  return (
    <div
      id="container"
      className="flex flex-col items-center justify-center relative space-y-8"
    >
      <Title>
        Techn
        <RandomColorButton />
        logies
      </Title>
      <Carousel
        className="w-screen"
        opts={{
          align: 'start',
          active: true,
        }}
        plugins={[
          Autoplay({
            delay: 2000,
            stopOnFocusIn: true,
            stopOnInteraction: true,
          }),
        ]}
      >
        <CarouselContent>
          {TECHNOLOGIES.map((stack, index) => (
            <CarouselItem
              className="basis-full md:basis-1/3 lg:basis-1/4"
              key={index}
            >
              <TechnologySection
                key={index}
                contents={stack.contents}
                title={stack.category}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
