import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import CameraCapture from "./components/CameraCapture";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="bg-black">
      <CameraCapture />
    </div>
  );
}

export default App;
