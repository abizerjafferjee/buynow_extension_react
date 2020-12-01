/*global chrome*/

import React, { Component, useState } from 'react';
import './App.css';
import { AiOutlineClose } from 'react-icons/ai'

import Product from './containers/Product'
import ProductSlider from './containers/ProductSlider'
import Placeholder from './containers/Placeholder'

function App(props) {
  const [showLiveSale, setShowLiveSale] = useState(true)
  const [product, setProduct] = useState(null)
  const [sliderProducts, setSliderProducts] = useState({})

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.type === 'link') {
        const data = request.link
        setProduct(data)
        if (!showLiveSale) { setShowLiveSale(true) }
        sendResponse()
      }
      else if (request.type === 'checkout-products') {
        const data = request.products
        setSliderProducts(data)
        if (showLiveSale) { setShowLiveSale(false) }
        sendResponse()
      }
    }
  )

  function clickBuy(url) {
    chrome.runtime.sendMessage({ 
      type: 'click-buy-button',
      url : url
    })
  }

  function closeFrame() {
    chrome.runtime.sendMessage({
      type: 'close-frame'
    })
  }

  const app = () => {
    if (showLiveSale) {
      if (product) {
        return <Product product={product} clickBuy={clickBuy} /> 
      } else {
        return <Placeholder />
      }
    } else {
      if (sliderProducts) {
        return <ProductSlider products={sliderProducts} clickBuy={clickBuy} /> 
      } else {
        return <Placeholder />
      }
    }
  }

  return (
    <div className="root">
      <div className="top-bar">
        <img 
          width="20px"
          height="20px" 
          src={chrome.runtime.getURL("static/media/genie24-128by128-icon-nobg.png")}   
        />

        <div 
          className="close-btn"
          onClick={() => closeFrame()}>
          <AiOutlineClose />
        </div>
      </div>

      { app() }

    </div>
  )
}

export default App;