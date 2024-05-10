import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import Timeline from "./Timeline/Timeline";
import ItemOptionHolder from "./ItemOptionHolder/ItemOptionHolder";

function App() {
  const [items, setItems] = useState([
    { name: 'Item 1', startTime: '0.5', duration: '0.03125'},
    { name: 'Item 2', startTime: '1', duration: '1'},
    { name: 'Item 3', startTime: '3', duration: '2'}
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
      </div>
      <div className="timeline-holder">
        <Timeline items={items} updateItemStartTime={updateItemStartTime}  setSelectedItem={setSelectedItem}></Timeline>
      </div>
      {/* Условный рендеринг для отображения ItemOptionHolder */}
      {selectedItem && <ItemOptionHolder selectedItem={selectedItem} />}
    </div>
  );
}
export default App;