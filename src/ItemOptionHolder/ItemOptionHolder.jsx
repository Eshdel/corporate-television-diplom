import React, { useState, useEffect } from "react";
import "./ItemOptionHolder.css";

const ItemOptionHolder = ({ selectedItem, updateStartTime, deleteItem, addRepeatingItems }) => {
  const formatTime = (time) => {
    const hours = Math.floor(time);
    const minutes = Math.floor((time - hours) * 60);
    const seconds = Math.round(((time - hours) * 60 - minutes) * 60);
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const [editedStartTime, setEditedStartTime] = useState(formatTime(selectedItem.startTime));
  const [validTime, setValidTime] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [frequency, setFrequency] = useState('none');
  const [untilDate, setUntilDate] = useState();
  const [repeatDays, setRepeatDays] = useState(Array(7).fill(true)); // All days selected by default
  const [repeatWeeks, setRepeatWeeks] = useState(1);
  const [repeatMonths, setRepeatMonths] = useState(1);

  useEffect(() => {
    setEditedStartTime(formatTime(selectedItem.startTime));
  }, [selectedItem]);

  const handleStartTimeChange = (event) => {
    const value = event.target.value;
    setEditedStartTime(value);
    const isValidTime = isValidTimeString(value);
    setValidTime(isValidTime);

    if (isValidTime) {
      const [hours, minutes, seconds] = value.split(':').map(parseFloat);
      const startTime = hours + minutes / 60 + seconds / 3600;
      updateStartTime(selectedItem.id, startTime);
    }
  };

  const handleBlur = () => {
    const [hours, minutes, seconds] = editedStartTime.split(':').map(parseFloat);
    const startTime = hours + minutes / 60 + seconds / 3600;
    updateStartTime(selectedItem.id, startTime);
  };

  const isValidTimeString = (timeString) => {
    const regex = /^\d{1,2}:\d{2}:\d{2}$/;
    return regex.test(timeString);
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    deleteItem(selectedItem.id);
    setShowConfirm(false);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  const handleRepeatDaysChange = (dayIndex) => {
    const newRepeatDays = [...repeatDays];
    newRepeatDays[dayIndex] = !newRepeatDays[dayIndex];
    setRepeatDays(newRepeatDays);
  };

  const handleAddRepeatingItems = () => {
    addRepeatingItems(selectedItem, frequency, untilDate, repeatDays, repeatWeeks, repeatMonths);
  };

  return (
    <div className="item-option-holder">
      <h2>{selectedItem.name}</h2>
      <p>
        Start Time:{" "}
        <input
          type="text"
          value={editedStartTime}
          onChange={handleStartTimeChange}
          onBlur={handleBlur}
          className={!validTime ? 'invalid-time' : ''}
        />
      </p>
      {!validTime && <p className="error-message">Please enter a valid time in the format HH:MM:SS</p>}
      <p>Duration: {selectedItem.duration}</p>
      <p>Priority: {selectedItem.priority}</p>
      <p>Id: {selectedItem.id}</p>
      <button className="delete-button" onClick={handleDeleteClick}>Delete</button>

      {showConfirm && (
        <div className="confirm-dialog">
          <p>Are you sure you want to delete this item?</p>
          <button onClick={confirmDelete}>Yes</button>
          <button onClick={cancelDelete}>No</button>
        </div>
      )}

      <div className="repeat-options">
        <h3>Repeat Options</h3>
        <div>
          <label>
            Frequency:
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
        </div>

        <div>
          <label>
            Until:
            <input
              type="date"
              value={untilDate}
              onChange={(e) => setUntilDate(e.target.value)}
            />
          </label>
        </div>

        {frequency === 'daily' && (
          <div>
            <label>Repeat on:</label>
            <div className="repeat-days">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <label key={index}>
                  <input
                    type="checkbox"
                    checked={repeatDays[index]}
                    onChange={() => handleRepeatDaysChange(index)}
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>
        )}

        {frequency === 'weekly' && (
          <div>
            <label>
              Repeat every:
              <input
                type="number"
                min="1"
                max="4"
                value={repeatWeeks}
                onChange={(e) => setRepeatWeeks(parseInt(e.target.value))}
              /> weeks
            </label>
          </div>
        )}

        {frequency === 'monthly' && (
          <div>
            <label>
              Repeat every:
              <input
                type="number"
                min="1"
                max="12"
                value={repeatMonths}
                onChange={(e) => setRepeatMonths(parseInt(e.target.value))}
              /> months
            </label>
          </div>
        )}

        <button onClick={handleAddRepeatingItems}>Add Repeats</button>
      </div>
    </div>
  );
};

export default ItemOptionHolder;
