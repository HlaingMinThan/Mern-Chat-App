import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "./contexts/UserContext.jsx";
import axios from "axios";
import Avatar from './components/Avatar';

export default function ChatPage() {
    const [onlinePeople, setOnlinePeople] = useState([]);
    const [selectedUsername, setSelectedUsername] = useState("");
    const [newMessageText, setNewMessageText] = useState('');
    const { user, setUser } = useContext(UserContext);
    const [ws, setWs] = useState(null);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:3001');
        setWs(ws);
        ws.addEventListener('message', handleServerMessage)

        return () => {
            ws.close()
        }
    }, []);

    let handleServerMessage = (e) => {
        console.log(e)
        let { onlineUsers } = JSON.parse(e.data);

        let uniqueOnlineUser = {};

        onlineUsers.forEach(user => {
            uniqueOnlineUser[user._id] = user.username
        });
        console.log(onlineUsers)
        setOnlinePeople(Object.values(uniqueOnlineUser));
    }

    function logout() {
        axios.post('/logout').then(() => {
            setUser(null);
        });
    }

    return (
        <div className="flex h-screen">
            <div className="bg-white w-1/4 flex flex-col">
                <div className="flex-grow ">
                    <h2 className="font-bold text-3xl p-3 text-blue-600 flex gap-2 items-center my-3  ml-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>

                        Chatify</h2>
                    {!!onlinePeople.length && onlinePeople.map(username => (
                        username !== user.username && (
                            <div key={username} className={"border border-b-1 p-3 text-lg flex gap-4 items-center cursor-pointer " + (selectedUsername === username ? 'bg-blue-50' : '')} onClick={() => setSelectedUsername(username)}>
                                <Avatar username={username} />
                                <span className="text-lg">{username}</span>
                            </div>
                        )
                    ))}
                </div>
                <div className="p-2 text-center flex items-center justify-center">
                    <span className="mr-2 text-sm text-gray-600 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                        </svg>
                        {user.username}
                    </span>
                    <button
                        onClick={logout}
                        className="text-sm bg-blue-100 py-1 px-2 text-gray-500 border rounded-sm">logout</button>
                </div>
            </div>
            <div className="flex flex-col bg-blue-50 w-3/4 p-2">
                <div className="flex-grow">

                    <div className="relative h-full">
                        <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                            messages
                        </div>
                    </div>
                </div>
                <form className="flex gap-2" >
                    <input type="text"
                        value={newMessageText}
                        onChange={ev => setNewMessageText(ev.target.value)}
                        placeholder="Type your message here"
                        className="bg-white flex-grow border rounded-sm p-2" />
                    <label className="bg-blue-200 p-2 text-gray-600 cursor-pointer rounded-sm border border-blue-200">
                        <input type="file" className="hidden" />
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
                        </svg>
                    </label>
                    <button type="submit" className="bg-blue-500 p-2 text-white rounded-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}