export const useDateFormat = () => {
    const formatMessageDate = (dateString: string | Date) => {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        const diffTime = today.getTime() - messageDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        }
        if (diffDays === 1) {
            return 'Вчера';
        }
        if (diffDays < 7) {
            return date.toLocaleDateString('ru-RU', { weekday: 'short' });
        }
        return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return { formatMessageDate };
};