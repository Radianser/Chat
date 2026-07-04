import MagnifierIcon from '@assets/magnifier.svg?react';
import CloseIcon from '@assets/close.svg?react';
import { useState } from 'react';
import { useChatStore } from '@stores/chat/chatStore.ts';

export default function ChatSearch() {
    const { findChats, clearSearchedChats } = useChatStore.getState();
    const [inputValue, setInputValue] = useState('');

    function handleInput(e: any) {
        const value = e.target.value;

        if (e.target.value == '') {
            handleClear();
            return;
        }

        setInputValue(() => value);
        findChats(value);
    }

    function handleClear() {
        setInputValue(() => '');
        clearSearchedChats();
    }

    return (
        <div className="chat-search-wrapper">
            <div className="custom-input">
                <MagnifierIcon className="custom-input-magnifier" />
                <input type="text" className="chat-search" name="chatName" placeholder="Search Chats" value={inputValue} onInput={(e) => handleInput(e)} />
                {
                    inputValue.length > 0
                        ? <CloseIcon className="custom-input-close" onClick={() => handleClear()} />
                        : ''
                }
            </div>
        </div>
    );
}