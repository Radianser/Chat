const defaultUserImg = 'http://localhost:3000/resources/1.png';

export default function UserChatInfo({ user }:any) {
    return (
        <div className="chat-user-info">
            <img 
                src={
                        user.img 
                        ? 'http://localhost:3000' + user.img 
                        : defaultUserImg
                    } 
                alt="" 
            />
            <div>
                <div className="chat-user-name">
                    {user.name}
                </div>
                <div className="chat-user-status">
                    Online
                </div>
            </div>
        </div>
    );
}