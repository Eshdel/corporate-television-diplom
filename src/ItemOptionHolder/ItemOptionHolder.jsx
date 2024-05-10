import React from "react";
// import "./ItemOptionHolder.css";

export const ItemOptionHolder = ({ selectedItem }) => {
  return (
    <div className="item-option-holder">
      <h2>Selected Item Options</h2>
      <p>Name: {selectedItem.name}</p>
      <p>Start Time: {selectedItem.startTime}</p>
      <p>Duration: {selectedItem.duration}</p>
    </div>
  );
};

export default ItemOptionHolder;
