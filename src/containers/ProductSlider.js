import React, { useState } from 'react'

import Product from './Product'

function ProductSlider(props) {

  const [sliderIdx, setSliderIdx] = useState(0)
  const numProducts = Object.keys(props.products).length

  function getProduct() {
    const key = Object.keys(props.products)[sliderIdx]
    const obj = props.products[key]
    return obj 
  }

  function next() {
    setSliderIdx(sliderIdx + 1)
  }

  function previous() {
    setSliderIdx(sliderIdx - 1)
  }

  return (
    <div>
      <Product product={getProduct()} clickBuy={props.clickBuy} />
      
      <div className="paginator">
        {sliderIdx !== 0 && <button onClick={previous}>previous</button>}
        {sliderIdx < (numProducts-1) && <button onClick={next}>next</button>}
      </div>
    </div>
  )
}

export default ProductSlider