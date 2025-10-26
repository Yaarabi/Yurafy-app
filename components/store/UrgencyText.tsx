// *********************
// IN DEVELOPMENT
// *********************

import React from 'react'

const UrgencyText = ({stock} : { stock: number }) => {
  return (
    <p className='text-lg sm:text-xl text-gray-800 dark:text-gray-100'>
      Hurry up! only
      <span className='inline-block bg-[var(--primary-color)] text-white text-sm sm:text-base px-2 py-0.5 rounded ml-2'>
        {stock}
      </span>
      <span className='ml-2'>products left in stock!</span>
    </p>
  )
}

export default UrgencyText