// api.js

// Функция для отправки GET-запроса на получение списка медиафайлов
export const getListOfMediaFiles = async () => {
    return [
        {
          "file_type": "video",
          "file_name": "bear",
          "file_format": "mp4",
          "seconds": 56.053,
          "using": 1
        },
        {
          "file_type": "image",
          "file_name": "car",
          "file_format": "jpeg",
          "using": 0
        },
        {
          "file_type": "video",
          "file_name": "car",
          "file_format": "mp4",
          "seconds": 3,
          "using": 1
        },
        {
          "file_type": "video",
          "file_name": "car2",
          "file_format": "mp4",
          "seconds": 13,
          "using": 1
        },
        {
          "file_type": "image",
          "file_name": "cat",
          "file_format": "jpg",
          "using": 0
        },
        {
          "file_type": "video",
          "file_name": "cat",
          "file_format": "mp4",
          "seconds": 25,
          "using": 1
        },
        {
          "file_type": "video",
          "file_name": "classroom",
          "file_format": "mp4",
          "seconds": 259.483,
          "using": 0
        },
        {
          "file_type": "image",
          "file_name": "girl",
          "file_format": "jpeg",
          "using": 0
        },
        {
          "file_type": "video",
          "file_name": "girl",
          "file_format": "mp4",
          "seconds": 13,
          "using": 1
        },
        {
          "file_type": "video",
          "file_name": "lethal",
          "file_format": "mp4",
          "seconds": 46.208,
          "using": 1
        },
        {
          "file_type": "video",
          "file_name": "presa",
          "file_format": "mp4",
          "seconds": 81,
          "using": 1
        },
        {
          "file_type": "presentation",
          "file_name": "presa",
          "file_format": "pdf",
          "using": 0
        },
        {
          "file_type": "image",
          "file_name": "stone",
          "file_format": "jpeg",
          "using": 0
        },
        {
          "file_type": "video",
          "file_name": "stone",
          "file_format": "mp4",
          "seconds": 13,
          "using": 1
        }
      ]
    // try {
    //   const response = await fetch('http://217.71.129.139:4184/listmedia');
    //   const data = await response.json();
    //   if (response.ok) {
    //     return data; // Возвращаем данные при успешном ответе
    //   } else {
    //     throw new Error(data.message); // Генерируем ошибку при ошибочном ответе
    //   }
    // } catch (error) {
    //   throw new Error(error.message); // Генерируем ошибку при сбое запроса
    // }
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
  