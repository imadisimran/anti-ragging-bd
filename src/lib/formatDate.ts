import { formatDistanceToNow } from 'date-fns';

interface PostTimeProps {
    date: Date | string | number;
}

export const formatDate = ({ date }: PostTimeProps) => {

    const parsedDate = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    if (isNaN(parsedDate.getTime())) {
        return ""
    }

    const timeAgo = formatDistanceToNow(parsedDate, { addSuffix: true });

    return timeAgo
};