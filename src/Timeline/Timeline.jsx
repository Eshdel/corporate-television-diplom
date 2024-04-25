import React, { useState, useRef, useEffect } from "react";
import "./Timeline.css";

const Timeline = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const timeLabelsRef = useRef(null);
  const itemsContentRef = useRef(null);
  const [emptyItems, setEmptyItems] = useState([]);

  useEffect(() => {
    if (timeLabelsRef.current && itemsContentRef.current) {
      const labelsWidth = timeLabelsRef.current.scrollWidth;
      const itemsWidth = itemsContentRef.current.scrollWidth;
      const itemCount = Math.ceil((labelsWidth - itemsWidth) / getItemWidth());
      const emptyItemsArray = Array(itemCount).fill(null);
      setEmptyItems(emptyItemsArray);
    }
  }, []);

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

  // Получение ширины элемента
  const getItemWidth = () => {
    return 500; // Ваша логика для вычисления ширины элемента
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

  // Генерация элементов контента
  const generateItems = () => {
    const labels = [];
    for (let hour = 0; hour < 10; hour++) {
      labels.push(
        <div key={hour} className="item">
          item {hour}
        </div>
      );
    }
    return labels;
  };

  // Генерация пустых элементов
  const generateEmptyItems = () => {
    return emptyItems.map((_, index) => (
      <div key={`empty-${index}`} className="item empty"></div>
    ));
  };

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
        {generateItems()}
        {generateEmptyItems()}
      </div>
    </div>
  );
};

export default Timeline;
