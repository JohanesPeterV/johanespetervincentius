import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  fallbackSrc?: string;
  lowQualitySrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  fallbackSrc = '',
  lowQualitySrc,
  className = '',
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const getBlurDataURL = () => lowQualitySrc || undefined;

  const getContainerStyles = () => {
    return {
      aspectRatio:
        props.width && props.height
          ? `${props.width}/${props.height}`
          : undefined,
    };
  };

  const handleImageLoad = () => setIsLoading(false);

  const handleImageError = () => {
    setError(true);
    setIsLoading(false);
  };

  const getImageSource = () => (error ? fallbackSrc || src : src);

  const getResponsiveSizes = () =>
    '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

  return (
    <div
      className={`relative overflow-hidden bg-muted ${className}`}
      style={getContainerStyles()}
    >
      <Image
        src={getImageSource()}
        alt={alt}
        priority={priority}
        placeholder={getBlurDataURL() ? 'blur' : 'empty'}
        blurDataURL={getBlurDataURL()}
        className={`
          transition-opacity duration-300 
          ${isLoading ? 'opacity-0' : 'opacity-100'}
        `}
        sizes={getResponsiveSizes()}
        {...props}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />

      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-muted/80" />
      )}
    </div>
  );
}
