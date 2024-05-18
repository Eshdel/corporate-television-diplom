import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import Timeline from "./Timeline/Timeline";
import ItemOptionHolder from "./ItemOptionHolder/ItemOptionHolder";

function App() {
  const [draggedItem, setDraggedItem] = useState(null); // Хранение данных о перетаскиваемом элементе

  const [items,setItems] = useState([]);

  const [elementsOnTimeline, setElementsOnTimeline] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);

  const fileInputRef = useRef(null);
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
  
  const handleFileDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    const newItems = files.map(file => {
      let type;
      if (file.type.startsWith('image/')) {
        type = 'image';
      } else if (file.type.startsWith('video/')) {
        type = 'video';
      } else if (file.type === 'application/pdf') {
        type = 'presentation';
      } else {
        return null;
      }
      return {
        name: file.name,
        duration: 1,
        type: type
      };
    }).filter(item => item !== null);
    setItems(prevItems => [...prevItems, ...newItems]);
  };
  
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="container">
      <div className="list-item-holder" onDrop={handleFileDrop} onDragOver={(e) => e.preventDefault()}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          multiple
          onChange={handleFileChange}
        />
        <button className="upload-button" onClick={handleUploadClick}>Upload file</button>
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