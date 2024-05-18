import React from "react";
import "./Trashbin.css";

const TrashBin = ({ onDragOver, onDrop, isVisible }) => {
    return (
      <div className={`trash-bin ${isVisible ? 'visible' : ''}`} onDragOver={onDragOver} onDrop={onDrop}>
        <p>🗑️ Trash Bin</p>
      </div>
    );
  };
  
  export default TrashBin;
