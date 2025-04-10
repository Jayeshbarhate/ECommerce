import React from 'react'
import './DescriptionBox.css'


export const DescriptionBox = () => {
  return (
    <div className='descriptionbox'>
        <div className="descriptionbox-navigator">
            <div className="descriptionbox-nav-box">Description</div>
            <div className="descriptionbox-nav-box fade">Reviews (122)</div>
        </div>
        <div className="descriptionbox-description">
            <p>
            "Welcome to [Your Store Name], your one-stop destination for high-quality
            products at unbeatable prices! Explore our wide range of categories, from 
            fashion and electronics to home essentials and more. Enjoy secure shopping,
            fast shipping, and excellent customer service. Shop with confidence and 
            experience convenience like never before. Start browsing now and find the best deals just for you!"</p>

            <p>
            "Discover the best shopping experience at [Your Store Name], where quality meets affordability! From the latest fashion trends to top-notch electronics and home essentials, we have everything you need in one place. Enjoy seamless navigation, secure payments, and fast delivery. Shop now and elevate your lifestyle with amazing deals and exclusive offers!"</p>
        </div>
    </div>
  )
}
