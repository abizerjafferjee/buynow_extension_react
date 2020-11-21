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
app.style.height = "575px"
app.style.width = "350px"
app.style.position = "fixed"
app.style.top = "40px"
app.style.right = "40px"
app.style.zIndex = "9000000000000000000"
app.frameBorder = "none"
app.style.borderRadius = "2%"
app.style.backgroundColor = "#FFFFFF"

chrome.runtime.onMessage.addListener(
   function(request, sender, sendResponse) {
      if (request.type === 'clicked-browser-action') {
        app.style.display = "block"
      } else if (request.type === 'close-frame') {
        app.style.display = "none"
      } 
      else if (request.type === 'window-location') {
        sendResponse({
          type: 'window-location',
          payload: window.location.href
        })
      } 
      // // New  Feature      
      // else if (request.type === 'get-page-links') {
      //   const links = document.getElementsByClassName("oajrlxb2 g5ia77u1 qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv nhd2j8a9 nc684nl6 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso i1ao9s8h esuyzwwr f1sip0of lzcic4wl py34i1dx gpro0wi8")
      //   const parsedLinks = {}
      //   for (var i=0; i<links.length; i++) {
      //     parsedLinks[i] = {
      //       href: links[i].href,
      //       text: links[i].text,
      //       target: links[i].getAttribute('original_target')
      //     }
      //   }
      //   sendResponse(parsedLinks)
      // }
   }
)

chrome.runtime.sendMessage({
  type: 'show-page-action',
  payload: window.location.href
})