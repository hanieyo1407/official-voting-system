// web/components/CountdownTimer.tsx

import React, { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: Date;
  title: string;
  onCompleteMessage: string;
}

const calculateTimeLeft = (targetDate: Date): TimeLeft | null => {
  const difference = +targetDate - +new Date();
  if (difference <= 0) {
    return null;
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

const TimeBox: React.FC<{ value: number, label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center justify-center bg-white/20 backdrop-blur-sm p-3 sm:p-4 rounded-lg w-20 h-20 sm:w-24 sm:h-24 shadow-lg">
        <span className="text-3xl sm:text-4xl font-bold text-white tracking-wider">
            {String(value).padStart(2, '0')}
        </span>
        <span className="text-xs sm:text-sm uppercase text-white/80 tracking-widest">{label}</span>
    </div>
);

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, title, onCompleteMessage }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return (
        <div className="text-center p-6 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">{onCompleteMessage}</h3>
        </div>
    );
  }

  return (
    <div className="text-center">
        <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 tracking-wide">{title}</h3>
        <div className="flex justify-center items-center space-x-2 sm:space-x-4">
            <TimeBox value={timeLeft.days} label="Days" />
            <TimeBox value={timeLeft.hours} label="Hours" />
            <TimeBox value={timeLeft.minutes} label="Mins" />
            <TimeBox value={timeLeft.seconds} label="Secs" />
        </div>
    </div>
  );
};

export default CountdownTimer;
