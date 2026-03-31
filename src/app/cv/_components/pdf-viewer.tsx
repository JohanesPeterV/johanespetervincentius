'use client';

import { useEffect, useState } from 'react';
import type { DocumentProps, PageProps, pdfjs as pdfjsType } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

let Document: React.ComponentType<DocumentProps>;
let Page: React.ComponentType<PageProps>;
let pdfjs: typeof pdfjsType;

interface PdfViewerProps {
  file: string;
  className?: string;
  onClick?: () => void;
  canvasBackground?: string;
  pageNumber: number;
  width?: number;
  renderTextLayer?: boolean;
  renderAnnotationLayer?: boolean;
  pageClassName?: string;
}

export function PdfViewer({
  file,
  className,
  onClick,
  canvasBackground,
  pageNumber,
  width,
  renderTextLayer,
  renderAnnotationLayer,
  pageClassName,
}: PdfViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // REASON: dynamic import of react-pdf must run client-side — SSR does not support PDF rendering
  useEffect(() => {
    async function loadPDF() {
      const reactPdf = await import('react-pdf');
      Document = reactPdf.Document;
      Page = reactPdf.Page;
      pdfjs = reactPdf.pdfjs;

      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString();

      setIsLoaded(true);
    }

    loadPDF();
  }, []);

  if (!isLoaded) {
    return <div className={className}>Loading PDF...</div>;
  }

  return (
    <Document file={file} className={className} onClick={onClick}>
      <Page
        canvasBackground={canvasBackground}
        pageNumber={pageNumber}
        width={width}
        renderTextLayer={renderTextLayer}
        renderAnnotationLayer={renderAnnotationLayer}
        className={pageClassName}
      />
    </Document>
  );
}
