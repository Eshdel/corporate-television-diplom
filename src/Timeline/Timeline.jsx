import React, { useState, useRef, useEffect } from "react";
import "./Timeline.css";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const convertDecimalToTime = (decimalTime) => {
  let hours = Math.floor(decimalTime);
  let minutes = Math.floor((decimalTime - hours) * 60);
  let seconds = Math.round(((decimalTime - hours) * 60 - minutes) * 60);

  if (seconds === 60) {
    seconds = 0;
    minutes += 1;
  }
  if (minutes === 60) {
    minutes = 0;
    hours += 1;
  }

  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return formattedTime;
};

const Timeline = ({ items, updateItemStartTime, updateItemPriority, setSelectedItem, handleDrop, leftPanelItemDrag}) => {
  const widthLabels = 300;

  const [scrollPosition, setScrollPosition] = useState(0);
  const timeLabelsRef = useRef(null);
  const itemsContentRef = useRef(null);
  
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragStartPosition, setDragStartPosition] = useState(null);
  const [draggedItemStartTime,setDraggedItemStartTime] = useState(null);
  
  const [zoomMod, setZoomMod] = useState(1); // Начальное значение масштаба 1 (обычный масштаб)
  const [scale, setScale] = useState(1);
  const [contentWidth, setContentWidth] = useState(0);

  const getCurrentTime = () => {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return hours + (minutes / 60); // Возвращает текущее время в часах с учетом минут
  };
  

  const handleItemClick = (item) => {
    setSelectedItem(item); // Вызываем setSelectedItem с выбранным элементом
  };

  const handleMouseDown = (e, item) => {
    const currentDateTime = new Date();
    
    if (currentDateTime.getTime() > item.startMicroTime) {
      toast.info("The old date and time have already passed");
      return;
    }
    
    setDraggedItem(item);
    setDraggedElement(e);
    setDragStartPosition({
      x: e.clientX,
      y: e.clientY,
      left: parseFloat(e.target.style.left),
      top: parseFloat(e.target.style.top)
    });
  };
  
  const handleMouseMove = (e) => {
    if (draggedItem) {
      const deltaX = e.clientX - dragStartPosition.x;
      const deltaY = e.clientY - dragStartPosition.y;
      const newLeft = dragStartPosition.left + deltaX;
      const newTop = dragStartPosition.top + deltaY;
      //draggedElement.target.style.top = `${newTop}px`;
      draggedElement.target.style.left = `${newLeft}px`;

      // Вычисляем новое значение startTime
      let left = newLeft;
      const indexItem = items.findIndex(item => item.id === draggedItem.id);

      for(let i = 0; i < indexItem; i++) {
        left += items[i].duration * widthLabels * scale;
      }

      setDraggedItemStartTime(left / (widthLabels * scale));
    }

    if(leftPanelItemDrag) {
      let left = e.clientX;

      for(let i = 0; i < items.length; i++) {
        left += items[i].duration * widthLabels * scale;
      }
      setDraggedItemStartTime(left / (widthLabels * scale));
    }
    
  };

  const handleMouseUp = () => {
    // Обновляем startTime элемента в данных items
    if(draggedItem && draggedItemStartTime) {
      const formattedStartTime = convertDecimalToTime(draggedItemStartTime);
      updateItemStartTime(draggedItem.id, draggedItem.startDate, formattedStartTime);
    }

    // if(draggedItem)  {
    //   const parentHeight = draggedElement.target.parentNode.clientHeight;
    //   const elementHeight = draggedElement.target.clientHeight;
    //   const level = Math.min(4, Math.max(1, Math.ceil((draggedElement.target.offsetTop + elementHeight / 2) / (parentHeight / 4))));
    //   const newTop = (level - 1) * (parentHeight / 4);

    //   draggedElement.target.style.top = `${newTop}px`;

    //   updateItemPriority(draggedItem.id, level);
    // }
    
    setDraggedElement(null);
    setDraggedItemStartTime(null);
    setDraggedItem(null);
    setDragStartPosition(null);
  };

  useEffect(() => {
    const handleMouseUpOutside = () => {
      if (draggedItem) {
        setDraggedElement(null);
        setDraggedItemStartTime(null);
        setDraggedItem(null);
        setDragStartPosition(null);
      }
    };

    window.addEventListener("mouseup", handleMouseUpOutside);

    return () => {
      window.removeEventListener("mouseup", handleMouseUpOutside);
    };
  }, [draggedItem]);

  const zoomIn = () => {
    if(zoomMod < 5) {
      setZoomMod(zoomMod + 1);
    }
  };
  
  const zoomOut = () => {
    if (zoomMod > 0) {
      setZoomMod(zoomMod - 1);
    }
  };

  const updateScale = () => {
    switch(zoomMod) {
      case 0:
        setScale(0.5);
        break
      case 1:
        setScale(1);
        break
      case 2:
        setScale(2);
        break
      case 3:
        setScale(6);
        break
      case 4:
        setScale(18);
        break;
      case 5:
        setScale(72);
        break;
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "6") {
        zoomIn();
      } else if (event.key === "7") {
        zoomOut();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
  
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoomIn, zoomOut]);

  useEffect(() => {
    updateScale();
  }, [zoomMod]); // вызываем updateScale при изменении zoomMod

  function getItemReact(item, indexItem) {
    let left = item.startTime * widthLabels * scale; 
    
    for(let i = 0; i < indexItem; i++) {
      left -= items[i].duration * widthLabels * scale
    }
    let newTop = 0;

    if(itemsContentRef && itemsContentRef.current) {
      newTop = (item.priority - 1) * (1188.7 / 4);
    }
    
    return { ...item, left: left, top: newTop, width: item.duration * widthLabels * scale};    
  }

  // Обработчик события прокрутки
  const handleScroll = (e) => {
    const { scrollLeft } = e.target;
    setScrollPosition(scrollLeft);
    // Устанавливаем прокрутку для обоих элементов
    if (timeLabelsRef.current && itemsContentRef.current) {
      timeLabelsRef.current.scrollLeft = scrollLeft;
      itemsContentRef.current.scrollLeft = scrollLeft;
    }
  };

  const generateTimeLabels = () => {
    const labels = [];
    switch (zoomMod) {
      case 0:
        // Режим 0: показываем только часы (0-23)
        for (let hour = 0; hour < 24; hour++) {
          labels.push(
            <div key={hour} className="hour-label" style={{ minWidth: `${widthLabels * scale}px` }}>
              {hour}:00
            </div>
          );
        }
        break;
      case 1:
        // Режим 1: показываем часы и промежутки по 30 минут между ними
        for (let hour = 0; hour < 24; hour++) {
          labels.push(
            <div key={hour} className="hour-label" style={{ minWidth: `${widthLabels / 2 * scale}px` }}>
              {hour}:00
            </div>
          );
          labels.push(
            <div key={`${hour}-30`} className="hour-label" style={{ minWidth: `${widthLabels / 2 * scale}px` }}>
              {hour}:30
            </div>
          );
        }
        break;
      case 2:
        // Режим 2: показываем часы и промежутки по 15 минут между ними
        for (let hour = 0; hour < 24; hour++) {
          for (let minute = 0; minute < 60; minute += 15) {
            labels.push(
              <div key={`${hour}-${minute}`} className="hour-label" style={{ minWidth: `${widthLabels / 4 * scale}px` }}>
                {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
              </div>
            );
          }
        }
        break;
      case 3:
        for (let hour = 0; hour < 24; hour++) {
          for (let minute = 0; minute < 60; minute += 10) {
            labels.push(
              <div key={`${hour}-${minute}`} className="hour-label" style={{ minWidth: `${widthLabels / 6 * scale}px` }}>
                {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
              </div>
            );
          }
        }
        break;

      case 4:
        for (let hour = 0; hour < 24; hour++) {
          for (let minute = 0; minute < 60; minute += 5) {
            labels.push(
              <div key={`${hour}-${minute}`} className="hour-label" style={{ minWidth: `${widthLabels / 12 * scale}px` }}>
                {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
              </div>
            );
          }
        }
        break;

      case 5:
        for (let hour = 0; hour < 24; hour++) {
          for (let minute = 0; minute < 60; minute += 1) {
            labels.push(
              <div key={`${hour}-${minute}`} className="hour-label" style={{ minWidth: `${widthLabels / 60 * scale}px` }}>
                {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
              </div>
            );
          }
        }
        break;
    }
    return labels;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  function generateItemLabels (items) {
    const itemsReact = [];
    
    for (let i = 0; i < items.length; i++) {
      const currentItem = getItemReact(items[i], i);
      
      // Определяем ширину и левый отступ для текущего элемента

      const itemWidth = parseFloat(currentItem.width); // Преобразуем ширину в число
      const itemLeft = parseFloat(currentItem.left); // Преобразуем левый отступ в число
      const itemTop = parseFloat(currentItem.top);
      // Создаём элемент React для текущего элемента
      const itemElement = (
        <div 
          key={currentItem.id} 
          className="item" 
          style={{overflow: 'hidden', minWidth: `${itemWidth}px`, height: `20%`,  left: `${itemLeft}px`, top:`${itemTop}px`, position: "relative"}}
          onMouseDown={(e) => handleMouseDown(e, currentItem)}
          onClick={() => handleItemClick(items[i])} // Добавляем обработчик клика
        >
        </div>);
  
      itemsReact.push(itemElement); // Добавляем текущий элемент в список
  
    }
  
    return itemsReact;
  }

  const updateContentWidth = () => {
    if (timeLabelsRef.current) {
      switch(zoomMod) {
        case 0:
          setContentWidth(3600);
          break;
        case 1:
          setContentWidth(7200); // 30
          break;
        case 2:
          setContentWidth(14400); // 15
          break;
        case 3:
          setContentWidth(43200); // 10
          break;
        case 4:
          setContentWidth(129600); // 5
          break;
        case 5:
          setContentWidth(518400); // 1
          break;
      }
    }
  };

  useEffect(() => {
    updateContentWidth();
  }, [zoomMod]);

  useEffect(() => {
    updateContentWidth();
  }, []);

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
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return (
    <div className="timeline-wrapper"  onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, getCurrentTime())}>
      <div
        className="time-labels-wrapper"
        onScroll={handleScroll}
        ref={timeLabelsRef}
        style={{ width: `${contentWidth}px`}}
      >
        {generateTimeLabels()}
      </div>
      <div
        className="items-content-wrapper"
        onScroll={handleScroll}
        ref={itemsContentRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ width: `${contentWidth}px`}}
      >
        {generateItemLabels(items)}
      </div>
    </div>
  );
};

export default Timeline;