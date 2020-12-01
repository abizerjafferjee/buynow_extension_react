import React, { Component, useState } from 'react';

import { shortenText } from '../libs/helpers'
import defaultImage from '../assets/images/default-image.jpg'

function Product({ product, clickBuy }) {
  return (
    <div className="product">

      <div className="image-cover">
        <img
          className="image"
          src={product.image !== undefined ? 
              product.image : defaultImage}
        />
      </div>
      
      <div className="content">
        <p className="name">{shortenText(product.name, 50)}</p>
        <p className="description">{product.description !== undefined && shortenText(product.description, 500)}</p>
      </div>

      <div className="action">
        <button className="buy-now" onClick={() => clickBuy(product.url)}>
          {product.price !== undefined ?
          product.price :
          'Buy Now'
          }
        </button>
      </div>

    </div>
  )
}

export default Product