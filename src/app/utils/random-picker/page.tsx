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

const RandomPickerContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<string[]>(['']);
  const [pickedItem, setPickedItem] = useState<string>('');
  const [isEditing, setIsEditing] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const filledItems = items.filter((item) => item.trim() !== '');
  const hasItems = filledItems.length > 0;

  useEffect(() => {
    if (isInitialized) return;

    const itemsParam = searchParams.get('items');
    if (itemsParam) {
      try {
        const decodedItems = JSON.parse(decodeURIComponent(itemsParam));
        if (Array.isArray(decodedItems) && decodedItems.length > 0) {
          setItems([...decodedItems, '']);
          setIsEditing(false);
        }
      } catch (error) {
        console.error('Failed to parse items from URL:', error);
      }
    }
    setIsInitialized(true);
  }, [searchParams, isInitialized]);

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
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);

    const allFilled = newItems.every((item) => item.trim() !== '');
    if (allFilled) {
      setTimeout(() => setItems([...newItems, '']), 0);
    }

    updateURL(newItems);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    updateURL(newItems);
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setItems([...items, '']);
      return;
    }

    if (event.key === 'Backspace' && items[index] === '' && items.length > 1) {
      event.preventDefault();
      handleRemoveItem(index);
    }
  };

  const handleClearAll = () => {
    setItems(['']);
    setPickedItem('');
    setIsEditing(true);
    router.replace('/utils/random-picker', { scroll: false });
  };

  const handleDoneEditing = () => {
    if (!hasItems) return;
    setIsEditing(false);
    setPickedItem('');
  };

  const handleEditList = () => {
    setIsEditing(true);
    setPickedItem('');
  };

  const handlePickOne = () => {
    if (!hasItems || isAnimating) return;

    setIsAnimating(true);
    setPickedItem('');

    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * filledItems.length);
      setPickedItem(filledItems[randomIndex]);
      count++;

      if (count >= 15) {
        clearInterval(interval);
        const finalIndex = Math.floor(Math.random() * filledItems.length);
        setPickedItem(filledItems[finalIndex]);
        setIsAnimating(false);
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
              {isEditing
                ? 'Add your items to get started'
                : 'Click to pick a random item'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {isEditing ? (
              <EditMode
                items={items}
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
                pickedItem={pickedItem}
                isAnimating={isAnimating}
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
