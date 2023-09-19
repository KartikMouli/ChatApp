import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { auth } from "../firebase";
import axios from "axios";
import { useAuth } from "../contexts/authContexts";
import { ChatEngine } from "react-chat-engine";
import './Chats.css';
import moment from 'moment-timezone';

moment.tz.setDefault('Asia/Kolkata');

const Chats = () => {
    const history = useHistory();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState(null);
    const [theme, setTheme] = useState("light");

    const handleNewMessage = async (chatId, message) => {
        setNewMessage({ chatId, message });
    };

    const handleLogout = async () => {
        await auth.signOut();
        history.push("/");
    };

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    const getFile = async (url) => {
        const response = await fetch(url);
        const data = await response.blob();

        return new File([data], "userphoto.jpg", { type: "image/jpeg" });
    };

    const handleExportChat = async () => {
        try {
            const response = await axios.get(`https://api.chatengine.io/chats/`, {
                headers: {
                    "Project-ID": "c3738c23-e150-42d2-b865-82dd19b60940",
                    "User-Name": user.email,
                    "User-Secret": user.uid,
                },
            });

            const chatData = response.data;
            const chatPromises = chatData.map(async (chat) => {
                const chatResponse = await axios.get(
                    `https://api.chatengine.io/chats/${chat.id}/messages/`,
                    {
                        headers: {
                            "Project-ID": "c3738c23-e150-42d2-b865-82dd19b60940",
                            "User-Name": user.email,
                            "User-Secret": user.uid,
                        },
                    }
                );
                const messages = chatResponse.data;
                return messages.map((message) => {
                    const { id, created, sender_username, text } = message;
                    return `${id} ${created} ${sender_username}: ${text}`;
                }).join('\n');
            });

            const chatTextDataArray = await Promise.all(chatPromises);
            const chatTextData = chatTextDataArray.join('\n');

            const blob = new Blob([chatTextData], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "chats.txt";
            link.click();
        } catch (error) {
            console.log(error);
        }
    };


    useEffect(() => {
        if (!user) {
            history.push("/");
            return;
        }
        if (newMessage) {
            // display a popup notification
            alert(`New message arrived !`);
        }



        axios.get("https://api.chatengine.io/users/me", {
            headers: {
                projectId: "c3738c23-e150-42d2-b865-82dd19b60940",
                "user-name": user.email,
                "user-secret": user.uid,
            },
        })
            .then(() => {
                setLoading(false);
            })
            .catch(() => {
                const formData = new FormData();
                formData.append("email", user.email);
                formData.append("username", user.email);
                formData.append("secret", user.uid);

                getFile(user.photoURL)
                    .then((avatar) => {
                        formData.append("avatar", avatar, avatar.name);

                        axios.post(
                            'https://api.chatengine.io/users/',
                            formData,
                            { headers: { "private-key": "03d60a07-b25e-46e1-a779-4f937e2f5cb2" } }
                        )
                            .then(() => setLoading(false))
                            .catch((error) => console.log(error));
                    });
            });
    }, [user, history, newMessage]);


    if (!user) return "Loading...";

    return (
        <div className={`chats-page ${theme}`}>
            <div className={`nav-bar ${theme}`}>
                <div className="logo-tab">Mychat</div>
                <div className="logout-tab" onClick={handleLogout}>
                    Logout
                </div>
                <div className="export-chat" onClick={handleExportChat}>
                    ExportChat
                </div>
                <div className="theme-switcher" onClick={toggleTheme}>
                    {theme === "light" ? "☀️" : "🌙"}
                </div>

            </div>
            <ChatEngine
                height="calc(100vh - 66px)"
                projectID="c3738c23-e150-42d2-b865-82dd19b60940"
                userName={user.email}
                userSecret={user.uid}
                offset={6}
                renderScrollDownBar={(chat) => {}}
                renderIceBreaker={(chat) => {}}
                onNewMessage={handleNewMessage}
            ></ChatEngine>
        </div>
    );
};

export default Chats;
