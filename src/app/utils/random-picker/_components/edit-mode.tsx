'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';

interface EditModeProps {
  items: string[];
  onInputChange: (index: number, value: string) => void;
  onRemoveItem: (index: number) => void;
  onKeyDown: (event: React.KeyboardEvent, index: number) => void;
  onClearAll: () => void;
  onDone: () => void;
  hasItems: boolean;
}

export const EditMode = ({
  items,
  onInputChange,
  onRemoveItem,
  onKeyDown,
  onClearAll,
  onDone,
  hasItems,
}: EditModeProps) => {
  return (
    <>
      <ScrollArea className="h-[50vh] sm:h-96 pr-2 mb-4 sm:mb-6">
        <div className="space-y-2 sm:space-y-3 px-1 py-1">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => onInputChange(index, e.target.value)}
                onKeyDown={(e) => onKeyDown(e, index)}
                placeholder={`Item ${index + 1}`}
                className="flex-1 text-sm sm:text-base"
              />
              {items.length > 1 && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onRemoveItem(index)}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Button
          variant="outline"
          onClick={onClearAll}
          className="text-sm sm:text-base"
        >
          Clear All
        </Button>
        <Button
          onClick={onDone}
          disabled={!hasItems}
          className="text-sm sm:text-base"
        >
          Done
        </Button>
      </div>
    </>
  );
};
