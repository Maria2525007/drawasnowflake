import { forwardRef } from 'react';
import { TreeCanvas } from './TreeCanvas';

export const Tree = forwardRef<HTMLCanvasElement>((_, ref) => {
  if (ref && 'current' in ref) {
    return <TreeCanvas canvasRef={ref as React.RefObject<HTMLCanvasElement>} />;
  }
  return <TreeCanvas />;
});
