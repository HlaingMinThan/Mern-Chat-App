import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react'

export const UserContext = createContext(null);

export function UserContextProvider({ children }) {
    let [user, setUser] = useState(null);

    useEffect(() => {
        axios.get('/me').then(res => {
            if (!user) {
                setUser(res.data)
            }
        })
    }, [])

    return (
        <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
    )
}
