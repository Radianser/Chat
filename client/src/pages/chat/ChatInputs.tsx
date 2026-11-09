import { useState } from 'react';

export default function ChatInputs() {
    const [message, setMessage] = useState('');

    function handleInput(e: any) {
        setMessage(() => e.target.value);
    }

    function sendMessage() {
        if (!message) return;

        console.log('message: ', message);
        setMessage(() => '');
    }

    return (
        <div className="chat-inputs-wrapper">
            <div className="custom-input">
                <input 
                    value={message} 
                    onInput={(e) => handleInput(e)} 
                    type="text" 
                    className="chat-input" 
                    name="message" 
                    placeholder="Write a message"
                />
                <button 
                    onClick={() => sendMessage()} 
                    className="sendMessageButton"
                >→</button>
            </div>
        </div>
    );
}