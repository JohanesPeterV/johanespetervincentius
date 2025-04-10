'use client';

import MacbookShowcase from '@/components/3d/macbook-showcase';
import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function CVPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  return (
    <div className="h-screen w-screen">
      {!isFullscreen ? (
        <MacbookShowcase>
          <Document
            file="/cv.pdf"
            className="cursor-pointer"
            onClick={toggleFullscreen}
          >
            <Page
              canvasBackground="none"
              pageNumber={1}
              width={800}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </MacbookShowcase>
      ) : (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
          onClick={toggleFullscreen}
        >
          <button
            className="absolute top-6 left-6 bg-white/10 hover:bg-white/20 rounded-full p-2 z-10 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            aria-label="Close fullscreen view"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div
            className="relative w-full max-w-4xl h-full max-h-[90vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Document
              file="/cv.pdf"
              className="h-full flex items-center justify-center"
            >
              <Page
                pageNumber={1}
                width={800}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-2xl"
              />
            </Document>
          </div>
        </div>
      )}
    </div>
  );
}
