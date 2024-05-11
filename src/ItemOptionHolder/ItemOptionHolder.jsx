import React, { useState, useEffect } from "react";
import "./ItemOptionHolder.css";

const ItemOptionHolder = ({ selectedItem, updateStartTime }) => {
  // Функция для форматирования времени в формат "часы:минуты:секунды"
  const formatTime = (time) => {
    const hours = Math.floor(time);
    const minutes = Math.floor((time - hours) * 60);
    const seconds = Math.round(((time - hours) * 60 - minutes) * 60);
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const [editedStartTime, setEditedStartTime] = useState(formatTime(selectedItem.startTime));
  const [validTime, setValidTime] = useState(true);

  // Обновляем состояние при изменении selectedItem
  useEffect(() => {
    setEditedStartTime(formatTime(selectedItem.startTime));
  }, [selectedItem]);

  const handleStartTimeChange = (event) => {
    const value = event.target.value;
    setEditedStartTime(value);

    // Проверяем валидность времени
    const isValidTime = isValidTimeString(value);
    setValidTime(isValidTime);

    if (isValidTime) {
      // Преобразуем время из формата "часы:минуты:секунды" в число часов
      const [hours, minutes, seconds] = value.split(':').map(parseFloat);
      const startTime = hours + minutes / 60 + seconds / 3600;
      // Вызываем функцию обновления startTime в родительском компоненте
      updateStartTime(selectedItem.name, startTime);
    }
  };

  const handleBlur = () => {
    // Преобразуем время из формата "часы:минуты:секунды" в число часов
    const [hours, minutes, seconds] = editedStartTime.split(':').map(parseFloat);
    const startTime = hours + minutes / 60 + seconds / 3600;
    // Вызываем функцию обновления startTime в родительском компоненте
    updateStartTime(selectedItem.name, startTime);
  };

  // Проверка валидности строки времени
  const isValidTimeString = (timeString) => {
    const regex = /^\d{1,2}:\d{2}:\d{2}$/;
    return regex.test(timeString);
  };

  return (
    <div className="item-option-holder">
      <h2>{selectedItem.name}</h2>
      {/* Поле для редактирования startTime */}
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
    </div>
  );
};

export default ItemOptionHolder;
