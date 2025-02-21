from flask import Flask, jsonify, request
import tensorflow as tf
import numpy as np
import cv2
import mediapipe as mp

app = Flask(__name__)

# Load the trained model
model = tf.keras.models.load_model('Action Detection Refined copy.ipynb')

# MediaPipe Hand Landmark Setup
mp_hands = mp.solutions.hands
hands = mp_hands.Hands()

def extract_keypoints(frame):
    # Function to extract keypoints using MediaPipe
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(frame_rgb)
    
    if results.multi_hand_landmarks:
        keypoints = []
        for hand_landmarks in results.multi_hand_landmarks:
            for landmark in hand_landmarks.landmark:
                keypoints.append([landmark.x, landmark.y, landmark.z])
        return np.array(keypoints).flatten()
    return np.zeros(63)  # Return zeros if no hand detected

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    keypoints = np.array(data['keypoints'])

    # Ensure keypoints are in the correct shape
    if keypoints.shape != (63,):
        return jsonify({'error': 'Invalid keypoints shape'}), 400

    # Predict using the model
    prediction = model.predict(np.array([keypoints]))  # Batch size 1
    predicted_action = np.argmax(prediction)

    # Return prediction as JSON
    return jsonify({'predicted_action': int(predicted_action)})

if __name__ == '__main__':
    app.run(debug=True)
