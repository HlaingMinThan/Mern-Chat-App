import React, { useContext } from 'react'
import LoginAndRegister from './LoginAndRegister';
import { UserContext } from './contexts/UserContext';
import ChatPage from './ChatPage.jsx';

export default function App() {

  const { user } = useContext(UserContext)
  if (!!user) {
    return <ChatPage />
  }
  return (
    <LoginAndRegister />
  )
}