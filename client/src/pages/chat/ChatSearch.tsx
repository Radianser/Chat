import MagnifierIcon from '@assets/magnifier.svg?react';
import CloseIcon from '@assets/close.svg?react';
import { useState, useRef } from 'react';
import { useChatStore } from '@stores/chat/chatStore.ts';
import { debounce } from '@utils/debounce.ts';
import { useSocket } from '@socket/SocketContext';
import { useUserStore } from '@src/stores/user/userStore';

export default function ChatSearch() {
    const { findChats, clearSearchedChats } = useChatStore.getState();
    const [inputValue, setInputValue] = useState('');
    const findChatsDebounce = useRef(debounce(findChats, 500)); // useRef чтобы не пересоздавалась
    const socket = useSocket();
    const userState = useUserStore((store) => store.state);

    function handleInput(e: any) {
        const value = e.target.value;

        if (value == '') {
            handleClear();
            return;
        }

        setInputValue(() => value);
        findChatsDebounce.current(value);
    }

    function handleClear() {
        setInputValue(() => '');
        clearSearchedChats();
        socket?.emit('get_chat_list', [userState.id]);
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