import React, { useEffect, useState } from 'react';
import { profile } from '@/shared/config/profile';

const format = (now) =>
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: profile.location.timeZone }).format(now);

// Local time in the owner's city. Updates once a minute, so it costs nothing.
const WarsawClock = () => {
    const [time, setTime] = useState(() => format(new Date()));
    useEffect(() => {
        const id = setInterval(() => setTime(format(new Date())), 30_000);
        return () => clearInterval(id);
    }, []);
    return <time dateTime={time}>{time}</time>;
};

export default WarsawClock;
