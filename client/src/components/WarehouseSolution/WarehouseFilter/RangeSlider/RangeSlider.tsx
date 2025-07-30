import React, { useState, useRef, useEffect } from "react";

interface RangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  onChange?: (min: number, max: number) => void;
  value?: [number, number];
  title?: string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min = 0,
  max = 100,
  step = 1,
  onChange,
  value,
  title
}) => {
  const [values, setValues] = useState<[number, number]>([min, max]);
  const trackRef = useRef<HTMLDivElement>(null);
  const minHandleRef = useRef<HTMLDivElement>(null);
  const maxHandleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setValues(value);
    }
  }, [value]);

  const calculatePercentage = (value: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  const handleMouseDown = (e: React.MouseEvent, isMin: boolean) => {
    e.preventDefault();
    const startX = e.pageX;
    const trackRect = trackRef.current?.getBoundingClientRect();
    const startValue = isMin ? values[0] : values[1];

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!trackRect) return;
      
      const deltaX = moveEvent.pageX - startX;
      const percentageMoved = (deltaX / trackRect.width) * 100;
      const valueRange = max - min;
      const valueMoved = (valueRange * percentageMoved) / 100;
      let newValue = Math.round((startValue + valueMoved) / step) * step;

      newValue = Math.max(min, Math.min(max, newValue));

      setValues(prev => {
        const newValues = [...prev] as [number, number];
        if (isMin) {
          newValues[0] = Math.min(newValue, values[1] - step);
        } else {
          newValues[1] = Math.max(newValue, values[0] + step);
        }
        onChange?.(newValues[0], newValues[1]);
        return newValues;
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const formatValue = (value: number) => {
    return value >= 1000 ? `${value/1000}k` : value;
  };

  return (
    <div className="w-full px-4 py-2">
      {/* Min/Max Labels */}
      <div className="flex justify-between mb-1">
        <div className="text-sm text-gray-600">
          Min <span className="text-gray-900 font-medium ml-1">{formatValue(values[0])}</span>
        </div>
        <div className="text-sm text-gray-600">
          Max <span className="text-gray-900 font-medium ml-1">{formatValue(values[1])}</span>
        </div>
      </div>

      {/* Slider Track */}
      <div className="relative h-8 py-3">
        <div ref={trackRef} className="absolute w-full h-2 bg-gray-200 rounded-full">
          {/* Active Track */}
          <div 
            className="absolute h-full bg-blue-600 rounded-full"
            style={{
              left: `${calculatePercentage(values[0])}%`,
              right: `${100 - calculatePercentage(values[1])}%`
            }}
          />

          {/* Handles */}
          <div
            ref={minHandleRef}
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-pointer hover:scale-110 transition-transform duration-150 shadow-md"
            style={{ left: `${calculatePercentage(values[0])}%` }}
            onMouseDown={(e) => handleMouseDown(e, true)}
          />
          <div
            ref={maxHandleRef}
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full cursor-pointer hover:scale-110 transition-transform duration-150 shadow-md"
            style={{ left: `${calculatePercentage(values[1])}%` }}
            onMouseDown={(e) => handleMouseDown(e, false)}
          />
        </div>
      </div>

      {/* Title */}
      {title && (
        <div className="text-center mt-1 text-sm text-gray-500">
          {title}
        </div>
      )}
    </div>
  );
};

export default RangeSlider;