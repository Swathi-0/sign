import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SignLanguageTranslator = () => {
  const [prediction, setPrediction] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(false);

  useEffect(() => {
    const videoElement = document.getElementById('webcam');
    const startVideo = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoElement.srcObject = stream;
    };

    if (isVideoOn) {
      startVideo();
    }

    return () => {
      if (videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVideoOn]);

  const captureKeypoints = async () => {
    const videoElement = document.getElementById('webcam');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Send the image data or processed keypoints to Flask backend
    const response = await axios.post('http://localhost:5000/predict', {
      image_data: imageData.data, // Send the processed data here
    });

    // Update prediction state
    setPrediction(response.data.predicted_action);
  };

  return (
    <div>
      <video id="webcam" width="640" height="480" autoPlay></video>
      <button onClick={() => setIsVideoOn(!isVideoOn)}>
        {isVideoOn ? 'Stop Video' : 'Start Video'}
      </button>
      <button onClick={captureKeypoints}>Capture Gesture</button>
      <h3>Prediction: {prediction}</h3>
    </div>
  );
};

export default SignLanguageTranslator;
