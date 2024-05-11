import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import Timeline from "./Timeline/Timeline";
import ItemOptionHolder from "./ItemOptionHolder/ItemOptionHolder";

function App() {
  const [items, setItems] = useState([
    { name: 'Item 1', startTime: 0.5, duration: 0.03125, type: "image"},
    { name: 'Item 2', startTime: 1, duration: 1, type: "video"},
    { name: 'Item 3', startTime: 3, duration: 2, type: "presentation"}
  ]);

  const [selectedItem, setSelectedItem] = useState(null);

  // Функция для обновления данных items
  const updateItemStartTime = (itemName, newStartTime) => {
    setItems(prevItems => prevItems.map(item => 
      item.name === itemName ? { ...item, startTime: newStartTime } : item
    ));
  };

  return (
    <div className="container">
      <div className="list-item-holder">
        <button className="upload-button">Upload file</button>
        <button className="save-button">Save</button>
        {items.map((item, index) => (
          <div className="list-item" key={index}>
            <p>{item.name}</p>
            <p>{item.type}</p>
          </div>
        ))}
      </div>
      <div className="timeline-holder">
        <Timeline items={items} updateItemStartTime={updateItemStartTime}  setSelectedItem={setSelectedItem}></Timeline>
      </div>
      {/* Условный рендеринг для отображения ItemOptionHolder */}
      {selectedItem && <ItemOptionHolder selectedItem={selectedItem} updateStartTime={updateItemStartTime} />}
    </div>
  );
}
export default App;