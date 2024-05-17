import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import Timeline from "./Timeline/Timeline";
import ItemOptionHolder from "./ItemOptionHolder/ItemOptionHolder";

function App() {
  const [draggedItem, setDraggedItem] = useState(null); // Хранение данных о перетаскиваемом элементе

  const [items,setItems] = useState([
    {
      name: 'Image №1',
      duration: 1,
      type: "image"
    },
    {
      name: 'Video №2',
      duration: 1,
      type: "video"
    },
    {
      name: 'Presentation №3',
      duration: 1,
      type: "presentation"
    },
    {
      name: 'Presentation №4',
      duration: 1,
      type: "presentation"
    }
  ]);

  const [elementsOnTimeline, setElementsOnTimeline] = useState([
    {id: 0, name: 'Image №1', startTime: 0.25, duration: 0.5, priority: 1, type: "image"},
    {id: 1, name: 'Video №2', startTime: 1, duration: 1, priority: 2, type: "video"},
    {id: 2, name: 'Presentation №3', startTime: 3, duration: 2, priority: 3, type: "presentation"},
    {id: 3, name: 'Presentation №4', startTime: 4, duration: 1, priority: 4, type: "presentation"}
  ]);

  const [selectedItem, setSelectedItem] = useState(null);

  
  // Обработчик начала перетаскивания элемента
  const handleDragStart = (e, item) => {
    setDraggedItem(item); // Сохраняем данные о перетаскиваемом элементе

  };

  // Обработчик окончания перетаскивания элемента
  const handleDragEnd = () => {
    setDraggedItem(null); // Сбрасываем данные о перетаскиваемом элементе
  };

  // Обработчик добавления элемента на таймлайн
  const handleDrop = (e, startTime) => {
    e.preventDefault();

    if (draggedItem) {
      const newItem = {
        id: Math.random(),
        name: draggedItem.name,
        startTime: startTime,
        duration: draggedItem.duration,
        priority: 1, // Значение priority по умолчанию
        type: draggedItem.type
      };

      setElementsOnTimeline(prevItems => [...prevItems, newItem]); // Добавляем элемент на таймлайн
    }
  };
  // Функция для обновления данных items
  const updateItemStartTime = (itemId, newStartTime) => {
    setElementsOnTimeline(prevItems => prevItems.map(item => 
      item.id === itemId ? { ...item, startTime: newStartTime } : item
    ));
  };

  const updateItemPriority = (itemId, newPriority) => {
    setElementsOnTimeline(prevItems => prevItems.map(item => 
      item.id === itemId ? { ...item, priority: newPriority } : item
    ));
  };
  


  return (
    <div className="container">
      <div className="list-item-holder">
        <button className="upload-button">Upload file</button>
        <button className="save-button">Save</button>
        {items.map((item, index) => (
          <div 
          className="list-item" 
          key={index}  
          draggable
          onDragStart={(e) => handleDragStart(e, item)}
          onDragEnd={handleDragEnd}
          >
            <p style={{marginLeft:" 8px"}}>Name: {item.name}</p>
            <p style={{marginLeft:" 8px"}}>Type: {item.type}</p>
          </div>
        ))}
      </div>
      <div className="timeline-holder">
        <Timeline 
        items={elementsOnTimeline} 
        updateItemStartTime={updateItemStartTime} 
        updateItemPriority={updateItemPriority} 
        setSelectedItem={setSelectedItem}
        handleDrop={handleDrop} // Передаем функцию handleDrop в Timeline компонент
        />
      </div>
      {/* Условный рендеринг для отображения ItemOptionHolder */}
      {selectedItem && <ItemOptionHolder selectedItem={selectedItem} updateStartTime={updateItemStartTime} />}
    </div>
  );
}
export default App;