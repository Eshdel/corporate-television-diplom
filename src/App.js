import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import Timeline from "./Timeline/Timeline";
import ItemOptionHolder from "./ItemOptionHolder/ItemOptionHolder";
import TrashBin from "./TrashBin/Trashbin";
import DatePicker from "./DatePicker/DatePicker";

function App() {
  const [draggedItem, setDraggedItem] = useState(null);
  const [items, setItems] = useState([]);
  const [allElementsOnTimeline, setAllElementsOnTimeline] = useState([]);
  const [elementsOnTimeline, setElementsOnTimeline] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().substring(0, 10));
  const [selectedItem, setSelectedItem] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showTrashBin, setShowTrashBin] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const filteredElements = allElementsOnTimeline.filter(item => item.startDate === selectedDate);
    setElementsOnTimeline(filteredElements);
  }, [selectedDate, allElementsOnTimeline]);

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    setShowTrashBin(true);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setShowTrashBin(false);
  };

  const handleDropOnTimeline = (e, startTime) => {
    e.preventDefault();
    if (draggedItem) {
      const newItem = {
        id: Math.floor(Math.random() * 2147483647),
        name: draggedItem.name,
        startTime: startTime,
        duration: draggedItem.duration,
        priority: 1,
        type: draggedItem.type,
        startDate: selectedDate
      };
      setAllElementsOnTimeline(prevItems => [...prevItems, newItem]);
      setShowTrashBin(false);
    }
  };

  const updateItemStartTime = (itemId, newStartTime) => {
    setAllElementsOnTimeline(prevItems => prevItems.map(item => 
      item.id === itemId ? { ...item, startTime: newStartTime } : item
    ));
  };

  const updateItemDuration = (itemId, newDuration) => {
    setAllElementsOnTimeline(prevItems => prevItems.map(item => 
      item.id === itemId ? { ...item, duration: newDuration } : item
    ));
  };

  const updateItemPriority = (itemId, newPriority) => {
    setAllElementsOnTimeline(prevItems => prevItems.map(item => 
      item.id === itemId ? { ...item, priority: newPriority } : item
    ));
  };

  const deleteItemFromTimeline = (itemId) => {
    setAllElementsOnTimeline(prevItems => prevItems.filter(item => item.id !== itemId));
    setSelectedItem(null);
  };

  const deleteItemFromList = (item) => {
    setItems(prevItems => prevItems.filter(i => i.id !== item.id));
  };

  const handleDropOnTrashBin = (e) => {
    e.preventDefault();
    if (draggedItem) {
      setItemToDelete(draggedItem);
      setShowConfirm(true);
      setShowTrashBin(false);
    }
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteItemFromList(itemToDelete);
    }
    setShowConfirm(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setItemToDelete(null);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
    e.target.value = null; // Добавляем сброс значения input
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
        id: Math.floor(Math.random() * 2147483647), // Уникальный идентификатор для каждого элемента
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

  const addRepeatingItems = (item, frequency, untilDate, repeatDays, repeatWeeks, repeatMonths) => {
    const until = new Date(untilDate);
    let currentDate = new Date(selectedDate);
  
    // Remove existing repeating items
    setAllElementsOnTimeline(prevItems => prevItems.filter(i => i.originalId !== item.id));
  
    const newItems = [];
  
    while (currentDate <= until) {
      if (frequency === 'daily') {
        if (repeatDays[currentDate.getDay()] && currentDate.toISOString().substring(0, 10) !== item.startDate) {
          newItems.push({
            ...item,
            id: Math.floor(Math.random() * 2147483647),
            startDate: currentDate.toISOString().substring(0, 10),
            originalId: item.id
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (frequency === 'weekly') {
        if (currentDate.toISOString().substring(0, 10) !== item.startDate) {
          newItems.push({
            ...item,
            id: Math.floor(Math.random() * 2147483647),
            startDate: currentDate.toISOString().substring(0, 10),
            originalId: item.id
          });
        }
        currentDate.setDate(currentDate.getDate() + (7 * repeatWeeks));
      } else if (frequency === 'monthly') {
        if (currentDate.toISOString().substring(0, 10) !== item.startDate) {
          newItems.push({
            ...item,
            id: Math.floor(Math.random() * 2147483647),
            startDate: currentDate.toISOString().substring(0, 10),
            originalId: item.id
          });
        }
        currentDate.setMonth(currentDate.getMonth() + repeatMonths);
      }
    }
  
    setAllElementsOnTimeline(prevItems => [...prevItems, ...newItems]);
  };
  

  return (
    <div className="container">
      <div className="list-item-holder" onDrop={handleFileDrop} onDragOver={(e) => e.preventDefault()} style={{ position: 'relative' }}>
        <DatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} /> {/* Добавляем компонент выбора даты */}
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
            key={item.id}  // Используем уникальный идентификатор в качестве ключа
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onDragEnd={handleDragEnd}
          >
            <p style={{marginLeft:" 8px"}}>Name: {item.name}</p>
            <p style={{marginLeft:" 8px"}}>Type: {item.type}</p>
          </div>
        ))}
        <TrashBin isVisible={showTrashBin} onDragOver={(e) => e.preventDefault()} onDrop={handleDropOnTrashBin} />
      </div>
      
      <div className="timeline-holder">
        <Timeline 
          items={elementsOnTimeline} 
          updateItemStartTime={updateItemStartTime} 
          updateItemPriority={updateItemPriority} 
          setSelectedItem={setSelectedItem}
          handleDrop={handleDropOnTimeline}
        />
      </div>
      {selectedItem && (
        <ItemOptionHolder 
          selectedItem={selectedItem} 
          updateStartTime={updateItemStartTime} 
          updateDuration={updateItemDuration} 
          deleteItem={deleteItemFromTimeline} 
          addRepeatingItems={addRepeatingItems} 
        />
      )}
      {showConfirm && (
        <div className="confirm-dialog">
          <p>Are you sure you want to delete this item?</p>
          <button onClick={confirmDelete}>Yes</button>
          <button onClick={cancelDelete}>No</button>
        </div>
      )}
    </div>
  );
}

export default App;
