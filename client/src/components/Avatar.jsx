import React from 'react'

export default function Avatar({ username }) {
    return (
        <div className='bg-red-100 w-8 h-8 rounded-full  p-6 flex justify-center items-center'>{username[0]}</div>
    )
}
