import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import Timeline from "./Timeline/Timeline";
import ItemOptionHolder from "./ItemOptionHolder/ItemOptionHolder";
import TrashBin from "./TrashBin/Trashbin";
import DatePicker from "./DatePicker/DatePicker";
import {getListOfMediaFiles, getListOfMediaOnTimeline, uploadMediaFile, placeElement, convertToVideo, deleteMedia,deleteMediaFromTimeline, updateElement} from "./Api";
import ConvertDialog from "./ConvertDialog/ConvertDialog"; // Импортируем новый компонент
import ScheduleDialog from "./ScheduleDialog/ScheduleDialog"; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const moment = require('moment-timezone');

    const [draggedItem, setDraggedItem] = useState(null);
    const [items, setItems] = useState([]);
    const [allElementsOnTimeline, setAllElementsOnTimeline] = useState([]);
    const [elementsOnTimeline, setElementsOnTimeline] = useState([]);
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [selectedItem, setSelectedItem] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showTrashBin, setShowTrashBin] = useState(false);
    const [showConvertDialog, setShowConvertDialog] = useState(false);
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);
    const [fileToConvert, setFileToConvert] = useState(null);
    const [elementToTimeline, setElementToTimeline] = useState(null);
    const [converting, setConverting] = useState(false);
    const [serverTimezone, setServerTimezone] = useState(null);
    const fileInputRef = useRef(null);
    

  
    const updateMediaFileList = async () => {
      try {
        const data = await getListOfMediaFiles();
        const transformedData = data.map(file => ({
          id: Math.floor(Math.random() * 2147483647),
          type: file.file_type,
          name: `${file.file_name}.${file.file_format}`,
          duration: file.seconds / 3600,
        }));
        setItems(transformedData);
      } catch (error) {
        toast.error('Error fetching media files: ' + error.message);
        console.error('Error while fetching media files:', error.message);
      }
    };
  
  const updateElementsOnTimeline = async () => {
    try {
      const data = await getListOfMediaOnTimeline();
      const newTimezone = data.find(element => element.timezone)?.timezone;
      setServerTimezone(newTimezone);

      const transformedData = data.filter(element => !element.timezone).map(element => {
        const newStartDate = moment.tz(element.full_datetime_start, serverTimezone).local();
        const newEndDate = moment.tz(element.full_datetime_end, serverTimezone).local();
        
        const startDate = newStartDate.toDate();  
        const endDate = newEndDate.toDate();

        return {
          id: element.id,
          name: `${element.file_name}`,
          startTime: startDate.getHours() + startDate.getMinutes() / 60 + startDate.getSeconds() / 3600,
          duration: (endDate - startDate) / 3600000,
          priority: element.priority,
          type: 'video',
          format: element.file_format,
          startDate: moment(startDate).format('YYYY-MM-DD'),
          endDate: moment(endDate).format('YYYY-MM-DD'),
          getingDur: (endDate - startDate),
          startMicroTime: startDate.getTime(),
          endMicroTime: endDate.getTime(),
          startDateTime: moment(startDate).format('YYYY-MM-DD HH:mm:ss'),
          endDateTime: moment(endDate).format('YYYY-MM-DD HH:mm:ss'),
        };
      });
      setAllElementsOnTimeline(transformedData);
    } catch (error) {
      toast.error('Error fetching elements on timeline: ' + error.message);
      console.error('Error while fetching elements on timeline:', error.message);
    }
  };
  
  useEffect(() => {
      updateMediaFileList()
      updateElementsOnTimeline();
  }, []);
  
  //For Tests
  useEffect(() => {
      if(allElementsOnTimeline) {
          console.log("Element on time line", allElementsOnTimeline);
      }
  }, [allElementsOnTimeline]);
  
  useEffect(() => {
    if(converting) {
      toast.info('Converting file');
    }
  }, [converting]);
  
  useEffect(() => {
      const filteredElements = allElementsOnTimeline.filter(item => item.startDate === selectedDate);
      setElementsOnTimeline(filteredElements);
  }, [selectedDate, allElementsOnTimeline]);
  
  const handleDragStart = (e, item) => {
      setDraggedItem(item);
      setShowTrashBin(true);
  };
  
  const handleDragEnd = () => {
      setDraggedItem(null);
      setShowTrashBin(false);
  };
  
  const handleDropOnTimeline = async (e, startTime) => {
    e.preventDefault();
    if (draggedItem) {
      if (draggedItem.type !== 'video') {
        toast.error("You need to convert the item to video format first.");
        return;
      }
      setElementToTimeline(draggedItem);
      setShowScheduleDialog(true);
    }
  };

  const handleSchedule = async (item, startDate, priority) => {
    setShowScheduleDialog(false);
    
    const timeZone = moment.tz.guess();
    try {
      console.log("Placement args", `${item.type}, ${item.name.split('.')[0]} , ${item.name.split('.')[1]}, ${startDate}, ${timeZone}, ${priority}`);
      await placeElement(item.type, item.name.split('.')[0], item.name.split('.')[1], startDate, timeZone, priority);
      toast.success('Element scheduled successfully');
      updateElementsOnTimeline();
    } catch (error) {
      toast.error('Error scheduling element: ' + error.message);
    }
    setShowScheduleDialog(false);
    setDraggedItem(null); // Сброс draggedItem после завершения планирования
  };
  
  const updateItemStartTime = async (itemId, newStartDate, newStartTime) => {
    try {
      console.log('newStartTime', newStartTime);
        const newDateTime = moment(`${newStartDate} ${newStartTime}`, 'YYYY-MM-DD HH:mm:ss');
        console.log('newStartDate',newStartDate);
        console.log('New date Time',newDateTime);
        const timeZone = moment.tz.guess(); // Используйте нужный часовой пояс
        await updateElement(itemId, newDateTime, timeZone);
        toast.success('Element start time updated successfully');
        updateElementsOnTimeline(); // Вызов функции обновления элементов на временной линии
    } catch (error) {
        toast.error('Error updating element start time: ' +  error.response.data);
    }
};
  const updateItemDuration = (itemId, newDuration) => {
      setAllElementsOnTimeline(prevItems => prevItems.map(item => 
          item.id === itemId ? { ...item, duration: newDuration } : item
      ));
  };
  
  const updateItemPriority = (itemId, newPriority) => {
      setAllElementsOnTimeline(prevItems => prevItems.map(item => 
          item.id === itemId ? { ...item, priority: newPriority } : item
      ));
  };
  
  const deleteItemFromTimeline = async () => {
      try {
          await deleteMediaFromTimeline(selectedItem.id);
          console.log('Element deleted successfully from timeline.')
          toast.success(`${selectedItem.name}.${selectedItem.format} deleted successfully`);
      } catch (error) {
          console.error('Failed to delete element from timeline:', error);
          toast.error(error);
      }
  
      updateElementsOnTimeline();
  
      setSelectedItem(null);
  };
  
  const handleDropOnTrashBin = (e) => {
      e.preventDefault();
      if (draggedItem) {
          setItemToDelete(draggedItem);
          setShowConfirm(true);
          setShowTrashBin(false);
      }
  };
  
  const confirmDelete = async () => {
      if (itemToDelete) {
          try {
              await deleteMedia(itemToDelete.type, itemToDelete.name.split('.')[0], itemToDelete.name.split('.')[1]);
              await updateMediaFileList();
              toast.success(`${itemToDelete.name} deleted successfully`);
          } catch (error) {
              toast.error(error.response.data);
          }
      }
      setShowConfirm(false);
      setItemToDelete(null);
  };
  
  const cancelDelete = () => {
      setShowConfirm(false);
      setItemToDelete(null);
  };
  
  const handleFileDrop = (e) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
  };
  
  const handleFileChange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) { // Проверяем, были ли выбраны файлы
        processFiles(files);
        e.target.value = null;
    }
  };
  
  
  const processFiles = async (files) => {
      try {
          for (let file of files) {
              toast.info(`Uploading ${file.name}`);
              await uploadMediaFile(file);
              toast.success(`${file.name} uploaded successfully`);
          }
          
          await updateMediaFileList(); // Обновляем список файлов после загрузки всех файлов
      } catch (error) {
          toast.error('Error upload files: ' + error.response.data);
      }
  };
  
  const handleUploadClick = () => {
      fileInputRef.current.click();
  };
  
  const addRepeatingItems = async (item, frequency, untilDate, repeatDays, repeatWeeks, repeatMonths) => {
    const until = new Date(untilDate);
    const startDate = new Date(item.startMicroTime); // Используем startMicroTime
    const timeZone = moment.tz.guess();
    let traikerOperations = 0;
    try {
        // Устанавливаем часы, минуты и секунды у until такими же, как у currentDate
        until.setHours(startDate.getHours());
        until.setMinutes(startDate.getMinutes());
        until.setSeconds(startDate.getSeconds());
        
        //const untilDateWithoutTime = new Date(until.getFullYear(), until.getMonth(), until.getDate()); // Исключаем время из untilDate
        const startDateWithoutTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()); // Исключаем время из startDate

        if (until < startDateWithoutTime) {
            toast.error('The end date cannot be earlier than the start date.');
            return;
        }

        let currentDate = new Date(startDate);

        while (currentDate <= until) { // Сравниваем только по дате, без времени
            if (frequency === 'daily') {
                if (repeatDays[currentDate.getDay()] && currentDate.toISOString().substring(0, 10) !== item.startDate) {
                    const startDateStr = moment(currentDate).tz(timeZone).format(); // Форматируем дату с учетом часового пояса
                    console.log('Start date str Repeat', startDateStr);
                    await placeElement(item.type, item.name, item.format, startDateStr, timeZone, item.priority);
                }
                currentDate.setDate(currentDate.getDate() + 1);
            } else if (frequency === 'weekly') {
                if (currentDate.toISOString().substring(0, 10) !== item.startDate) {
                    const startDateStr = moment(currentDate).tz(timeZone).format(); // Форматируем дату с учетом часового пояса
                    await placeElement(item.type, item.name, item.format, startDateStr, timeZone, item.priority);
                }
                currentDate.setDate(currentDate.getDate() + (7 * repeatWeeks));
            } else if (frequency === 'monthly') {
                if (currentDate.toISOString().substring(0, 10) !== item.startDate) {
                    const startDateStr = moment(currentDate).tz(timeZone).format(); // Форматируем дату с учетом часового пояса
                    await placeElement(item.type, item.name, item.format, startDateStr, timeZone, item.priority);
                }
                currentDate.setMonth(currentDate.getMonth() + repeatMonths);
            }
            traikerOperations++;
        }

        updateElementsOnTimeline();
        if(traikerOperations > 1) {
          toast.success("All repeats added successfully");
        }
    } catch (error) {
        toast.error('An error occurred while adding repeating items: ' + error.response.data);
        console.error('Error adding repeating items:', error);
        updateElementsOnTimeline();
    }
};

  
  const handleConvertClick = (file) => {
      setFileToConvert(file);
      setShowConvertDialog(true);
  };
  
  const handleConvert = async (file, name, format, duration) => {
    try {
        setConverting(true); // Устанавливаем состояние converting в true перед началом конвертации
        await convertToVideo(file.type, file.name.split('.')[0], file.name.split('.')[1], name, format, duration);
        updateMediaFileList();
        toast.success('File converted successfully');
    } catch (error) {
        toast.error(error.response.data);
    } finally {
        setConverting(false); // Устанавливаем состояние converting в false после завершения конвертации (включая ошибку)
    }
    setShowConvertDialog(false);
  };
  
  return (
    <div className="container">
      <div className="list-item-holder" onDrop={handleFileDrop} onDragOver={(e) => e.preventDefault()} style={{ position: 'relative' }}>
        <DatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} /> 
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple onChange={handleFileChange} />
        <button className="upload-button" onClick={handleUploadClick}>Upload file</button>
        <button className="save-button">Timetable</button>
        <div className="scrollable-list">
          {items.map((item) => (
            <div className="list-item" key={item.id} draggable onDragStart={(e) => handleDragStart(e, item)} onDragEnd={handleDragEnd}>
              <p style={{ marginLeft: "8px" }}>Name: {item.name}</p>
              <p style={{ marginLeft: "8px" }}>Type: {item.type}</p>
              {item.type !== 'video' && (
                <button onClick={() => handleConvertClick(item)}>Convert to Video</button>
              )}
            </div>
          ))}
        </div>
        <TrashBin isVisible={showTrashBin} onDragOver={(e) => e.preventDefault()} onDrop={handleDropOnTrashBin} />
      </div>
      
      <ToastContainer position="top-center" autoClose={5000} />
      
      <div className="timeline-holder">
        <Timeline
          items={elementsOnTimeline}
          updateItemStartTime={updateItemStartTime}
          updateItemPriority={updateItemPriority}
          setSelectedItem={setSelectedItem}
          handleDrop={handleDropOnTimeline}
        />
      </div>
      {selectedItem && (
        <ItemOptionHolder
          selectedItem={selectedItem}
          updateStartTime={updateItemStartTime}
          updateDuration={updateItemDuration}
          deleteItem={deleteItemFromTimeline}
          addRepeatingItems={addRepeatingItems}
        />
      )}
      {showConfirm && (
        <div className="confirm-dialog">
          <p>Are you sure you want to delete {itemToDelete.name}?</p>
          <button onClick={confirmDelete}>Yes</button>
          <button onClick={cancelDelete}>No</button>
        </div>
      )}
      {showConvertDialog && fileToConvert && !converting && (
          <ConvertDialog
              file={fileToConvert}
              onClose={() => {
                setShowConvertDialog(false); 
                setFileToConvert(null);
              }
            }
              onConvert={handleConvert}
          />
      )}
      {showScheduleDialog && elementToTimeline && (
        <ScheduleDialog
          item={elementToTimeline}
          onClose={() => {
            setShowScheduleDialog(false);
            setElementToTimeline(null);
          }}
          onSchedule={handleSchedule}
        />
      )}
    </div>
  );
}

export default App;
