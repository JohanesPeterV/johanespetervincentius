import React from 'react';

type TitleProps = {
  children: React.ReactNode;
  className?: string;
};
export const Title = ({ children, className }: TitleProps) => {
  return (
    <h1
      className={`text-2xl sm:text-3xl lg:text-4xl font-semibold p-0 ${className}`}
    >
      {children}
    </h1>
  );
};
