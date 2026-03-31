'use client';

import { AnimatedBackground } from '@/app/utils/random-picker/_components/animated-background';
import { EditMode } from '@/app/utils/random-picker/_components/edit-mode';
import { PickMode } from '@/app/utils/random-picker/_components/pick-mode';
import RandomColorButton from '@/components/theme-buttons/random-color-button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

interface PickerState {
  items: string[];
  pickedItem: string;
  isEditing: boolean;
  isAnimating: boolean;
  isInitialized: boolean;
}

const INITIAL_PICKER_STATE: PickerState = {
  items: [''],
  pickedItem: '',
  isEditing: true,
  isAnimating: false,
  isInitialized: false,
};

const RandomPickerContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, setState] = useState<PickerState>(INITIAL_PICKER_STATE);

  const filledItems = state.items.filter((item) => item.trim() !== '');
  const hasItems = filledItems.length > 0;

  // REASON: URL search params must be read client-side — SSR has no access to query string
  useEffect(() => {
    if (state.isInitialized) {
      return;
    }

    const itemsParam = searchParams.get('items');
    if (itemsParam) {
      try {
        const decodedItems = JSON.parse(decodeURIComponent(itemsParam));
        if (Array.isArray(decodedItems) && decodedItems.length > 0) {
          setState((prev) => ({
            ...prev,
            items: [...decodedItems, ''],
            isEditing: false,
            isInitialized: true,
          }));
          return;
        }
      } catch (error) {
        console.error('Failed to parse items from URL:', error);
      }
    }
    setState((prev) => ({ ...prev, isInitialized: true }));
  }, [searchParams, state.isInitialized]);

  const updateURL = (itemsList: string[]) => {
    const filled = itemsList.filter((item) => item.trim() !== '');
    if (filled.length === 0) {
      router.replace('/utils/random-picker', { scroll: false });
      return;
    }

    const encoded = encodeURIComponent(JSON.stringify(filled));
    router.replace(`/utils/random-picker?items=${encoded}`, { scroll: false });
  };

  const handleInputChange = (index: number, value: string) => {
    const newItems = [...state.items];
    newItems[index] = value;
    setState((prev) => ({ ...prev, items: newItems }));

    const allFilled = newItems.every((item) => item.trim() !== '');
    if (allFilled) {
      setTimeout(
        () => setState((prev) => ({ ...prev, items: [...newItems, ''] })),
        0,
      );
    }

    updateURL(newItems);
  };

  const handleRemoveItem = (index: number) => {
    if (state.items.length <= 1) {
      return;
    }
    const newItems = state.items.filter((_, i) => i !== index);
    setState((prev) => ({ ...prev, items: newItems }));
    updateURL(newItems);
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setState((prev) => ({ ...prev, items: [...prev.items, ''] }));
      return;
    }

    if (
      event.key === 'Backspace' &&
      state.items[index] === '' &&
      state.items.length > 1
    ) {
      event.preventDefault();
      handleRemoveItem(index);
    }
  };

  const handleClearAll = () => {
    setState({
      ...state,
      items: [''],
      pickedItem: '',
      isEditing: true,
    });
    router.replace('/utils/random-picker', { scroll: false });
  };

  const handleDoneEditing = () => {
    if (!hasItems) {
      return;
    }
    setState((prev) => ({ ...prev, isEditing: false, pickedItem: '' }));
  };

  const handleEditList = () => {
    setState((prev) => ({ ...prev, isEditing: true, pickedItem: '' }));
  };

  const handlePickOne = () => {
    if (!hasItems || state.isAnimating) {
      return;
    }

    setState((prev) => ({ ...prev, isAnimating: true, pickedItem: '' }));

    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * filledItems.length);
      setState((prev) => ({ ...prev, pickedItem: filledItems[randomIndex] }));
      count++;

      if (count >= 15) {
        clearInterval(interval);
        const finalIndex = Math.floor(Math.random() * filledItems.length);
        setState((prev) => ({
          ...prev,
          pickedItem: filledItems[finalIndex],
          isAnimating: false,
        }));
      }
    }, 100);
  };

  return (
    <>
      <AnimatedBackground items={filledItems} />
      <div className="flex flex-col min-h-screen items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Rand
              <RandomColorButton className="text-2xl sm:text-3xl lg:text-4xl font-bold" />
              m Picker
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {state.isEditing
                ? 'Add your items to get started'
                : 'Click to pick a random item'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {state.isEditing ? (
              <EditMode
                items={state.items}
                onInputChange={handleInputChange}
                onRemoveItem={handleRemoveItem}
                onKeyDown={handleKeyDown}
                onClearAll={handleClearAll}
                onDone={handleDoneEditing}
                hasItems={hasItems}
              />
            ) : (
              <PickMode
                filledItems={filledItems}
                pickedItem={state.pickedItem}
                isAnimating={state.isAnimating}
                onPickOne={handlePickOne}
                onEditList={handleEditList}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default function RandomPickerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <RandomPickerContent />
    </Suspense>
  );
}
