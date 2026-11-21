import React, { useState } from 'react';
import { useSocket } from '@socket/SocketContext';
import { useChatStore } from '@src/stores/chat/chatStore.ts';
import { useUserStore } from '@src/stores/user/userStore';
import SentMarkIcon from '@assets/checkMark.svg?react';
import SeenMarkIcon from '@assets/doneMark.svg?react';

export default function ChatDirect() {
    const currentChatMessages = useChatStore((store) => store.state.currentChatMessages);
    const defaultChatImg = useChatStore(store => store.state.defaultChatImg);
    const currentUser = useUserStore((state) => state.state);
    const currentChat = useChatStore((store) => store.state.currentChat);
    const socket = useSocket();
    const [editingMessage, setEditingMessage] = useState<Record<string, any>>({
        id: '',
        text: '',
        isEditing: false
    });

    if (!currentChatMessages.length) {
        return (
            <div className='no-messages-wrapper'>
                <div className='no-messages-text'>There are no messages yet</div>
            </div>
        );
    }

    const updateMessageOnEnter = (e: React.KeyboardEvent, message: Record<string, any>) => {
        if (e.code === 'Enter' && !e.shiftKey && !e.altKey && !e.ctrlKey) {
            e.preventDefault();
            
            socket?.emit('update_message', {
                ...message,
                text: editingMessage.text
            });

            setEditingMessage({
                id: '',
                text: '',
                isEditing: false
            });
        }
    }

    const updateMessage = (message: Record<string, any>) => {
        socket?.emit('update_message', {
            ...message,
            text: editingMessage.text
        });

        setEditingMessage({
            id: '',
            text: '',
            isEditing: false
        });
    }
    
    return (
        <>
            {currentChatMessages.map((message:any, index:number) => {
                let messageDateCurrent = (new Date(message.createdAt)).toLocaleDateString('en-EN', { day: '2-digit', month: 'long' });
                let messageDatePrev = (new Date(currentChatMessages[index - 1]?.createdAt)).toLocaleDateString('en-EN', { day: '2-digit', month: 'long' });
                let messageDateHTML = messageDatePrev != messageDateCurrent
                    ?   <div className="message date" key={`date-${message._id}`}>
                            {messageDateCurrent}
                        </div>
                    :   ''

                let date = new Date(message.createdAt);
                let messageHTML = message.senderId == currentUser.id
                    ?   <div
                            className={
                                currentChatMessages[index - 1]?.senderId != message.senderId || messageDatePrev != messageDateCurrent
                                    ?   "message right-side"
                                    :   "message right-side rounded"
                            }
                        >
                            <div>
                                {
                                    editingMessage.isEditing && editingMessage.id == message._id
                                        ?   <input
                                                type="text"
                                                className='message-editing'
                                                value={editingMessage.text}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingMessage((prev: Record<string, any>) => ({
                                                        ...prev,
                                                        text: e.target.value
                                                    }))
                                                }
                                                onBlur={() => updateMessage(message)}
                                                onKeyUp={(e) => updateMessageOnEnter(e, message)}
                                                autoFocus
                                            />
                                        :   <div
                                                onClick={() => setEditingMessage({
                                                        id: message._id,
                                                        text: message.text,
                                                        isEditing: true
                                                    })
                                                }
                                            >
                                                {message.text}
                                            </div>
                                }
                                <div className='message-info'>
                                    {
                                        message.updatedAt === message.createdAt
                                            ?   ''
                                            :   <div>edited</div>
                                    }
                                    <div>{date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                                    {
                                        message.status === 'sent'
                                            ?   <SentMarkIcon className="chat-list-seen-mark status-mark" />
                                            :   <SeenMarkIcon className="chat-list-sent-mark status-mark" />
                                    }
                                </div>
                            </div>
                            {
                                currentChatMessages[index - 1]?.senderId != message.senderId || messageDatePrev != messageDateCurrent
                                    ?   <img src={currentUser.img} alt="" />
                                    :   <span style={{width: '33px'}}></span>
                            }
                        </div>
                    :   <div
                            className={
                                currentChatMessages[index - 1]?.senderId != message.senderId || messageDatePrev != messageDateCurrent
                                    ?   "message left-side"
                                    :   "message left-side rounded"
                            }
                        >
                            {
                                currentChatMessages[index - 1]?.senderId != message.senderId || messageDatePrev != messageDateCurrent
                                    ?   <img src={currentChat.chatUsers[message.senderId].img 
                                            ?   currentChat.chatUsers[message.senderId].img 
                                            :   defaultChatImg} alt="" 
                                        />
                                    :   <span style={{width: '33px'}}></span>
                            }
                            <div>
                                <div>{message.text}</div>
                                <div className='message-info'>
                                    {
                                        message.updatedAt === message.createdAt
                                            ?   ''
                                            :   <div>edited</div>
                                    }
                                    <div>{date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            </div>
                        </div>

                return <React.Fragment key={message._id}>
                        {messageDateHTML}
                        {messageHTML}
                    </React.Fragment>;
            })}
        </>
    )
}