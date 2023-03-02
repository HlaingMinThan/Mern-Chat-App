import axios from "axios";
import { useContext, useState } from "react";
import { UserContext } from "./contexts/UserContext";

export default function LoginAndRegister() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginOrRegister, setIsLoginOrRegister] = useState('login');

    const { user, setUser } = useContext(UserContext);
    console.log(user)
    async function handleSubmit(ev) {
        ev.preventDefault()
        let api = isLoginOrRegister === 'login' ? '/login' : '/register';
        let res = await axios.post(api, {
            username,
            password
        });

        setUser({
            _id: res.data._id,
            username
        })
    }
    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
                <h3 className="text-center text-3xl font-bold my-4">Chatify</h3>
                <input value={username}
                    onChange={ev => setUsername(ev.target.value)}
                    type="text" placeholder="username"
                    className="block w-full rounded-sm p-2 mb-2 border" />
                <input value={password}
                    onChange={ev => setPassword(ev.target.value)}
                    type="password"
                    placeholder="password"
                    className="block w-full rounded-sm p-2 mb-2 border" />
                <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
                    {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
                </button>
                <div className="text-center mt-2">
                    {isLoginOrRegister === 'register' && (
                        <div>
                            Already a member?
                            <button className="ml-1" onClick={() => setIsLoginOrRegister('login')}>
                                Login here
                            </button>
                        </div>
                    )}
                    {isLoginOrRegister === 'login' && (
                        <div>
                            Dont have an account?
                            <button className="ml-1" onClick={() => setIsLoginOrRegister('register')}>
                                Register
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}