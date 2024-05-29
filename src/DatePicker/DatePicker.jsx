import React from 'react';
import './DatePicker.css';

function DatePicker({ selectedDate, setSelectedDate }) {
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className="date-picker">
      <input type="date" className="date-input" value={selectedDate} onChange={handleDateChange} />
    </div>
  );
}

export default DatePicker;
