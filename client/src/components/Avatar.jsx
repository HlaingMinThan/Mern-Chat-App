import React from 'react'

export default function Avatar({ username, isOnline }) {
    let getRandomColor = () => {
        let backgroundColors = ['#F44336', '#FF4081', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722', '#795548', '#607D8B'];
        let unique_name = username;
        // check for special characters
        const regex = /^[^a-z\d]+/gi;
        if (regex.test(unique_name)) {
            return backgroundColors[0];
        }

        let firstLetter = unique_name.charAt(0);
        let index = isNaN(firstLetter) ? unique_name.toLowerCase().charCodeAt(0) - 97 : parseInt(firstLetter);
        if (index > backgroundColors.length) {
            index = (index % backgroundColors.length) - 1;
        }
        return backgroundColors[index];
    }

    return (
        <div style={{ backgroundColor: getRandomColor() }} className={`w-8 h-8 rounded-full text-white relative p-5 flex justify-center items-center`}>
            {username[0]}
            {isOnline && <div className='absolute w-4 h-4 rounded-full bg-green-500 bottom-0 right-0 border border-white'></div>}
            {!isOnline && <div className='absolute w-4 h-4 rounded-full bg-gray-300 bottom-0 right-0 border border-white'></div>}
        </div>
    )
}
