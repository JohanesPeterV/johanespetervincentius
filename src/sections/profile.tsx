"use client";
import RandomColorButton from "@/components/theme-buttons/random-color-button";

export default function Profile() {
  return (
    <div>
      <h1
        className="text-4xl font-bold tracking-tight lg:text-6xl
      text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-green-500
      bg-300% animate-gradient bg-clip-text leading-none
      "
      >
        J
        <RandomColorButton className="text-4xl lg:text-6xl font-extrabold p-0" />
        hanes Peter Vincentius
      </h1>
    </div>
  );
}
