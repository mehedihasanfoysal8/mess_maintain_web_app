"use client";
import { useState } from "react";
import { ChevronDown, PieChart } from "lucide-react";

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        { q: "Is MessMaintain free to use?", a: "Yes! MessMaintain is completely free for student messes and small bachelor shared living spaces." },
        { q: "How many members can join a mess?", a: "There is no hard limit. You can manage a mess with 3 members or 30 members seamlessly." },
        { q: "Is my data secure?", a: "Absolutely. We use industry-standard encryption and JWT-based authentication to keep your financial data private." },
        { q: "Can I use it on my mobile phone?", a: "Yes, MessMaintain is built with a responsive mobile-first approach and works perfectly on any device." },
        { q: "How does the automated calculation work?", a: "We divide the total bazar cost by the number of active meals to find the meal rate. It is transparent, fair, and calculated automatically." }
    ];

    return (
        <section className="py-20 sm:py-32 bg-slate-50 dark:bg-slate-900/20 relative z-10 border-t border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="text-center mb-20">
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Frequently Asked Questions</h2>
                <p className="text-xl text-slate-500 dark:text-slate-400">Everything you need to know about MessMaintain and how it works.</p>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                    {/* LEFT SIDE */}
                    <div className="relative order-1 lg:order-none">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>

                        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl h-auto lg:h-[500px] flex flex-col justify-center items-center overflow-hidden group">

                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700"></div>
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>

                            <div className="z-10 text-center relative">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full"></div>

                                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 sm:p-8 rounded-full inline-block mb-6 relative border border-indigo-100 dark:border-indigo-800/50 shadow-xl">
                                    <PieChart className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-600 dark:text-indigo-400" />
                                </div>

                                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
                                    Still have questions?
                                </h3>

                                <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                                    We're here to help you make your shared living experience seamless.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="order-2 lg:order-none">

                        <div className="space-y-4">
                            {faqs.map((faq, idx) => {
                                const isOpen = openIndex === idx;

                                return (
                                    <div
                                        key={idx}
                                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300"
                                    >
                                        <button
                                            onClick={() => setOpenIndex(isOpen ? null : idx)}
                                            className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
                                        >
                                            <h4 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex gap-3">
                                                <span className="text-indigo-600 dark:text-indigo-400 font-black">
                                                    Q.
                                                </span>
                                                {faq.q}
                                            </h4>

                                            <ChevronDown
                                                className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </button>

                                        <div
                                            className={`px-5 sm:px-6 overflow-hidden transition-all duration-300 ${isOpen ? "max-h-40 pb-5 sm:pb-6 opacity-100" : "max-h-0 opacity-0"
                                                }`}
                                        >
                                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed ml-7 text-sm sm:text-base">
                                                {faq.a}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}