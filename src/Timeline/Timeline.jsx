import React, { useState, useRef, useEffect, useCallback } from "react";
import "./Timeline.css";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const convertDecimalToTime = (decimalTime) => {
  const hours = Math.floor(decimalTime);
  const minutes = Math.floor((decimalTime - hours) * 60);
  const seconds = Math.round(((decimalTime - hours) * 60 - minutes) * 60);

  const adjustedSeconds = seconds === 60 ? 0 : seconds;
  const adjustedMinutes = seconds === 60 ? minutes + 1 : minutes;

  const formattedTime = `${hours.toString().padStart(2, '0')}:${adjustedMinutes.toString().padStart(2, '0')}:${adjustedSeconds.toString().padStart(2, '0')}`;
  return formattedTime;
};

const zoomLevels = [0.5, 1, 2, 6, 18, 72];
const widthLabels = 300;

const Timeline = ({ items, updateItemStartTime, updateItemDuration, setSelectedItem, handleDrop, leftPanelItemDrag }) => {
  const timeLabelsRef = useRef(null);
  const itemsContentRef = useRef(null);
  
  const [scrollPosition, setScrollPosition] = useState(0);
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragStartPosition, setDragStartPosition] = useState(null);
  const [draggedItemStartTime, setDraggedItemStartTime] = useState(null);

  const [resizingItem, setResizingItem] = useState(null);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [visualWidth, setVisualWidth] = useState(null);
  const [visualLeft, setVisualLeft] = useState(null);
  
  const [zoomMod, setZoomMod] = useState(1);
  const [scale, setScale] = useState(zoomLevels[zoomMod]);
  const [contentWidth, setContentWidth] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [calculatedItems, setCalculatedItems] = useState([]);

  const handleMouseMove = useCallback((event) => {
    if (itemsContentRef.current) {
      const rect = itemsContentRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setPosition({ x, y });
    }
  }, []);

  useEffect(() => {
    const element = itemsContentRef.current;
    if (element) {
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('dragover', handleMouseMove);
    }
    return () => {
      if (element) {
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('dragover', handleMouseMove);
      }
    };
  }, [handleMouseMove]);

  const getCurrentTime = () => {
    const currentTime = new Date();
    return currentTime.getHours() + (currentTime.getMinutes() / 60);
  };

  const handleItemClick = (item) => setSelectedItem(item);

  const handleMouseDown = (e, item) => {
    setDraggedItem(item);
    setDraggedElement(e);
    setDragStartPosition({
      x: e.clientX,
      y: e.clientY,
      left: parseFloat(e.target.style.left),
      top: parseFloat(e.target.style.top)
    });
  };

  const handleResizeMouseDown = (e, item, direction) => {
    e.stopPropagation();
    setResizingItem(item);
    setResizeDirection(direction);
    setDragStartPosition({
      x: e.clientX,
      left: item.left,
      width: item.width,
    });
  };

  const handleResizeMouseMove = useCallback((e) => {
    if (resizingItem && resizingItem.type !== 'video') {
      const deltaX = e.clientX - dragStartPosition.x;
      let newWidth = dragStartPosition.width + (resizeDirection === 'right' ? deltaX : -deltaX);
      let newLeft = dragStartPosition.left + (resizeDirection === 'left' ? deltaX : 0);

      if (newWidth < 0) newWidth = 0;

      setVisualWidth(newWidth);
      setVisualLeft(newLeft);

    }
  }, [calculatedItems, dragStartPosition, resizeDirection, resizingItem]);

  const handleMouseUp = () => {
    if (resizingItem && visualWidth !== null && visualLeft !== null) {
      const newDuration = visualWidth / (widthLabels * scale);
      const newStartTime = resizingItem.startTime + (visualLeft - resizingItem.left) / (widthLabels * scale);
    
      updateItemDuration(resizingItem.id, newDuration);
      updateItemStartTime(resizingItem.id, resizingItem.startDate, newStartTime);
    }
    setResizingItem(null);
    setResizeDirection(null);
    setVisualWidth(null);
    setVisualLeft(null);

    if (draggedItem && draggedItemStartTime) {
      updateItemStartTime(draggedItem.id, draggedItem.startDate, draggedItemStartTime);
    }
    setDraggedElement(null);
    setDraggedItemStartTime(null);
    setDraggedItem(null);
    setDragStartPosition(null);
  };

  const handleMouseMoveDrag = (e) => {
    if (draggedItem) {
      const deltaX = e.clientX - dragStartPosition.x;
      const newLeft = Math.max(0, Math.min(dragStartPosition.left + deltaX, contentWidth - draggedItem.width));
      draggedElement.target.style.left = `${newLeft}px`;

      let left = newLeft;
      const indexItem = calculatedItems.findIndex(item => item.id === draggedItem.id);

      for (let i = 0; i < indexItem; i++) {
        left += calculatedItems[i]?.duration * widthLabels * scale || 0;
      }

      setDraggedItemStartTime(left / (widthLabels * scale));
    }

    if (leftPanelItemDrag) {
      let left = e.clientX;

      for (let i = 0; i < calculatedItems.length; i++) {
        left += calculatedItems[i]?.duration * widthLabels * scale || 0;
      }
      setDraggedItemStartTime(left / (widthLabels * scale));
    }
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleResizeMouseMove);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleResizeMouseMove);
    };
  }, [handleResizeMouseMove]);

  const zoomIn = () => setZoomMod((prev) => Math.min(prev + 1, zoomLevels.length - 1));
  const zoomOut = () => setZoomMod((prev) => Math.max(prev - 1, 0));

  useEffect(() => setScale(zoomLevels[zoomMod]), [zoomMod]);

  useEffect(() => {
    let timeoutId;

    const handleWheel = (event) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (event.deltaY > 0) {
          zoomOut();
        } else {
          zoomIn();
        }
      }, 200);
    };

    window.addEventListener("wheel", handleWheel);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      clearTimeout(timeoutId);
    };
  }, [zoomIn, zoomOut]);

  const calculateItems = useCallback((items) => {
    const calculated = items.map((item, index) => {
      let left = item.startTime * widthLabels * scale;
      for (let i = 0; i < index; i++) {
        left -= items[i].duration * widthLabels * scale;
      }
      const top = itemsContentRef.current ? (item.priority - 1) * (1188.7 / 4) : 0;
      return { ...item, left, top, width: item.duration * widthLabels * scale };
    });
    setCalculatedItems(calculated);
  }, [scale]);

  useEffect(() => calculateItems(items), [items, scale, calculateItems]);

  const handleScroll = (e) => {
    const { scrollLeft } = e.target;
    setScrollPosition(scrollLeft);
    if (timeLabelsRef.current && itemsContentRef.current) {
      timeLabelsRef.current.scrollLeft = scrollLeft;
      itemsContentRef.current.scrollLeft = scrollLeft;
    }
  };

  const generateTimeLabels = () => {
    const labels = [];
    const stepMinutes = [60, 30, 15, 10, 5, 1][zoomMod];
    const stepWidth = widthLabels / (60 / stepMinutes) * scale;

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += stepMinutes) {
        labels.push(
          <div key={`${hour}-${minute}`} className="hour-label" style={{ minWidth: `${stepWidth}px` }}>
            {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
          </div>
        );
      }
    }
    return labels;
  };

  const generateItemLabels = () => calculatedItems.map((item) => (
    <div
      key={item.id}
      className="item"
      style={{
        overflow: 'hidden',
        minWidth: `${item.id === resizingItem?.id && visualWidth !== null ? visualWidth : item.width}px`,
        height: `20%`,
        left: `${item.id === resizingItem?.id && visualLeft !== null ? visualLeft : item.left}px`,
        top: `${item.top}px`,
        position: "relative"
      }}
      onMouseDown={(e) => handleMouseDown(e, item)}
      onClick={() => handleItemClick(item)}
    >
      <div className="resize-handle resize-handle-left" onMouseDown={(e) => handleResizeMouseDown(e, item, 'left')} />
      <div className="resize-handle resize-handle-right" onMouseDown={(e) => handleResizeMouseDown(e, item, 'right')} />
    </div>
  ));

  useEffect(() => {
    const widths = [3600, 7200, 14400, 43200, 129600, 518400];
    setContentWidth(widths[zoomMod]);
  }, [zoomMod]);

  useEffect(() => {
    const scrollToCurrentTime = () => {
      const currentTime = getCurrentTime();
      const currentPosition = currentTime * widthLabels * scale;
      if (timeLabelsRef.current && itemsContentRef.current) {
        timeLabelsRef.current.scrollLeft = currentPosition;
        itemsContentRef.current.scrollLeft = currentPosition;
      }
    };
    scrollToCurrentTime();
  }, [scale]);

  return (
    <div className="timeline-wrapper" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, convertDecimalToTime(position.x / (widthLabels * scale)), position.x / (widthLabels * scale))}>
      <div className="time-labels-wrapper" onScroll={handleScroll} ref={timeLabelsRef} style={{ width: `${contentWidth}px` }}>
        {generateTimeLabels()}
      </div>
      <div className="items-content-wrapper" onScroll={handleScroll} ref={itemsContentRef} onMouseMove={handleMouseMoveDrag} onMouseUp={handleMouseUp} style={{ width: `${contentWidth}px` }}>
        {generateItemLabels()}
      </div>
    </div>
  );
};

export default Timeline;
