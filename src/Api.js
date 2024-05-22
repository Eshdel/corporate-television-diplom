// api.js

// Функция для отправки GET-запроса на получение списка медиафайлов

import axios from 'axios';
import FormData from 'form-data';
import moment from 'moment-timezone';

export const getListOfMediaFiles = async () => {
    try {
        const response = await axios.get('http://158.160.1.0:4004/listmedia');
        // В ответе содержится данные от сервера, с которыми вы можете работать дальше
        console.log(response.data);
        return response.data;
      } catch (error) {
        // Обработка ошибок, если таковые возникли при запросе
        console.error('Error fetching data:', error);
        throw error;
      }
};

export const getListOfMediaOnTimeline = async () => {
  try {
      const response = await axios.get('http://158.160.1.0:4004/listelements');
      console.log("Succesfull elements on timeline: " , response.data);
      return response.data;
  } catch (error) {
      console.error('Error fetching media files on timeline:', error);
      throw error;
  }
};

export const convertToVideo = async (fileType, fileName, fileFormat, toFileName, toFileFormat, duration) => {
  try {
    const requestData = [
      {
        file_type: fileType,
        file_name: fileName,
        file_format: fileFormat,
      },
      {
        file_type: 'video',
        file_name: toFileName,
        file_format: toFileFormat, // допустим, мы всегда конвертируем в mp4
      },
      {
        seconds: duration,
      },
    ];

    const response = await axios.put('http://158.160.1.0:4004/tovideo', requestData, {
      timeout: 0 // Убираем таймаут
  });
    console.log('Response Convert:', response);
    return response;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

  
export const uploadMediaFile = async (file) => {
  console.log("Begin upload media");
  const form = new FormData();
  const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'presentation';
  const fileName = file.name.split('.').slice(0, -1).join('.');
  const fileFormat = file.name.split('.').pop();

  const jsonData = {
      file_type: fileType,
      file_name: fileName,
      file_format: fileFormat,
  };

  form.append('mediaFile', file);
  form.append('jsonFile', JSON.stringify(jsonData));

  try {
    const response = await axios.post('http://158.160.1.0:4004/uploadmedia', form, {
      timeout: 0 // Убираем таймаут
  });
      console.log('Upload response:', response.data);
      return response.data;
  } catch (error) {
      console.error('Error uploading media file:', error.response.data);
      throw error;
  }
};

export const deleteMedia = async (fileType, fileName, fileFormat) => {
  const json = { file_type: fileType, file_name: fileName, file_format: fileFormat };
  
  try {
      const response = await axios.delete('http://158.160.1.0:4004/deletemedia', { data: json });
      console.log('Status code:', response.status);
      console.log(response.data);
      return response.data;
  } catch (error) {
      console.error('Error:', error);
      throw error;
  }
};

export const deleteMediaFromTimeline = async (elementId) => {
  const jsonData = {
    id_element: elementId // ID элемента, который нужно удалить из временной линии
  };

  try {
    const response = await axios.delete('http://158.160.1.0:4004/deleteelement', { data: jsonData });
    console.log('Deleted element from timeline:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting element from timeline:', error);
    throw error;
  }
};

export const placeElement = async (fileType, fileName, fileFormat, startTime, timeZone, priority) => {
  // Форматируем дату и время начала показа

  let formattedDateTime = moment(startTime).format('YYYY-MM-DD HH:mm:ss');

  // JSON данные для отправки на сервер
  const jsonData = {
      file_type: fileType,
      file_name: fileName,
      file_format: fileFormat,
      full_start_time: formattedDateTime, // Полная дата и время начала показа
      time_zone: timeZone, // Часовой пояс
      priority: priority // Приоритет
  };

  console.log("PlaceElement json data",jsonData);

  try {
      const response = await axios.post('http://158.160.1.0:4004/placeelement', jsonData);
      console.log('Response:', response.data);
      return response.data;
  } catch (error) {
      console.error('Error:', error);
      throw error;
  }
};

// Метод для обновления элемента
export const updateElement = async (elementId, newStartTime, timeZone) => {
  // Форматируем дату и время начала в нужный формат
 
  let formattedDateTime = moment(newStartTime).format('YYYY-MM-DD HH:mm:ss');
  

  // JSON данные для отправки на сервер
  const jsonData = {
      id_element: elementId, // ID элемента для обновления
      full_datetime_start_new: formattedDateTime, // Новая дата и время начала в формате 'YYYY-MM-DD HH:mm:ss'
      time_zone: timeZone // Часовой пояс для новой даты и времени
  };

  console.log('formattedDateTime', jsonData);

  try {
      // Отправляем PUT запрос на сервер
      const response = await axios.put('http://158.160.1.0:4004/moveelement', jsonData);
      console.log('Response:', response.data);
      return response.data;
  } catch (error) {
      console.error('Error:', error.response.data);
      throw error;
  }
};

export const testPost = async (file) => {
  const fileName = file.name.split('.').slice(0, -1).join('.');
  try {
    const jsonData = {
        name: fileName
    };

    const response = await axios.post('http://158.160.1.0:4004/po', jsonData);
    console.log('Response:', response.data);
  } catch (error) {
      console.error('Error:', error);
  }
}
