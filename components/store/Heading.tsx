
import React from 'react'

const Heading = ({ title } : { title: string }) => {
  return (
    <h2 className="text-[var(--secondary-color)] text-4xl font-extrabold text-center mt-20 max-lg:text-4xl">{ title }</h2>
  )
}

export default Heading