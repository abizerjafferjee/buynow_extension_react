/*global chrome*/

import React, { Component, useState } from 'react';
import './App.css';
import { AiOutlineClose } from 'react-icons/ai'

import { shortenText } from './libs/helpers'

function LinkCard({ link, clickBuy }) {
  return (
    <div className="link">

      <div className="image-cover">
        <img
          className="image"
          src={link.image !== undefined ? 
              link.image :
              require('./assets/images/default-image.jpg')}
        />
      </div>
      
      <div className="content">
        <p className="name">{shortenText(link.name, 90)}</p>
        <p className="description">{link.description !== undefined && shortenText(link.description, 120)}</p>
      </div>

      <div className="action">
        <button className="buy-now" onClick={() => clickBuy()}>
          {link.price !== undefined ?
          link.price :
          'Buy Now'
          }
        </button>
      </div>

    </div>
  )
}

function Placeholder() {
  return (
    <div className="placeholder">
      <div className="placeholder-text">
        <h2>Genie24 is now active.</h2>
        <p>Feel free to close the popup, it will open automatically when the liveseller shows a new product.</p>
      </div>
    </div>
  )
}

function App(props) {
  const [link, setLink] = useState(null)

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.type === 'link') {
        const data = request.link
        setLink(data)
        sendResponse()
      }
    }
  )

  function clickBuy() {
    chrome.runtime.sendMessage({ 
      type: 'click-buy-button',
      url : link.url 
    })
  }

  function closeFrame() {
    chrome.runtime.sendMessage({
      type: 'close-frame'
    })
  }

  return (
    <div className="root">
      <div className="top-bar">
        <img className="logo" width="34px" height="34px" src={chrome.runtime.getURL("static/media/genie24-128by128-icon-nobg.png")} />
        <div className="close-btn" onClick={() => closeFrame()}><AiOutlineClose /></div>
      </div>

      {link ? <LinkCard link={link} clickBuy={clickBuy} /> : <Placeholder />}
    </div>
  )
}

export default App;