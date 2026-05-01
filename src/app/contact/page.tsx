import { LandingNavbar } from "@/components/LandingNavbar";
import { Mail, MessageCircle, PieChart } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">

      <LandingNavbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-16 sm:pt-20 pb-20 sm:pb-24 relative z-10">

        {/* Background */}
        <div className="absolute top-0 inset-x-0 h-screen pointer-events-none flex items-center justify-center">
          <div className="absolute top-[20%] w-[70%] sm:w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent blur-3xl" />
        </div>

        <div className="w-full max-w-4xl relative z-10">

          {/* Heading */}
          <div className="text-center mb-10 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              Contact Support
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
              Have questions or need help? Reach out to us.
            </p>
          </div>

          {/* Cards */}
          <div className="grid gap-4 sm:gap-6">

            {/* WhatsApp */}
            <a
              href="https://wa.me/8801719064743"
              target="_blank"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:shadow-xl transition-all active:scale-[0.98]"
            >
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 sm:p-4 rounded-xl text-emerald-600">
                <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">WhatsApp</p>
                <p className="text-lg sm:text-xl font-bold break-all">01719064743</p>
                <p className="text-sm text-slate-500 mt-1">Fast response</p>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:mehedihasanfoysal8@gmail.com"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:shadow-xl transition-all active:scale-[0.98]"
            >
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 sm:p-4 rounded-xl text-indigo-600">
                <Mail className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Email</p>
                <p className="text-lg sm:text-xl font-bold break-all">
                  mehedihasanfoysal8@gmail.com
                </p>
                <p className="text-sm text-slate-500 mt-1">Send anytime</p>
              </div>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/mehedihasanfoysal8/"
              target="_blank"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 hover:shadow-xl transition-all active:scale-[0.98]"
            >
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 sm:p-4 rounded-xl text-blue-600">
                <svg width="26" height="26" viewBox="0 0 30 30">
                  <path d="M15,3C8.373,3,3,8.373,3,15c0,6.016,4.432,10.984,10.206,11.852V18.18h-2.969v-3.154h2.969v-2.099c0-3.475,1.693-5,4.581-5c1.383,0,2.115,0.103,2.461,0.149v2.753h-1.97c-1.226,0-1.654,1.163-1.654,2.473v1.724h3.593L19.73,18.18h-3.106v8.697C22.481,26.083,27,21.075,27,15C27,8.373,21.627,3,15,3z"></path>
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Facebook</p>
                <p className="text-lg sm:text-xl font-bold">Mehedi Hasan Foysal</p>
                <p className="text-sm text-slate-500 mt-1">Connect with us</p>
              </div>
            </a>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-900/20 border-t border-slate-200 dark:border-slate-800 text-slate-400 py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
                  <PieChart size={24} />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">MessMaintain</span>
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed mb-8 text-lg">
                The smart, automated, and transparent way to manage shared living expenses, meals, and deposits.
              </p>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer text-slate-300">
                  <span className="font-bold text-xs">FB</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors cursor-pointer text-slate-300">
                  <span className="font-bold text-xs">TW</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors cursor-pointer text-slate-300">
                  <span className="font-bold text-xs">IG</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Product</h4>
              <ul className="space-y-4">
                <li><Link href="#features" className="hover:text-indigo-400 transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-indigo-400 transition-colors">How it Works</Link></li>
                <li><Link href="/register" className="hover:text-indigo-400 transition-colors">Create Mess</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Legal</h4>
              <ul className="space-y-4">
                <li><Link href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact Support</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© {new Date().getFullYear()} MessMaintain. All rights reserved.</p>
            <p className="text-sm flex items-center gap-1">Built with <span className="text-rose-500">❤️</span> for better living.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}