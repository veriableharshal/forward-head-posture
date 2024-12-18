import React, { useState, useRef, useEffect } from "react";

const CameraCapture = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [points, setPoints] = useState([
    { x: 100, y: 100 },
    { x: 200, y: 200 },
    { x: 300, y: 100 },
  ]);
  const [draggedPointIndex, setDraggedPointIndex] = useState(null);
  const [isBackCamera, setIsBackCamera] = useState(false); // For switching cameras
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: isBackCamera ? "environment" : "user",
        },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Camera access denied. Please allow camera access.");
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg");
      setImageUrl(dataUrl);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    const tracks = stream?.getTracks() || [];
    tracks.forEach((track) => track.stop());
  };

  const handlePointMouseDown = (index) => {
    setDraggedPointIndex(index);
  };

  const handleMouseMove = (e) => {
    if (draggedPointIndex === null || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setPoints((prev) => {
      const updatedPoints = [...prev];
      updatedPoints[draggedPointIndex] = { x: offsetX, y: offsetY };
      return updatedPoints;
    });
  };

  const handleTouchMove = (e) => {
    if (draggedPointIndex === null || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;

    setPoints((prev) => {
      const updatedPoints = [...prev];
      updatedPoints[draggedPointIndex] = { x: offsetX, y: offsetY };
      return updatedPoints;
    });
  };

  const handleMouseUp = () => {
    setDraggedPointIndex(null);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateAngle = (points) => {
    if (points.length < 3) return 0;

    const [p1, p2, p3] = points;

    const u = { x: p2.x - p1.x, y: p2.y - p1.y };
    const v = { x: p3.x - p2.x, y: p3.y - p2.y };

    const dotProduct = u.x * v.x + u.y * v.y;
    const magnitudeU = Math.sqrt(u.x ** 2 + u.y ** 2);
    const magnitudeV = Math.sqrt(v.x ** 2 + v.y ** 2);

    const cosineTheta = dotProduct / (magnitudeU * magnitudeV);
    const angleRadians = Math.acos(Math.max(-1, Math.min(1, cosineTheta))); // Clamp the value
    const angleDegrees = (angleRadians * 180) / Math.PI;

    return Math.min(angleDegrees, 90 - angleDegrees).toFixed(2);
  };

  let angle = calculateAngle(points);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [draggedPointIndex]);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Camera Capture with Movable Triangle</h2>
      <video ref={videoRef} autoPlay className="w-full bg-black mb-4" />
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex space-x-2 mb-4">
        <button onClick={startCamera} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Start Camera
        </button>
        <button onClick={capturePhoto} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Capture Photo
        </button>
        <button onClick={stopCamera} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Stop Camera
        </button>
        <button
          onClick={() => setIsBackCamera((prev) => !prev)}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Switch Camera
        </button>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="bg-gray-200 text-black px-4 py-2 rounded cursor-pointer"
        />
      </div>
      {imageUrl && (
        <div className="relative">
          <img ref={imageRef} src={imageUrl} alt="Captured" className="w-full border-2 border-gray-300 rounded" />
          {points.map((point, index) => (
            <div
              key={index}
              onMouseDown={() => handlePointMouseDown(index)}
              onTouchStart={() => handlePointMouseDown(index)}
              style={{
                position: "absolute",
                left: `${point.x}px`,
                top: `${point.y}px`,
                width: "30px",
                height: "30px",
                backgroundColor: "red",
                borderRadius: "50%",
                cursor: "grab",
                transform: "translate(-50%, -50%)",
                zIndex: 10,
              }}
            />
          ))}
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            {points.length > 1 && (
              <>
                <line x1={points[0].x} y1={points[0].y} x2={points[1].x} y2={points[1].y} stroke="red" strokeWidth="2" />
                {points.length > 2 && (
                  <line x1={points[1].x} y1={points[1].y} x2={points[2].x} y2={points[2].y} stroke="red" strokeWidth="2" />
                )}
              </>
            )}
          </svg>
        </div>
      )}
      <p className="mt-4 text-lg">Angle between lines: {angle}°</p>
    </div>
  );
};

export default CameraCapture;
