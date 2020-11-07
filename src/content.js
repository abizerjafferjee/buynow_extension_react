/*global chrome*/
/* src/content.js */
import React from 'react';
import ReactDOM from 'react-dom';
import Frame, { FrameContextConsumer }from 'react-frame-component';
import App from "./App";

function Main() {

  return (
    <Frame 
      head={[
        <link type="text/css" rel="stylesheet" href={chrome.runtime.getURL("/static/css/content.css")}></link>
      ]}> 
        <FrameContextConsumer>
        {
          ({document, window}) => {
            return <App document={document} window={window} isExt={true} /> 
          }
        }
        </FrameContextConsumer>
    </Frame>
  )
}

const app = document.createElement('div');
app.id = "my-extension-root";

document.body.appendChild(app);
ReactDOM.render(<Main />, app);

app.style.display = "none";
app.style.height = "600px"
app.style.width = "350px"
app.style.position = "fixed"
app.style.top = "40px"
app.style.right = "40px"
app.style.zIndex = "9000000000000000000"
app.frameBorder = "none"
app.style.borderRadius = "2%"
app.style.backgroundColor = "#FFFFFF"
// app.style.boxShadow = "10px 5px 5px black"


chrome.runtime.onMessage.addListener(
   function(request, sender, sendResponse) {
      if( request.message === "clicked_browser_action") {
        toggle();
      }
   }
);

function toggle(){
   if(app.style.display === "none"){
     app.style.display = "block";
   }else{
     app.style.display = "none";
   }
}
