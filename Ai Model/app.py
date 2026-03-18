import cv2
from flask import Flask, render_template, Response, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import numpy as np
import base64
import time
import torch

app = Flask(__name__)
CORS(app)

# Load the YOLO model
# Assuming best.pt is in the same directory as app.py
try:
    model = YOLO("best.pt")
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Initialize webcam
camera = cv2.VideoCapture(0)

def generate_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            if model:
                # Run YOLO inference
                results = model(frame)
                
                # Visualize the results on the frame
                annotated_frame = results[0].plot()
                
                # Encode the frame into jpeg
                ret, buffer = cv2.imencode('.jpg', annotated_frame)
                frame_bytes = buffer.tobytes()
            else:
                # If model is not loaded, just send the webcam frame
                ret, buffer = cv2.imencode('.jpg', frame)
                frame_bytes = buffer.tobytes()

            # Yield the frame in byte format
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500
        
    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({"error": "No image provided"}), 400
            
        # Decode base64 image
        image_data = data['image'].split(',')[1] if ',' in data['image'] else data['image']
        image_bytes = base64.b64decode(image_data)
        
        # Convert to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return jsonify({"error": "Invalid image format"}), 400
            
        # Run YOLO inference on GPU
        if torch.cuda.is_available():
            device = torch.device("cuda")
            # print(f"Using GPU: {torch.cuda.get_device_name(0)}") #
        else:
            device = torch.device("cpu")
            # print("Using CPU")
        results = model(img, device=device)
        
        # Extract prediction
        prediction_text = "None"
        confidence = 0.0
        
        if len(results) > 0 and len(results[0].boxes) > 0:
            # Sort by confidence
            boxes = results[0].boxes
            best_idx = int(boxes.conf.argmax())
            class_id = int(boxes.cls[best_idx])
            confidence = float(boxes.conf[best_idx])
            
            # Filter out low confidence predictions
            if confidence > 0.5:
                prediction_text = model.names[class_id]
                
        return jsonify({
            "prediction": prediction_text,
            "confidence": confidence
        })
        
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)
