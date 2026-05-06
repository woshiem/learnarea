"use client";
import React, { createContext, useContext, useState } from "react";

type PDFContextValue = {
  pdfFile: File | null;
  pdfName: string;
  setPdf: (file: File) => void;
  clearPdf: () => void;
};

const PDFContext = createContext<PDFContextValue>({
  pdfFile: null,
  pdfName: "",
  setPdf: () => {},
  clearPdf: () => {},
});

export function PDFProvider({ children }: { children: React.ReactNode }) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState("");

  return (
    <PDFContext.Provider
      value={{
        pdfFile,
        pdfName,
        setPdf: (file) => { setPdfFile(file); setPdfName(file.name); },
        clearPdf: () => { setPdfFile(null); setPdfName(""); },
      }}
    >
      {children}
    </PDFContext.Provider>
  );
}

export const usePDF = () => useContext(PDFContext);
