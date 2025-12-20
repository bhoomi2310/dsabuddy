import React from 'react'

const Footer = () => {
    const year = new Date().getFullYear()
  return (
    <div className='xl:max-w-270 2xl:max-w-270 md:max-w-190 sm:max-w-150 max-w-90 mt-14 m-auto pt-6 mb-8 border-gray-300 border-t'>
        <div className='flex justify-between text-gray-300'>
            <h3>&copy;{year} DSABuddy</h3>
            <h3>From <span className='text-[#61a5fa]'>The Debugging Society</span></h3>
        </div>
    </div>
  )
}

export default Footer