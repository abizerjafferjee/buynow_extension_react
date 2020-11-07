/*global chrome*/

import React, { Component, useState } from 'react';
import './App.css';
import { shortenText } from './libs/helpers'

function LinkCard({ link }) {
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

      <p className="name">{shortenText(link.name, 90)}</p>
      <p className="description">{link.description !== undefined && shortenText(link.description, 120)}</p>

      <button href={link.url}>
        {link.price !== undefined ?
         link.price :
         'Buy Now'
        }
      </button>

    </div>
  )
}

function Placeholder() {
  return (
    <div>
      <p>Welcome to the app</p>
    </div>
  )
}

function App(props) {
  const [link, setLink] = useState(null)

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    const data = changes.link.newValue
    setLink(data)
  })

  return (
    <div className="root">
      <div className="top-bar">Top Bar</div>

      {link ? <LinkCard link={link} /> : <Placeholder />}
    </div>
  )
}

export default App;