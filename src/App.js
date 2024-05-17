import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import Timeline from "./Timeline/Timeline";
import ItemOptionHolder from "./ItemOptionHolder/ItemOptionHolder";

function App() {
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
    {id: 0, name: 'Video №2', startTime: 1, duration: 1, priority: 2, type: "video"},
    {id: 0, name: 'Presentation №3', startTime: 3, duration: 2, priority: 3, type: "presentation"},
    {id: 0, name: 'Presentation №4', startTime: 4, duration: 1, priority: 4, type: "presentation"}
  ]);

  const [selectedItem, setSelectedItem] = useState(null);

  // Функция для обновления данных items
  const updateItemStartTime = (itemName, newStartTime) => {
    setElementsOnTimeline(prevItems => prevItems.map(item => 
      item.name === itemName ? { ...item, startTime: newStartTime } : item
    ));
  };

  const updateItemPriority = (itemName, newPriority) => {
    setElementsOnTimeline(prevItems => prevItems.map(item => 
      item.name === itemName ? { ...item, priority: newPriority } : item
    ));
  };

  return (
    <div className="container">
      <div className="list-item-holder">
        <button className="upload-button">Upload file</button>
        <button className="save-button">Save</button>
        {items.map((item, index) => (
          <div className="list-item" key={index}>
            <p style={{marginLeft:" 8px"}}>Name: {item.name}</p>
            <p style={{marginLeft:" 8px"}}>Type: {item.type}</p>
          </div>
        ))}
      </div>
      <div className="timeline-holder">
        <Timeline items={elementsOnTimeline} updateItemStartTime={updateItemStartTime} updateItemPriority={updateItemPriority} setSelectedItem={setSelectedItem}></Timeline>
      </div>
      {/* Условный рендеринг для отображения ItemOptionHolder */}
      {selectedItem && <ItemOptionHolder selectedItem={selectedItem} updateStartTime={updateItemStartTime} />}
    </div>
  );
}
export default App;