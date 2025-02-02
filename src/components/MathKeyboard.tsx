import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MathKeyboardProps {
  onInsert: (symbol: string) => void;
}

export default function MathKeyboard({ onInsert }: MathKeyboardProps) {
  const symbols = [
    { display: <InlineMath math="\alpha" />, value: '\\alpha' },
    { display: <InlineMath math="\beta" />, value: '\\beta' },
    { display: <InlineMath math="\sum" />, value: '\\sum' },
    { display: <InlineMath math="\int" />, value: '\\int' },
    { display: <InlineMath math="\frac{a}{b}" />, value: '\\frac{}{}' },
    { display: <InlineMath math="\sqrt{x}" />, value: '\\sqrt{}' },
    { display: <InlineMath math="x^2" />, value: '^2' },
    { display: <InlineMath math="x_n" />, value: '_n' },
    { display: <InlineMath math="\pi" />, value: '\\pi' },
    { display: <InlineMath math="\infty" />, value: '\\infty' },
    { display: <InlineMath math="\pm" />, value: '\\pm' },
    { display: <InlineMath math="\div" />, value: '\\div' },
    { display: <InlineMath math="\times" />, value: '\\times' },
    { display: <InlineMath math="\leq" />, value: '\\leq' },
    { display: <InlineMath math="\geq" />, value: '\\geq' },
  ];

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="grid grid-cols-5 gap-2">
        {symbols.map((symbol, index) => (
          <button
            key={index}
            onClick={() => onInsert(symbol.value)}
            className="p-2 border rounded hover:bg-gray-50 transition-colors"
          >
            {symbol.display}
          </button>
        ))}
      </div>
    </div>
  );
}