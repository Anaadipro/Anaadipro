"use client";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { Hourglass, X } from "lucide-react";

export default function MiniWeeklyCountdownTimer() {
    const [remainingTime, setRemainingTime] = useState(getTimeLeftToNextWednesdayNight());
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setRemainingTime(getTimeLeftToNextWednesdayNight());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    function getTimeLeftToNextWednesdayNight() {
        const now = moment();
        const dayOfWeek = now.isoWeekday(); // 1 = Monday, ..., 7 = Sunday

        // Calculate how many days since last Thursday
        const daysSinceThursday = (dayOfWeek >= 4)
            ? dayOfWeek - 4
            : 7 - (4 - dayOfWeek);

        // Start of this weekly cycle (Thursday 00:00)
        const startOfWeek = now.clone().subtract(daysSinceThursday, "days").startOf("day");

        // End of this weekly cycle (Wednesday 23:59:59)
        const endOfWeek = startOfWeek.clone().add(6, "days").endOf("day");

        const duration = moment.duration(endOfWeek.diff(now));
        return {
            days: Math.floor(duration.asDays()),
            hours: duration.hours(),
            minutes: duration.minutes(),
            seconds: duration.seconds(),
        };
    }

    const formatTime = (num) => String(num).padStart(2, "0");

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white rounded px-4 py-3 text-xs animate-fade-in">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1 text-[11px] font-semibold">
                    <Hourglass className="w-4 h-4 animate-pulse" />
                    Weekly Timer
                </div>
                <button onClick={() => setVisible(false)} className="text-white/80 hover:text-white">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-4 gap-1 font-mono text-[11px]">
                <div className="bg-white/20 rounded p-1 text-center">
                    <div className="text-sm">{formatTime(remainingTime.days)}</div>
                    <div>Days</div>
                </div>
                <div className="bg-white/20 rounded p-1 text-center">
                    <div className="text-sm">{formatTime(remainingTime.hours)}</div>
                    <div>Hour</div>
                </div>
                <div className="bg-white/20 rounded p-1 text-center">
                    <div className="text-sm">{formatTime(remainingTime.minutes)}</div>
                    <div>Minutes</div>
                </div>
                <div className="bg-white/20 rounded p-1 text-center">
                    <div className="text-sm">{formatTime(remainingTime.seconds)}</div>
                    <div>Seconds</div>
                </div>
            </div>
        </div>
    );
}
