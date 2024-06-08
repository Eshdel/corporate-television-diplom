import React, { useState, useRef, useEffect } from "react";
import { FaVideo, FaImage, FaFilePowerpoint } from 'react-icons/fa'; // Импортируем иконки
import "./App.css";
import Timeline from "./Timeline/Timeline";
import ItemOptionHolder from "./ItemOptionHolder/ItemOptionHolder";
import TrashBin from "./TrashBin/Trashbin";
import DatePicker from "./DatePicker/DatePicker";
import { getListOfMediaFiles, getListOfMediaOnTimeline, uploadMediaFile, placeElement, convertToVideo, deleteMedia, deleteMediaFromTimeline, updateElement } from "./Api";
import ConvertDialog from "./ConvertDialog/ConvertDialog"; // Импортируем новый компонент
import ScheduleDialog from "./ScheduleDialog/ScheduleDialog";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const moment = require('moment-timezone');

  const [draggedItem, setDraggedItem] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [allElementsOnTimeline, setAllElementsOnTimeline] = useState([]);
  const [elementsOnTimeline, setElementsOnTimeline] = useState([]);
  const [newElementsOnTimeline, setNewElementsOnTimeline] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [selectedItem, setSelectedItem] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showTrashBin, setShowTrashBin] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [fileToConvert, setFileToConvert] = useState(null);
  const [converting, setConverting] = useState(false);
  const [serverTimezone, setServerTimezone] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false); // Добавим состояние для отображения зоны перетаскивания
  const [activeTab, setActiveTab] = useState('video'); // Добавим состояние для активной вкладки
  const fileInputRef = useRef(null);

  const uploadElements = {
    // upload to server new elements on timeline
  }

  const updateMediaFileList = async () => {
    try {
      const response = await getListOfMediaFiles();
      const transformedResponse = response.map(file => ({
        id: crypto.randomUUID(),
        name: `${file.file_name}.${file.file_format}`,
        format: file.file_format,
        duration: (file.seconds || 600) / 3600,
        valueType: file.value_type,
        type: file.file_type,
        refs: Array.isArray(file.refs) && file.refs.length ? file.refs.join(', ') : ''
      }));
      setMediaFiles(transformedResponse);
    } catch (error) {
      // Show a user-friendly error message
      toast.error(`Failed to load media files. Please try again later. Error: ${error.message}`);

      // Log the error details for debugging purposes
      console.error('An error occurred while fetching media files:', error.message);
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
    updateMediaFileList();
    updateElementsOnTimeline();
  }, []);

  //For Tests
  useEffect(() => {
    if (allElementsOnTimeline) {
      console.log("Element on time line", allElementsOnTimeline);
    }
  }, [allElementsOnTimeline]);

  useEffect(() => {
    if (converting) {
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

  const handleDropOnTimeline = async (e, startTime, transformStartTime) => {
    e.preventDefault();
    setIsDragOver(false);

    if (draggedItem) {
      const formattedDateTime = moment(`${selectedDate} ${startTime}`).format('YYYY-MM-DD HH:mm:ss');
      const newElement = {
        ...draggedItem,
        id: allElementsOnTimeline.length + 2,
        startTime: transformStartTime,
        startDate: selectedDate,
        startDateTime: formattedDateTime,
      };      
      
      setNewElementsOnTimeline(prevElements => [...prevElements, newElement]);
      setAllElementsOnTimeline(prevElements => [...prevElements, newElement]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    // Проверяем, перетаскивается ли файл
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    // Проверяем, перетаскивается ли файл
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(false);
    }
  };


  const updateItemStartTime = (itemId, newStartDate, newStartTime) => {
    setAllElementsOnTimeline(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, startDate: newStartDate, startTime: newStartTime } : item
      )
    );
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
    setIsDragOver(false); // Сбрасываем состояние после перетаскивания
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
            await placeElement(item.type, item.name, item.format, startDateStr, item.priority);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        } else if (frequency === 'weekly') {
          if (currentDate.toISOString().substring(0, 10) !== item.startDate) {
            const startDateStr = moment(currentDate).tz(timeZone).format(); // Форматируем дату с учетом часового пояса
            await placeElement(item.type, item.name, item.format, startDateStr, item.priority);
          }
          currentDate.setDate(currentDate.getDate() + (7 * repeatWeeks));
        } else if (frequency === 'monthly') {
          if (currentDate.toISOString().substring(0, 10) !== item.startDate) {
            const startDateStr = moment(currentDate).tz(timeZone).format(); // Форматируем дату с учетом часового пояса
            await placeElement(item.type, item.name, item.format, startDateStr, item.priority);
          }
          currentDate.setMonth(currentDate.getMonth() + repeatMonths);
        }
        traikerOperations++;
      }

      updateElementsOnTimeline();
      if (traikerOperations > 1) {
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

  const renderMediaFiles = () => {
    return mediaFiles
      .filter(item => item.type === activeTab)
      .map((item) => (
        <div className={`list-item ${item.type}`} key={item.id} draggable onDragStart={(e) => handleDragStart(e, item)} onDragEnd={handleDragEnd}>
          <div className="file-icon">
            {item.type === 'video' && <FaVideo />}
            {item.type === 'image' && <FaImage />}
            {item.type === 'presentation' && <FaFilePowerpoint />}
          </div>
          <p className="file-name">{item.name}</p>
        </div>
      ));
  };

  return (
    <div className="container">
      <div
        className={`list-item-holder ${isDragOver ? 'drag-over' : ''}`}
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{ position: 'relative' }}
      >
        <DatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple onChange={handleFileChange} />
        <div className="buttons-container">
          <button className="upload-button" onClick={handleUploadClick}>Upload file</button>
          <button className="save-button">Save</button>
        </div>
        <div className="tabs">
          <button className={`tab video ${activeTab === 'video' ? 'active' : ''}`} onClick={() => setActiveTab('video')}>
            <FaVideo /> Video
          </button>
          <button className={`tab image ${activeTab === 'image' ? 'active' : ''}`} onClick={() => setActiveTab('image')}>
            <FaImage /> Image
          </button>
          <button className={`tab presentation ${activeTab === 'presentation' ? 'active' : ''}`} onClick={() => setActiveTab('presentation')}>
            <FaFilePowerpoint /> Presentation
          </button>
        </div>
        <div className="scrollable-list">
          {renderMediaFiles()}
        </div>
        <TrashBin isVisible={showTrashBin} onDragOver={(e) => e.preventDefault()} onDrop={handleDropOnTrashBin} />
      </div>

      <ToastContainer position="top-center" autoClose={5000} />

      <div className="timeline-holder">
        <Timeline
          items={elementsOnTimeline}
          updateItemStartTime={updateItemStartTime}
          updateItemDuration={updateItemDuration}
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
          }}
          onConvert={handleConvert}
        />
      )}
    </div>
  );
}

export default App;