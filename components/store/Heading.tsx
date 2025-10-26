
import React from 'react'

const Heading = ({ title } : { title: string }) => {
  return (
    <h2 className="text-[var(--secondary-color)] text-2xl sm:text-3xl md:text-4xl font-extrabold text-center mt-12 sm:mt-20">{ title }</h2>
  )
}

export default Heading