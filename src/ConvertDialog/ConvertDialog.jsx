import React, { useState } from 'react';
import "./ConvertDialog.css";

const ConvertDialog = ({ file, onClose, onConvert }) => {
  const [duration, setDuration] = useState(120);
  const [name, setName] = useState(file.name.split('.')[0] || ''); // Устанавливаем имя по умолчанию из имени файла без расширения
  const [format, setFormat] = useState('mp4'); // Устанавливаем тип по умолчанию в mp4

  const handleConvert = () => {
    onConvert(file,name, format, duration);
  };

  return (
    <div className="convert-dialog">
      <h3>Convert {file.name}</h3>
      <label>
        Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label>
        Type:
        <select value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="mp4">mp4</option>
          <option value="mov">mov</option>
        </select>
      </label>
      <label>
        Duration (seconds per image):
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          min="1"
        />
      </label>
      <button onClick={handleConvert}>OK</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default ConvertDialog;
