import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useGlossary } from '../../hooks/useGlossary';

const GlossaryTerm = ({ term, children }) => {
  const { getTerm } = useGlossary();
  const definition = getTerm(term);

  if (!definition) {
    return children;
  }

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span 
            className="group inline-flex items-center cursor-help border-b border-dashed border-gray-400"
            role="button"
            tabIndex={0}
            aria-label={`Ver definição de ${term}`}
          >
            {children || term}
            <span className="ml-1 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">ℹ️</span>
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            role="tooltip"
            aria-label={`Definição de ${term}`}
            className="z-50 max-w-sm overflow-hidden rounded-md bg-gray-900 px-3 py-1.5
                       text-xs text-gray-50 animate-in fade-in-0 duration-200 select-none"
            side="top"
            align="center"
            sideOffset={5}
          >
            {definition}
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default GlossaryTerm;