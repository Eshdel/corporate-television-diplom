// DatePicker.js
import React from 'react';

function DatePicker({ selectedDate, setSelectedDate }) {
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className="date-picker">
      <input type="date" value={selectedDate} onChange={handleDateChange} />
    </div>
  );
}

export default DatePicker;
