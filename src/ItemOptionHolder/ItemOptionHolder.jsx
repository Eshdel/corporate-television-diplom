import React, { useState, useEffect } from "react";
import "./ItemOptionHolder.css";

const ItemOptionHolder = ({ selectedItem, updateStartTime, updateDuration, deleteItem, addRepeatingItems }) => {
  const formatTime = (time) => {
    const hours = Math.floor(time);
    const minutes = Math.floor((time - hours) * 60);
    const seconds = Math.round(((time - hours) * 60 - minutes) * 60);
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const [editedStartTime, setEditedStartTime] = useState(formatTime(selectedItem.startTime));
  const [validTime, setValidTime] = useState(true);
  const [editedDuration, setEditedDuration] = useState(selectedItem.duration * 3600); // Convert to seconds for editing
  const [validDuration, setValidDuration] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [frequency, setFrequency] = useState('daily');
  const [untilDate, setUntilDate] = useState();
  const [repeatDays, setRepeatDays] = useState(Array(7).fill(true)); // All days selected by default
  const [repeatWeeks, setRepeatWeeks] = useState(1);
  const [repeatMonths, setRepeatMonths] = useState(1);

  useEffect(() => {
    setEditedStartTime(formatTime(selectedItem.startTime));
    setEditedDuration(selectedItem.duration * 3600); // Convert to seconds for editing
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

  const handleDurationChange = (event) => {
    const value = event.target.value;
    setEditedDuration(value);
    const isValidDuration = isValidDurationValue(value);
    setValidDuration(isValidDuration);

    if (isValidDuration) {
      updateDuration(selectedItem.id, parseFloat(value) / 3600); // Convert seconds to hours before updating
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

  const isValidDurationValue = (value) => {
    return !isNaN(value) && value > 0;
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
      <div className="input-group">
        <label>Start Time:</label>
        <input
          type="text"
          value={editedStartTime}
          onChange={handleStartTimeChange}
          onBlur={handleBlur}
          className={!validTime ? 'invalid-time' : ''}
        />
        {!validTime && <p className="error-message">Please enter a valid time in the format HH:MM:SS</p>}
      </div>
      <div className="input-group">
        <label>Duration (seconds):</label>
        <input
          type="number"
          value={editedDuration}
          onChange={handleDurationChange}
          className={!validDuration ? 'invalid-duration' : ''}
        />
        {!validDuration && <p className="error-message">Please enter a valid duration in seconds</p>}
      </div>
      <div className="item-details">
        <p>Priority: {selectedItem.priority}</p>
        <p>Id: {selectedItem.id}</p>
      </div>
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
        <div className="input-group">
          <label>Frequency:</label>
          <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="input-group">
          <label>Until:</label>
          <input
            type="date"
            value={untilDate}
            onChange={(e) => setUntilDate(e.target.value)}
          />
        </div>

        {frequency === 'daily' && (
          <div className="repeat-days">
            <label>Repeat on:</label>
            <div className="repeat-days-checkboxes">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <label key={index} className="repeat-day">
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
          <div className="input-group">
            <label>Repeat every:</label>
            <input
              type="number"
              min="1"
              max="4"
              value={repeatWeeks}
              onChange={(e) => setRepeatWeeks(parseInt(e.target.value))}
            /> weeks
          </div>
        )}

        {frequency === 'monthly' && (
          <div className="input-group">
            <label>Repeat every:</label>
            <input
              type="number"
              min="1"
              max="12"
              value={repeatMonths}
              onChange={(e) => setRepeatMonths(parseInt(e.target.value))}
            /> months
          </div>
        )}

        <button className="add-repeat-button" onClick={handleAddRepeatingItems}>Add Repeats</button>
      </div>
    </div>
  );
};

export default ItemOptionHolder;
