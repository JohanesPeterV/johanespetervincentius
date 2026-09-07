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
  const [selectedCard, setSelectedCard] = useState(cardType - 1);
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
    const section = sectionRef.current;
    const handleSelect = (): void => {
      setSelectedCard(api.selectedScrollSnap());
      updateCardTypeUrl(api);
      if (section) {
        section.dataset.snapshotReady = 'false';
        const content = section.querySelector<HTMLElement>(
          '[data-section-scroll]',
        );
        if (content) {
          content.scrollTop = 0;
        }
      }
    };
    const handleSettle = (): void => {
      if (section) {
        section.dataset.snapshotReady = 'true';
      }
    };
    api.on('select', handleSelect);
    api.on('settle', handleSettle);
    setSelectedCard(api.selectedScrollSnap());
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
      api.off('settle', handleSettle);
      section?.removeEventListener('wheel', handleWheel);
    };
  }, [api, cardType]);

  return (
    <section
      ref={sectionRef}
      aria-label="Profile card styles"
      data-snapshot-ready="true"
      className="pointer-events-none flex max-h-[calc(100svh-10rem)] w-full flex-col"
    >
      <Carousel
        setApi={setApi}
        opts={{
          align: 'center',
          dragFree: false,
          skipSnaps: false,
          startIndex: cardType - 1,
        }}
        data-section-scroll
        data-horizontal-gesture
        className="pointer-events-none min-h-0 w-full select-none overflow-y-auto overscroll-contain scrollbar-thin"
      >
        <CarouselContent className="ml-0">
          <CarouselItem
            aria-label="Original card, 1 of 2"
            aria-hidden={selectedCard !== 0}
            inert={selectedCard !== 0}
            className="flex items-start justify-center px-4 sm:px-8"
          >
            <ClassicCard />
          </CarouselItem>
          <CarouselItem
            aria-label="Minimal card, 2 of 2"
            aria-hidden={selectedCard !== 1}
            inert={selectedCard !== 1}
            className="flex items-start justify-center px-4 sm:px-8"
          >
            <MinimalCard />
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </section>
  );
}
