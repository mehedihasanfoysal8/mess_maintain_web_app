"use client";

import { useState, useEffect, useRef } from "react";

export default function MonthDropdown({
    selectedMonth,
    setSelectedMonth,
    monthsArr,
    yearOptions,
    width = "w-full"
}: any) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // ✅ Outside click close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    return (
        <div ref={dropdownRef} className={`relative ${width}`}>

            {/* Button */}
            <button
                onClick={() => setOpen(!open)}
                className="w-full bg-transparent text-white px-4 py-2 rounded-xl border border-white/20 flex justify-between items-center backdrop-blur-md"
            >
                <span className="truncate">{selectedMonth}</span>
                <span
                    className={`transition-transform duration-200 ${open ? "rotate-180" : ""
                        }`}
                >
                    ▼
                </span>
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    className="
          absolute left-0 mt-2 w-full
          bg-white dark:bg-slate-900
          rounded-xl shadow-2xl
          border border-slate-200 dark:border-slate-700
          z-[99999999999]
          max-h-60 overflow-y-scroll no-scrollbar
          transition-all duration-200
          animate-in fade-in zoom-in-95
        "
                >
                    {yearOptions.map((y: string) =>
                        monthsArr.map((m: string) => (
                            <div
                                key={`${m} ${y}`}
                                onClick={() => {
                                    setSelectedMonth(`${m} ${y}`);
                                    setOpen(false);
                                }}
                                className="
                  px-6 py-3
                  cursor-pointer
                  text-slate-800 dark:text-slate-200
                  hover:bg-indigo-100 dark:hover:bg-indigo-500/20
                  transition-colors duration-200
                "
                            >
                                {m} {y}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}