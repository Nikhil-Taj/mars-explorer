import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Download,
  Share2,
  Info,
  ArrowLeftRight,
  Maximize2
} from 'lucide-react';
import type { MarsPhoto } from '../types';

interface PhotoComparisonProps {
  photos: [MarsPhoto, MarsPhoto];
  isOpen: boolean;
  onClose: () => void;
}

const PhotoComparison: React.FC<PhotoComparisonProps> = ({
  photos,
  isOpen,
  onClose,
}) => {
  const [leftZoom, setLeftZoom] = useState(1);
  const [rightZoom, setRightZoom] = useState(1);
  const [leftPosition, setLeftPosition] = useState({ x: 0, y: 0 });
  const [rightPosition, setRightPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<'left' | 'right' | null>(null);
  const [showInfo, setShowInfo] = useState(true);
  const [syncZoom, setSyncZoom] = useState(true);
  const [syncPan, setSyncPan] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'split' | 'overlay'>('side-by-side');

  const leftImageRef = useRef<HTMLDivElement>(null);
  const rightImageRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const [leftPhoto, rightPhoto] = photos;

  // Reset state when photos change
  useEffect(() => {
    setLeftZoom(1);
    setRightZoom(1);
    setLeftPosition({ x: 0, y: 0 });
    setRightPosition({ x: 0, y: 0 });
    setSplitPosition(50);
  }, [photos]);

  const handleZoom = (side: 'left' | 'right', delta: number) => {
    const newZoom = Math.max(0.5, Math.min(5, (side === 'left' ? leftZoom : rightZoom) + delta));
    
    if (side === 'left') {
      setLeftZoom(newZoom);
      if (syncZoom) setRightZoom(newZoom);
    } else {
      setRightZoom(newZoom);
      if (syncZoom) setLeftZoom(newZoom);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, side: 'left' | 'right') => {
    setIsDragging(side);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    if (isDragging === 'left') {
      setLeftPosition(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      if (syncPan) setRightPosition(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
    } else {
      setRightPosition(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      if (syncPan) setLeftPosition(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
    }

    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const resetView = () => {
    setLeftZoom(1);
    setRightZoom(1);
    setLeftPosition({ x: 0, y: 0 });
    setRightPosition({ x: 0, y: 0 });
  };

  const downloadComparison = () => {
    // Create a canvas to combine both images
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1920;
    canvas.height = 1080;

    // Add comparison info
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Inter';
    ctx.fillText('Mars Photo Comparison', 50, 50);
    ctx.font = '16px Inter';
    ctx.fillText(`Left: Sol ${leftPhoto.sol} - ${leftPhoto.camera.name}`, 50, 80);
    ctx.fillText(`Right: Sol ${rightPhoto.sol} - ${rightPhoto.camera.name}`, 50, 100);

    // Download the canvas
    const link = document.createElement('a');
    link.download = `mars-comparison-${leftPhoto.sol}-${rightPhoto.sol}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const shareComparison = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mars Photo Comparison',
          text: `Comparing Mars photos from Sol ${leftPhoto.sol} and Sol ${rightPhoto.sol}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-900/90 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-white">Photo Comparison</h2>
            
            {/* View Mode Selector */}
            <div className="flex bg-white/10 rounded-lg p-1">
              {[
                { mode: 'side-by-side', label: 'Side by Side' },
                { mode: 'split', label: 'Split View' },
                { mode: 'overlay', label: 'Overlay' },
              ].map(({ mode, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === mode
                      ? 'bg-red-500 text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Controls */}
            <button
              onClick={() => setSyncZoom(!syncZoom)}
              className={`p-2 rounded-lg transition-colors ${
                syncZoom ? 'bg-red-500 text-white' : 'bg-white/10 text-white/70 hover:text-white'
              }`}
              title="Sync Zoom"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 rounded-lg transition-colors ${
                showInfo ? 'bg-red-500 text-white' : 'bg-white/10 text-white/70 hover:text-white'
              }`}
              title="Show Info"
            >
              <Info className="w-4 h-4" />
            </button>

            <button
              onClick={resetView}
              className="p-2 rounded-lg bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Reset View"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={downloadComparison}
              className="p-2 rounded-lg bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={shareComparison}
              className="p-2 rounded-lg bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 relative overflow-hidden">
          {viewMode === 'side-by-side' && (
            <div className="flex h-full">
              {/* Left Photo */}
              <div className="flex-1 relative bg-black">
                <div
                  ref={leftImageRef}
                  className="w-full h-full flex items-center justify-center cursor-move"
                  onMouseDown={(e) => handleMouseDown(e, 'left')}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img
                    src={leftPhoto.img_src}
                    alt={`Mars photo from Sol ${leftPhoto.sol}`}
                    className="max-w-none transition-transform"
                    style={{
                      transform: `scale(${leftZoom}) translate(${leftPosition.x}px, ${leftPosition.y}px)`,
                    }}
                    draggable={false}
                  />
                </div>

                {/* Left Photo Info */}
                {showInfo && (
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
                    <p className="font-semibold">Sol {leftPhoto.sol}</p>
                    <p className="text-sm text-white/80">{leftPhoto.camera.full_name}</p>
                    <p className="text-sm text-white/80">{leftPhoto.earth_date}</p>
                  </div>
                )}

                {/* Left Zoom Controls */}
                <div className="absolute bottom-4 left-4 flex space-x-2">
                  <button
                    onClick={() => handleZoom('left', -0.2)}
                    className="p-2 bg-black/70 backdrop-blur-sm rounded-lg text-white hover:bg-black/80 transition-colors"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-2 bg-black/70 backdrop-blur-sm rounded-lg text-white text-sm">
                    {Math.round(leftZoom * 100)}%
                  </span>
                  <button
                    onClick={() => handleZoom('left', 0.2)}
                    className="p-2 bg-black/70 backdrop-blur-sm rounded-lg text-white hover:bg-black/80 transition-colors"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="w-1 bg-red-500"></div>

              {/* Right Photo */}
              <div className="flex-1 relative bg-black">
                <div
                  ref={rightImageRef}
                  className="w-full h-full flex items-center justify-center cursor-move"
                  onMouseDown={(e) => handleMouseDown(e, 'right')}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img
                    src={rightPhoto.img_src}
                    alt={`Mars photo from Sol ${rightPhoto.sol}`}
                    className="max-w-none transition-transform"
                    style={{
                      transform: `scale(${rightZoom}) translate(${rightPosition.x}px, ${rightPosition.y}px)`,
                    }}
                    draggable={false}
                  />
                </div>

                {/* Right Photo Info */}
                {showInfo && (
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
                    <p className="font-semibold">Sol {rightPhoto.sol}</p>
                    <p className="text-sm text-white/80">{rightPhoto.camera.full_name}</p>
                    <p className="text-sm text-white/80">{rightPhoto.earth_date}</p>
                  </div>
                )}

                {/* Right Zoom Controls */}
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <button
                    onClick={() => handleZoom('right', -0.2)}
                    className="p-2 bg-black/70 backdrop-blur-sm rounded-lg text-white hover:bg-black/80 transition-colors"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-2 bg-black/70 backdrop-blur-sm rounded-lg text-white text-sm">
                    {Math.round(rightZoom * 100)}%
                  </span>
                  <button
                    onClick={() => handleZoom('right', 0.2)}
                    className="p-2 bg-black/70 backdrop-blur-sm rounded-lg text-white hover:bg-black/80 transition-colors"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Split View Mode */}
          {viewMode === 'split' && (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 flex">
                <div 
                  className="relative overflow-hidden"
                  style={{ width: `${splitPosition}%` }}
                >
                  <img
                    src={leftPhoto.img_src}
                    alt={`Mars photo from Sol ${leftPhoto.sol}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div 
                  className="relative overflow-hidden"
                  style={{ width: `${100 - splitPosition}%` }}
                >
                  <img
                    src={rightPhoto.img_src}
                    alt={`Mars photo from Sol ${rightPhoto.sol}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Split Slider */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-red-500 cursor-col-resize z-10"
                style={{ left: `${splitPosition}%` }}
                onMouseDown={(e) => {
                  const startX = e.clientX;
                  const startSplit = splitPosition;
                  
                  const handleMouseMove = (e: MouseEvent) => {
                    const deltaX = e.clientX - startX;
                    const containerWidth = window.innerWidth;
                    const newSplit = Math.max(10, Math.min(90, startSplit + (deltaX / containerWidth) * 100));
                    setSplitPosition(newSplit);
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };

                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <ArrowLeftRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PhotoComparison;
