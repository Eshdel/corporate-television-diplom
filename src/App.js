import React from "react";
import "./App.css";
import Timeline from "./Timeline/Timeline";

function App() {

  return (
    <div className="container">
      <div className="list-item-holder">
      </div>
      <div className="timeline-holder">
        <Timeline></Timeline>
      </div>
      <div className="item-option-holder"></div>
    </div>
  );
}
export default App;