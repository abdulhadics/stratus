'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { Plus, Minus } from 'lucide-react';

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: number;
}

export function Accordion({ items, defaultOpen = 0 }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen);
  const baseId = useId();

  return (
    <div className="divide-y divide-border">
      {items.map((item, index) => (
        <AccordionRow
          key={index}
          item={item}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          triggerId={`${baseId}-trigger-${index}`}
          panelId={`${baseId}-panel-${index}`}
        />
      ))}
    </div>
  );
}

function AccordionRow({
  item,
  isOpen,
  onToggle,
  triggerId,
  panelId,
}: {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
  triggerId: string;
  panelId: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen, item.answer]);

  return (
    <div className="py-1">
      <button
        id={triggerId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group focus-visible:outline-2 focus-visible:outline-accent"
      >
        <span className="text-[15px] font-medium text-text-primary pr-8 leading-snug">
          {item.question}
        </span>
        <span className="flex-shrink-0 text-accent transition-transform duration-200">
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        style={{ height: isOpen ? height : 0 }}
        className="overflow-hidden transition-[height] duration-300 ease-out"
      >
        <div ref={contentRef} className="pb-6 pr-12">
          <p className="text-body text-text-secondary leading-relaxed">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}
