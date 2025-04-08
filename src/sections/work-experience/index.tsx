import ScrollContainer from '@/components/scroll-container';
import RandomColorButton from '@/components/theme-buttons/random-color-button';
import { Title } from '@/components/title';
import { Card, CardContent } from '@/components/ui/card';
import { WORK_EXPERIENCES } from './work-experiences';

export default function WorkExperience() {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 flex flex-col items-center justify-center max-h-screen py-8">
        <div className="flex justify-center mb-6">
          <Title>
            W
            <RandomColorButton />
            rk Experience
          </Title>
        </div>
        <div className="w-full max-w-3xl mx-auto px-4 overflow-hidden">
          <ScrollContainer className="pr-2">
            <div className="space-y-4">
              {WORK_EXPERIENCES.map((workExperience, index) => (
                <Card
                  key={index}
                  className={`bg-opacity-60 backdrop-blur-2xl ${
                    index === 0 ? 'border-primary' : ''
                  }`}
                >
                  <CardContent className="py-4 px-4 sm:px-6">
                    <div className="space-y-4">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold">
                        {workExperience.company}
                      </h2>
                      {workExperience.positions.map((position, innerIndex) => (
                        <div key={innerIndex} className="space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <h3 className="text-base sm:text-lg font-semibold">
                              {position.name}
                            </h3>
                            <span className="text-sm sm:text-base text-muted-foreground">
                              {position.workPeriod}
                            </span>
                          </div>
                          <p className="text-sm sm:text-base text-muted-foreground">
                            {position.description}
                          </p>
                          {innerIndex < workExperience.positions.length - 1 && (
                            <hr className="my-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollContainer>
        </div>
      </div>
    </div>
  );
}
