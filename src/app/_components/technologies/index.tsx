import ScrollContainer from '@/components/scroll-container';
import RandomColorButton from '@/components/theme-buttons/random-color-button';
import { Title } from '@/components/title';
import { TECHNOLOGIES } from './technologies';
import TechnologySection from './technologies-section';

export default function Technologies() {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 flex flex-col items-center justify-center max-h-screen py-8">
        <div className="flex justify-center mb-6">
          <Title>
            Techn
            <RandomColorButton />
            logies
          </Title>
        </div>
        <div className="w-full max-w-7xl mx-auto px-4">
          <ScrollContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-4">
              {TECHNOLOGIES.map((technology, index) => (
                <div
                  key={index}
                  className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-4 transition-colors duration-200 hover:border-primary/50"
                >
                  <TechnologySection
                    contents={technology.contents}
                    title={technology.category}
                  />
                </div>
              ))}
            </div>
          </ScrollContainer>
        </div>
      </div>
    </div>
  );
}
