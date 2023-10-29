import Nav from "./components/Nav";
import Jumbtron from "./components/Jumbtron";
import SoundSection from "./components/SoundSection";
import DisplaySection from "./components/DisplaySection";
import WebgiViewer from "./components/WebgiViewer";
import { useRef } from "react";
import Loder from "./components/Loder";
function App() {
  const webgiViwerRef = useRef();
  const contentRef = useRef();

  const handlePreview = () => {
    webgiViwerRef.current.triggerPreview();
  };
  return (
    <div className="App">
      <Loder />
      <div ref={contentRef} id="content">
        <Nav />
        <Jumbtron />
        <SoundSection />
        <DisplaySection triggerPreview={handlePreview} />
      </div>

      <WebgiViewer contentRef={contentRef} ref={webgiViwerRef} />
    </div>
  );
}

export default App;
