import RandomColorButton from '@/components/theme-buttons/random-color-button';
import { Title } from '@/components/title';
import { Card, CardContent } from '@/components/ui/card';
import { WORK_EXPERIENCES } from './work-experiences';

export default function WorkExperience() {
  return (
    <div className="flex flex-col items-center justify-center relative space-y-4">
      <Title>
        W
        <RandomColorButton />
        rk Experience
      </Title>
      <div className="space-y-2">
        {WORK_EXPERIENCES.map((workExperience, index) => (
          <div key={index} className="p-1 max-w-3xl">
            <Card
              className={`bg-opacity-60 backdrop-blur-2xl pt-4 space-y-4 ${
                index === 0 ? 'border-primary' : ''
              }`}
            >
              <CardContent className="flex flex-col items-center justify-center ">
                <div className="w-full flex flex-col space-y-3 ">
                  <h2 className="sm:text-2xl text-xl font-semibold">
                    {workExperience.company}
                  </h2>
                  {workExperience.positions.map((position, innerIndex) => {
                    return (
                      <div key={innerIndex} className="space-y-2">
                        <div
                          key={innerIndex}
                          className="sm:text-xl text-md font-semibold flex flex-row w-full  items-stretch justify-between"
                        >
                          <h3>{position.name}</h3>
                          <h3>{position.workPeriod}</h3>
                        </div>
                        <p className="sm:text-md text-sm">
                          {position.description}
                        </p>
                        {innerIndex < workExperience.positions.length - 1 && (
                          <hr />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      <div className="space-y-2"></div>
    </div>
  );
}
