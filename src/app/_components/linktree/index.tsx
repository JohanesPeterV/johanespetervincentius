'use client';

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { useEffect, useRef, useState } from 'react';

import ClassicCard from './classic-card';
import MinimalCard from './minimal-card';

export type CardType = 1 | 2;

type LinktreeSectionParams = {
  cardType: CardType;
};

const updateCardTypeUrl = (api: CarouselApi): void => {
  if (!api) {
    return;
  }
  const selectedCardType = String(api.selectedScrollSnap() + 1);
  const url = new URL(window.location.href);
  if (url.searchParams.get('card_type') === selectedCardType) {
    return;
  }
  url.searchParams.set('card_type', selectedCardType);
  window.history.replaceState(null, '', url);
};

export default function LinktreeSection({ cardType }: LinktreeSectionParams) {
  const [api, setApi] = useState<CarouselApi>();
  const sectionRef = useRef<HTMLElement>(null);

  // REASON: Embla exposes selection only after mount, and the horizontal
  // wheel capture needs a native non-passive listener - React's root wheel
  // listener is passive, so preventDefault cannot stop the browser's
  // back/forward swipe gesture
  useEffect(() => {
    if (!api) {
      return;
    }
    api.scrollTo(cardType - 1);
    const handleSelect = (): void => {
      updateCardTypeUrl(api);
    };
    api.on('select', handleSelect);
    const section = sectionRef.current;
    const handleWheel = (event: globalThis.WheelEvent): void => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
        return;
      }
      event.preventDefault();
      if (event.deltaX > 0) {
        api.scrollNext();
        return;
      }
      api.scrollPrev();
    };
    section?.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      api.off('select', handleSelect);
      section?.removeEventListener('wheel', handleWheel);
    };
  }, [api, cardType]);

  return (
    <section
      ref={sectionRef}
      aria-label="Profile card styles"
      className="pointer-events-none w-full"
    >
      <Carousel
        setApi={setApi}
        opts={{
          align: 'center',
          dragFree: false,
          skipSnaps: false,
          startIndex: cardType - 1,
        }}
        className="pointer-events-none w-full select-none"
      >
        <CarouselContent>
          <CarouselItem
            aria-label="Original card, 1 of 2"
            className="flex items-center justify-center px-4 sm:px-8"
          >
            <ClassicCard />
          </CarouselItem>
          <CarouselItem
            aria-label="Minimal card, 2 of 2"
            className="flex items-center justify-center px-4 sm:px-8"
          >
            <MinimalCard />
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </section>
  );
}
