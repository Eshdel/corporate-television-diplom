import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import Timeline from "./Timeline/Timeline";
import ItemOptionHolder from "./ItemOptionHolder/ItemOptionHolder";
import TrashBin from "./TrashBin/Trashbin";
import DatePicker from "./DatePicker/DatePicker";
import {getListOfMediaFiles, getListOfMediaOnTimeline, uploadMediaFile, placeElement, convertToVideo, deleteMedia,deleteMediaFromTimeline} from "./Api";
import ConvertDialog from "./ConvertDialog/ConvertDialog"; // Импортируем новый компонент
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const [draggedItem, setDraggedItem] = useState(null);
    const [items, setItems] = useState([]);
    const [allElementsOnTimeline, setAllElementsOnTimeline] = useState([]);
    const [elementsOnTimeline, setElementsOnTimeline] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().substring(0, 10));
    const [selectedItem, setSelectedItem] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showTrashBin, setShowTrashBin] = useState(false);
    const [showConvertDialog, setShowConvertDialog] = useState(false);
    const [fileToConvert, setFileToConvert] = useState(null);
    const [converting, setConverting] = useState(false);
    const [serverTimezone, setServerTimezone] = useState(null);
    const fileInputRef = useRef(null);
    
    const moment = require('moment-timezone');
  
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
        const newStartDate = moment.tz(element.full_datetime_start, serverTimezone);
        const newEndDate = moment.tz(element.full_datetime_end, serverTimezone);
        const startDate = newStartDate.toDate();
        const endDate = newEndDate.toDate();
        return {
          id: element.id,
          name: `${element.file_name}`,
          startTime: startDate.getHours() + startDate.getMinutes() / 60,
          duration: (endDate - startDate) / 3600000,
          priority: element.priority,
          format: element.file_format,
          startDate: startDate.toISOString().substring(0, 10),
          endDate: endDate.toISOString().substring(0, 10),
          getingDur: (endDate - startDate),
          getingStartTime: `${startDate.getHours()} + ${startDate.getMinutes()} + ${startDate.getSeconds()}`,
          getingEndTime: `${endDate.getHours()} + ${endDate.getMinutes()} + ${endDate.getSeconds()}`
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
          const newItem = {
              id: Math.floor(Math.random() * 2147483647),
              name: draggedItem.name,
              startTime: startTime,
              duration: draggedItem.duration || 1,
              priority: 1,
              type: draggedItem.type,
              startDate: selectedDate
          };
          setAllElementsOnTimeline(prevItems => [...prevItems, newItem]);
          setShowTrashBin(false);
      }
  };
  
  const updateItemStartTime = (itemId, newStartTime) => {
      setAllElementsOnTimeline(prevItems => prevItems.map(item => 
          item.id === itemId ? { ...item, startTime: newStartTime } : item
      ));
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
  
  const addRepeatingItems = (item, frequency, untilDate, repeatDays, repeatWeeks, repeatMonths) => {
      const until = new Date(untilDate);
      let currentDate = new Date(selectedDate);
  
      setAllElementsOnTimeline(prevItems => prevItems.filter(i => i.originalId !== item.id));
  
      const newItems = [];
  
      while (currentDate <= until) {
          if (frequency === 'daily') {
              if (repeatDays[currentDate.getDay()] && currentDate.toISOString().substring(0, 10) !== item.startDate) {
                  newItems.push({
                      ...item,
                      id: Math.floor(Math.random() * 2147483647),
                      startDate: currentDate.toISOString().substring(0, 10),
                      originalId: item.id
                  });
              }
              currentDate.setDate(currentDate.getDate() + 1);
          } else if (frequency === 'weekly') {
              if (currentDate.toISOString().substring(0, 10) !== item.startDate) {
                  newItems.push({
                      ...item,
                      id: Math.floor(Math.random() * 2147483647),
                      startDate: currentDate.toISOString().substring(0, 10),
                      originalId: item.id
                  });
              }
              currentDate.setDate(currentDate.getDate() + (7 * repeatWeeks));
          } else if (frequency === 'monthly') {
              if (currentDate.toISOString().substring(0, 10) !== item.startDate) {
                  newItems.push({
                      ...item,
                      id: Math.floor(Math.random() * 2147483647),
                      startDate: currentDate.toISOString().substring(0, 10),
                      originalId: item.id
                  });
              }
              currentDate.setMonth(currentDate.getMonth() + repeatMonths);
          }
      }
  
      setAllElementsOnTimeline(prevItems => [...prevItems, ...newItems]);
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
          <DatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} /> {/* Добавляем компонент выбора даты */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            multiple
            onChange={handleFileChange}
          />
          <button className="upload-button" onClick={handleUploadClick}>Upload file</button>
          <button className="save-button">Save</button>
          <div className="scrollable-list">
            {items.map((item, index) => (
              <div
                className="list-item"
                key={item.id} // Используем уникальный идентификатор в качестве ключа
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onDragEnd={handleDragEnd}
              >
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
                onClose={() => setShowConvertDialog(false)}
                onConvert={handleConvert}
            />
        )}
      </div>
    );
  }
  
  export default App;