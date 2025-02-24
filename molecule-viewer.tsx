import { useEffect, useRef, useState } from 'react';
import * as $3Dmol from '3dmol';
import { AlertCircle } from 'lucide-react';

interface MoleculeViewerProps {
  formula: string;
}

export function MoleculeViewer({ formula }: MoleculeViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstanceRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    try {
      // Initialize 3Dmol viewer
      const config = {
        backgroundColor: 'white',
        antialias: true,
        defaultcolors: $3Dmol.elementColors.rasmol
      };

      viewerInstanceRef.current = $3Dmol.createViewer(
        viewerRef.current,
        config
      );

      // Add molecule from SMILES string
      const viewer = viewerInstanceRef.current;
      viewer.addModel(formula, "sdf");
      viewer.setStyle({}, {
        stick: { radius: 0.15 },
        sphere: { radius: 0.3 }
      });
      viewer.zoomTo();
      viewer.render();

      // Add rotation animation
      let angle = 0;
      const animate = () => {
        if (viewerInstanceRef.current) {
          angle += 0.5;
          viewer.rotate(0.5, { x: 0, y: 1, z: 0 });
          viewer.render();
          requestAnimationFrame(animate);
        }
      };
      animate();

      setError(null);
    } catch (err) {
      console.error('Error rendering molecule:', err);
      setError('Failed to render 3D molecule');
    }

    return () => {
      if (viewerInstanceRef.current) {
        viewerInstanceRef.current.clear();
      }
    };
  }, [formula]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/10 rounded-md border p-4">
        <AlertCircle className="h-5 w-5 text-muted-foreground mr-2" />
        <span className="text-sm text-muted-foreground">{error}</span>
      </div>
    );
  }

  return (
    <div 
      ref={viewerRef} 
      className="w-full h-full rounded-md border"
      style={{ minHeight: '200px' }}
    />
  );
}