// api.js

// Функция для отправки GET-запроса на получение списка медиафайлов

import axios from 'axios';

export const getListOfMediaFiles = async () => {
    try {
        const response = await axios.get('http://217.71.129.139:4184/listmedia');
        // В ответе содержится данные от сервера, с которыми вы можете работать дальше
        console.log(response.data);
        return response.data;
      } catch (error) {
        // Обработка ошибок, если таковые возникли при запросе
        console.error('Error fetching data:', error);
        throw error;
      }
  };

  import axios from 'axios';

export  const convertToVideo = async (fileType, fileName, fileFormat, duration) => {
  try {
    const response = await axios.post('http://217.71.129.139:4184/tovideo', [
      {
        file_type: fileType,
        file_name: fileName,
        file_format: fileFormat,
      },
      {
        file_type: 'video',
        file_name: `${fileName}_converted`,
        file_format: 'mp4', // допустим, мы всегда конвертируем в mp4
      },
      {
        seconds: duration,
      },
    ]);

    if (response.status === 200) {
      console.log('File converting');
      return response.data;
    }
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          const message = error.response.data.message;
          throw new Error(message);
        default:
          throw new Error('Server error');
      }
    } else {
      throw new Error('Network error');
    }
  }
};

  
  // Функция для отправки POST-запроса на загрузку медиафайла
  export const uploadMediaFile = async (mediaFile, jsonData) => {
    try {
      const formData = new FormData();
      formData.append('mediaFile', mediaFile);
      formData.append('jsonData', JSON.stringify(jsonData));
  
      const response = await fetch('http://217.71.129.139:4184/uploadmedia', {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
      if (response.ok) {
        return data; // Возвращаем данные при успешной загрузке
      } else {
        throw new Error(data.message); // Генерируем ошибку при ошибке загрузки
      }
    } catch (error) {
      throw new Error(error.message); // Генерируем ошибку при сбое запроса
    }
  };
  