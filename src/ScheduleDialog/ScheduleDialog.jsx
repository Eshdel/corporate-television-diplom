import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './ScheduleDialog.css'
import { toast } from 'react-toastify';

const ScheduleDialog = ({ item, onClose, onSchedule }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [priority, setPriority] = useState(1);

  useEffect(() => {
    if (item && item.type !== 'video') {
      toast.error("Item must be converted to video format first.");
      onClose();
    }
  }, [item, onClose]);

  const handleSchedule = () => {
    if (startDate < new Date()) {
      toast.error("Selected date and time cannot be in the past.");
      return;
    }
    onSchedule(item, startDate, priority);
  };

  return (
    <div className="schedule-dialog">
      <h3>Schedule {item.name}</h3>
      <label>
        Date and Time:
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="MMMM d, yyyy h:mm aa"
        />
      </label>
      <label>
        Priority:
        <input
          type="number"
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
          min="1"
          max="4"
        />
      </label>
      <button onClick={handleSchedule}>OK</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default ScheduleDialog;