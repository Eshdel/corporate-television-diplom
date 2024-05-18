import React, { useState, useRef } from "react";
import "./App.css";
import Timeline from "./Timeline/Timeline";
import ItemOptionHolder from "./ItemOptionHolder/ItemOptionHolder";
import TrashBin from "./TrashBin/Trashbin";

function App() {
  const [draggedItem, setDraggedItem] = useState(null);
  const [items, setItems] = useState([]);
  const [elementsOnTimeline, setElementsOnTimeline] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showTrashBin, setShowTrashBin] = useState(false);
  const fileInputRef = useRef(null);

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
        id: Math.random(),
        name: draggedItem.name,
        startTime: startTime,
        duration: draggedItem.duration,
        priority: 1,
        type: draggedItem.type
      };
      setElementsOnTimeline(prevItems => [...prevItems, newItem]);
      setShowTrashBin(false);
    }
  };

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

  const deleteItemFromTimeline = (itemId) => {
    setElementsOnTimeline(prevItems => prevItems.filter(item => item.id !== itemId));
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
        id: Math.random(), // Уникальный идентификатор для каждого элемента
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
      <div className="list-item-holder" onDrop={handleFileDrop} onDragOver={(e) => e.preventDefault()} style={{ position: 'relative' }}>
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
      {selectedItem && <ItemOptionHolder selectedItem={selectedItem} updateStartTime={updateItemStartTime} deleteItem={deleteItemFromTimeline} />}
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