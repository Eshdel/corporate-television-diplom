import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './customToast.css'
const CircleProgressBarToast = ({ message }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <div className="circle-progress-bar"></div>
    <span>{message}</span>
  </div>
);

const customToast = (message) => {
  toast.dark(<CircleProgressBarToast message={message} />, {
    position: toast.POSITION.TOP_CENTER,
    autoClose: false,
    closeButton: false,
    hideProgressBar: true,
    draggable: false,
    closeOnClick: false,
    pauseOnHover: false,
  });
};

export default customToast;