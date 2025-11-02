'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PickModeProps {
  filledItems: string[];
  pickedItem: string;
  isAnimating: boolean;
  onPickOne: () => void;
  onEditList: () => void;
}

export const PickMode = ({
  filledItems,
  pickedItem,
  isAnimating,
  onPickOne,
  onEditList,
}: PickModeProps) => {
  return (
    <>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <p className="text-xs sm:text-sm text-muted-foreground">
          {filledItems.length} {filledItems.length === 1 ? 'item' : 'items'}{' '}
          added
        </p>
        <Button
          variant="outline"
          onClick={onEditList}
          size="sm"
          className="text-xs sm:text-sm"
        >
          Edit List
        </Button>
      </div>

      <Button
        onClick={onPickOne}
        disabled={isAnimating}
        size="lg"
        className="w-full py-4 sm:py-6 text-lg sm:text-xl mb-4 sm:mb-6"
      >
        {isAnimating ? 'Picking...' : 'Pick One'}
      </Button>

      {pickedItem && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6 sm:p-8">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 text-center">
              Result:
            </p>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center break-words">
              {pickedItem}
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
};
