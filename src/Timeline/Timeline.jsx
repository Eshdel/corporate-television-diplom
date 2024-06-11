import React, { useState, useRef, useEffect, useCallback } from "react";
import "./Timeline.css";
import 'react-toastify/dist/ReactToastify.css';

const zoomLevels = [0.5, 1, 2, 6, 18, 72];
const widthLabels = 300;

const Timeline = ({ items, updateItemStartTime, updateItemDuration, setSelectedItem, handleDrop }) => {
  const timeLabelsRef = useRef(null);
  const itemsContentRef = useRef(null);

  const [scrollPosition, setScrollPosition] = useState(0);
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragStartPosition, setDragStartPosition] = useState(null);
  const [draggedItemStartTime, setDraggedItemStartTime] = useState(null);

  const [resizingItem, setResizingItem] = useState(null);
  const [resizeDirection, setResizeDirection] = useState(null);

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
    if (resizingItem && resizingItem.sourceType != 'video') {
      const deltaX = e.clientX - dragStartPosition.x;
      let newWidth = dragStartPosition.width + (resizeDirection === 'right' ? deltaX : -deltaX);
      let newLeft = dragStartPosition.left + (resizeDirection === 'left' ? deltaX : 0);

      if (newWidth < 0) newWidth = 10;

      setCalculatedItems((prevItems) =>
        prevItems.map((item) =>
          item.id === resizingItem.id
            ? { ...item, left: newLeft, width: newWidth }
            : item
        )
      );
    }
  }, [dragStartPosition, resizeDirection, resizingItem]);

  const handleMouseUp = () => {
    if (resizingItem) {
      const resizedItem = calculatedItems.find(item => item.id === resizingItem.id);
      if (resizedItem) {
        const newDuration = resizedItem.width / (widthLabels * scale);
        const newStartTime = resizedItem.startTime + (resizedItem.left - resizingItem.left) / (widthLabels * scale);
  
        updateItemDuration(resizedItem.id, newDuration);
        updateItemStartTime(resizedItem.id, resizedItem.startDate, newStartTime);

        // Логика для корректировки наложения элементов
        const updatedItems = [...calculatedItems];
        updatedItems.forEach((item, index) => {
          if (item.id !== resizingItem.id) {
            const isOverlap = (
              (item.startTime > newStartTime  && newStartTime + newDuration > item.startTime) ||
              (item.startTime < newStartTime && item.startTime + item.duration > newStartTime)
            );

            if (isOverlap) {
              if (newStartTime < item.startTime) {
                const otherItemStartTime = newStartTime + newDuration;
                item.startTime = otherItemStartTime;
                updateItemStartTime(item.id, item.startDate, otherItemStartTime);

                let left = otherItemStartTime * widthLabels * scale;
                const indexItem = calculatedItems.findIndex(_item => _item.id === item.id);
                for (let i = 0; i < indexItem; i++) {
                  left -= calculatedItems[i]?.duration * widthLabels * scale || 0;
                }

                document.getElementById(`item-${item.id}`).style.left = `${left}px`;
              } else {
                const newItemStartTime = item.startTime + item.duration;
                resizedItem.startTime = newItemStartTime;
                
                let left = newItemStartTime * widthLabels * scale;
                const indexItem = calculatedItems.findIndex(_item => _item.id === item.id);
                for (let i = 0; i < indexItem; i++) {
                  left -= calculatedItems[i]?.duration * widthLabels * scale || 0;
                }

                document.getElementById(`item-${resizingItem.id}`).style.left = `${left}px`;
                updateItemStartTime(resizedItem.id, resizedItem.startDate, newItemStartTime);
              }
            }
          }
        });
      }
    }
  
    setResizingItem(null);
    setResizeDirection(null);
  
    if (draggedItem && draggedItemStartTime !== null) {
      let newStartTime = draggedItemStartTime; // Локальная переменная для хранения нового времени начала
  
      // Логика для корректировки наложения элементов
      const updatedItems = [...calculatedItems];
      updatedItems.forEach((item, index) => {
        if (item.id !== draggedItem.id) {
          const isOverlap = (
            (item.startTime < newStartTime && item.startTime + item.duration > newStartTime) ||
            (item.startTime > newStartTime && newStartTime + draggedItem.duration > item.startTime)
          );
  
          if (isOverlap) {
            if (newStartTime > item.startTime) {
              newStartTime = item.startTime + item.duration;
            }
            else {
              const otherItemStartTime = newStartTime + draggedItem.duration;
              item.startTime = otherItemStartTime;
              let left = otherItemStartTime * widthLabels * scale;
              const indexItem = calculatedItems.findIndex(_item => _item.id === item.id);
              for (let i = 0; i < indexItem; i++) {
                left -= calculatedItems[i]?.duration * widthLabels * scale || 0;
              }

              document.getElementById(`item-${item.id}`).style.left = `${left}px`;
              updateItemStartTime(item.id, item.startDate, otherItemStartTime);
          }
          }
        }
      });

      let left = newStartTime * widthLabels * scale;
      const indexItem = calculatedItems.findIndex(item => item.id === draggedItem.id);
      for (let i = 0; i < indexItem; i++) {
        left -= calculatedItems[i]?.duration * widthLabels * scale || 0;
      }

      draggedElement.target.style.left = `${left}px`;
      updateItemStartTime(draggedItem.id, draggedItem.startDate, newStartTime); // Использование локальной переменной
    }
  
    setDraggedElement(null);
    setDraggedItemStartTime(null);
    setDraggedItem(null);
    setDragStartPosition(null);
  };
  
  const handleMouseMoveDrag = (e) => {
    if (draggedItem) {
      console.log("draggg");
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
      if (!event.altKey) return; // Проверяем, удерживается ли клавиша Ctrl
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (event.deltaY > 0) {
          zoomOut();
        } else {
          zoomIn();
        }
      }, 200);
    };
  
    const element = itemsContentRef.current;
    if (element) {
      element.addEventListener("wheel", handleWheel, { passive: true });
    }
  
    return () => {
      if (element) {
        element.removeEventListener("wheel", handleWheel);
      }
      clearTimeout(timeoutId);
    };
  }, [zoomIn, zoomOut]);

  const calculateItems = useCallback((items) => {
    const sortedItems = [...items].sort((a, b) => a.startTime - b.startTime);
    const calculated = sortedItems.map((item, index) => {
      let left = item.startTime * widthLabels * scale;
      for (let i = 0; i < index; i++) {
        left -= sortedItems[i].duration * widthLabels * scale;
      }
      const top = itemsContentRef.current ? (item.priority - 1) * (1188.7 / 4) : 0;
      return { ...item, left, top, width: item.duration * widthLabels * scale };
    });
    setCalculatedItems(calculated);
    console.log('calculate items');
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
      id={`item-${item.id}`}
      className="item"
      style={{
        overflow: 'hidden',
        minWidth: `${item.width}px`,
        height: `20%`,
        left: `${item.left}px`,
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
    <div className="timeline-wrapper" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, position.x / (widthLabels * scale))}>
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