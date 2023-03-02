import React, { useContext } from 'react'
import LoginAndRegister from './LoginAndRegister';
import { UserContext } from './contexts/UserContext';


export default function App() {

  const { user } = useContext(UserContext)
  if (!!user) {
    return 'logged in'
  }
  return (
    <LoginAndRegister />
  )
}