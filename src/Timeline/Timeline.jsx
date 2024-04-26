import React, { useState, useRef, useEffect } from "react";
import "./Timeline.css";

const Timeline = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const timeLabelsRef = useRef(null);
  const itemsContentRef = useRef(null);

  const items = [
    { name: 'Item 1', startTime: '0', duration: '0.1'},
    { name: 'Item 2', startTime: '1', duration: '1'},
    { name: 'Item 3', startTime: '2.1', duration: '2'}
  ];

  function getItemReact(item) {
    return {name: item.name,left: item.startTime * 300, width: item.duration * 300}    
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

  // Генерация временных меток для панели времени
  const generateTimeLabels = () => {
    const labels = [];
    for (let hour = 0; hour < 24; hour++) {
      labels.push(
        <div key={hour} className="hour-label">
          {hour}:00
        </div>
      );
    }
    return labels;
  };

  function generateItemLabels (items) {
    const itemsReact = [];
    
    let prevItemRight = 0; // Переменная для хранения правой границы предыдущего элемента
  
    for (let i = 0; i < items.length; i++) {
      const currentItem = getItemReact(items[i]);
      
      // Определяем ширину и левый отступ для текущего элемента
      const itemWidth = parseFloat(currentItem.width); // Преобразуем ширину в число
      const itemLeft = parseFloat(currentItem.left); // Преобразуем левый отступ в число
  
      // Проверяем, нужно ли добавить пустое пространство между предыдущим и текущим элементом
      if (itemLeft > prevItemRight) {
        const emptyWidth = itemLeft - prevItemRight; // Вычисляем ширину пустого пространства
        const spaceItem = (
          <div key={`spaceItem-${i}`} className="spaceItem" style={{ minWidth: `${emptyWidth}px`, backgroundColor: 'white' }}></div>
        );
        itemsReact.push(spaceItem); // Добавляем пустое пространство
      }
      
      // Создаём элемент React для текущего элемента
      const itemElement = (
        <div key={currentItem.name} className="item" style={{ minWidth: `${itemWidth}px`, left: currentItem.left }}>
          {currentItem.name}
        </div>
      );
  
      itemsReact.push(itemElement); // Добавляем текущий элемент в список
  
      prevItemRight = itemLeft + itemWidth; // Обновляем правую границу предыдущего элемента
    }
  
    if(timeLabelsRef.current && prevItemRight < timeLabelsRef.current.scrollWidth){
      const emptyWidth = timeLabelsRef.current.scrollWidth - prevItemRight; // Вычисляем ширину пустого пространства
      const spaceItem = (
        <div key={`spaceItem-end`} className="spaceItem" style={{ minWidth: `${emptyWidth}px`, backgroundColor: 'black' }}></div>
      );

      itemsReact.push(spaceItem);
    }

    return itemsReact;
  }

  return (
    <div className="timeline-wrapper">
      <div
        className="time-labels-wrapper"
        onScroll={handleScroll}
        ref={timeLabelsRef}
      >
        {generateTimeLabels()}
      </div>
      <div
        className="items-content-wrapper"
        onScroll={handleScroll}
        ref={itemsContentRef}
      >
        {generateItemLabels(items)}
      </div>
    </div>
  );
};

export default Timeline;
