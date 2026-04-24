import Link from "next/link";
import { ArrowRight, CheckCircle2, PieChart, Users, DollarSign, Shield, Zap, TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-screen pointer-events-none overflow-hidden flex items-start justify-center">
        <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-transparent blur-3xl dark:from-indigo-600/30 dark:via-purple-800/20" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-bl from-blue-500/20 via-cyan-500/10 to-transparent blur-3xl dark:from-blue-600/20 dark:via-cyan-800/20" />
      </div>

      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <PieChart size={24} className="animate-pulse" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 tracking-tight">
            MessMaintain
          </span>
        </div>
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">How it works</Link>
          </div>
          <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-6">
            <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/register" className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5">
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center text-center px-6 pt-32 pb-40 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-sm font-medium mb-10 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="flex absolute h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="text-slate-700 dark:text-slate-300">MessMaintain v2.0 is now live</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight max-w-5xl leading-[1.1] mb-10 text-slate-900 dark:text-white drop-shadow-sm">
          The smart way to manage{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 dark:from-indigo-400 dark:via-purple-400 dark:to-blue-400">
            shared living.
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mb-12 leading-relaxed">
          Say goodbye to complex spreadsheets and disputes. Automate meal tracking, split expenses instantly, and view real-time balances for your entire mess.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md mx-auto">
          <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1 text-lg">
            Get Started <ArrowRight size={20} />
          </Link>
          <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 px-8 py-4 rounded-full font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm text-lg">
            Dashboard
          </Link>
        </div>

        {/* Mock Dashboard Preview */}
        <div className="mt-24 w-full max-w-5xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-4 shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50 dark:to-slate-950 top-1/2 z-10 pointer-events-none"></div>
          <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner p-6 flex flex-col gap-6 opacity-90">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl">D</div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Dream House Mess</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">April 2026</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Deposits</p>
                  <p className="font-bold text-slate-900 dark:text-white">৳1,450.00</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Mess Balance</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">+৳788.00</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
                  <div className="h-2 w-1/2 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
                  <div className="h-6 w-3/4 bg-slate-300 dark:bg-slate-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-32 relative z-10 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">Everything you need, nothing you don't</h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">MessMaintain eliminates the friction of shared expenses with smart, automated tools designed for modern living.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<DollarSign size={28} />} 
              title="Automated Accounting" 
              description="Log shared costs like Wi-Fi, individual expenses, and deposits. Everything is calculated automatically to the decimal."
              gradient="from-emerald-500 to-teal-600"
            />
            <FeatureCard 
              icon={<PieChart size={28} />} 
              title="Real-time Analytics" 
              description="View live meal rates, total balances, and personal stats instantly on your personalized dashboard."
              gradient="from-indigo-500 to-purple-600"
            />
            <FeatureCard 
              icon={<Users size={28} />} 
              title="Role-based Security" 
              description="Managers control expenses and approvals while members can transparently view all their data and history."
              gradient="from-blue-500 to-cyan-600"
            />
            <FeatureCard 
              icon={<TrendingUp size={28} />} 
              title="Meal Tracking" 
              description="Daily inputs for breakfast, lunch, and dinner. See monthly visual summaries of everyone's eating habits."
              gradient="from-amber-500 to-orange-600"
            />
            <FeatureCard 
              icon={<Shield size={28} />} 
              title="Secure Access" 
              description="JWT-based authentication ensures your data is protected. Join requests must be manually approved by managers."
              gradient="from-rose-500 to-pink-600"
            />
            <FeatureCard 
              icon={<Zap size={28} />} 
              title="Lightning Fast" 
              description="Built on Next.js 15, the application is highly optimized, fully responsive, and works seamlessly on any device."
              gradient="from-violet-500 to-fuchsia-600"
            />
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section id="how-it-works" className="py-32 bg-slate-50 dark:bg-slate-950 relative z-10 border-t border-slate-100 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-10">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">How MessMaintain works</h2>
              
              <div className="space-y-8">
                <Step 
                  number="1" 
                  title="Create or Join a Mess" 
                  description="One person acts as the Manager and creates the mess. Other roommates request to join using a secure mess password." 
                />
                <Step 
                  number="2" 
                  title="Log Daily Activity" 
                  description="Managers enter deposits, shared bills, and daily bazar costs. Members' daily meals are recorded systematically." 
                />
                <Step 
                  number="3" 
                  title="Automated Math" 
                  description="The system divides the total bazar cost by total meals to find the meal rate, then calculates exactly who owes what." 
                />
              </div>
            </div>
            
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-3xl pointer-events-none"></div>
              <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">Calculation Example</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-600 dark:text-slate-400">Total Bazar Cost</span>
                  <span className="font-semibold text-slate-900 dark:text-white">৳ 5,000</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-600 dark:text-slate-400">Total Mess Meals</span>
                  <span className="font-semibold text-slate-900 dark:text-white">100</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50">
                  <span className="text-indigo-700 dark:text-indigo-300 font-medium">Derived Meal Rate</span>
                  <span className="font-bold text-indigo-700 dark:text-indigo-300">৳ 50.00 / meal</span>
                </div>
                
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">John's Monthly Statement:</p>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Initial Deposit</span>
                    <span className="text-emerald-600 dark:text-emerald-400">+৳ 2,000</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Meals Eaten (30 × ৳50)</span>
                    <span className="text-rose-600 dark:text-rose-400">-৳ 1,500</span>
                  </div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-slate-600 dark:text-slate-400">Shared Costs (Wi-Fi/Maid)</span>
                    <span className="text-rose-600 dark:text-rose-400">-৳ 300</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-900 dark:text-white">Final Balance</span>
                    <span className="text-emerald-600 dark:text-emerald-400">+৳ 200 (Refundable)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-32 bg-indigo-50 dark:bg-slate-900/40 relative z-10 border-y border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
              <div className="relative bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Built for your lifestyle</h3>
                <ul className="space-y-6">
                  {[
                    { t: "Automated Calculations", d: "No more manual math errors in meal rates or balances." },
                    { t: "Transparency First", d: "Every member sees every transaction. No hidden costs." },
                    { t: "Instant Join", d: "Sign up, find your mess, and you're in. It's that simple." },
                    { t: "Cloud Sync", d: "Access your data from anywhere, on any device, anytime." }
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-4">
                      <div className="mt-1 h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={14} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{item.t}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{item.d}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                Managing a mess shouldn't be a <span className="text-indigo-600 dark:text-indigo-400">second job.</span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                We've taken the most painful parts of living with others—tracking meals and splitting bills—and turned them into a seamless, 5-minute daily task.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-1">500+</p>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Active Messes</p>
                </div>
                <div>
                  <p className="text-4xl font-black text-purple-600 dark:text-purple-400 mb-1">10k+</p>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Happy Members</p>
                </div>
              </div>
              <div className="pt-6">
                <Link href="/register" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:gap-3 transition-all">
                  Start your mess today <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-white dark:bg-slate-950 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Trusted by hundreds of roommates</h2>
            <p className="text-xl text-slate-500 dark:text-slate-400">Join the community of smarter shared living.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: "Rahat Ahmed", r: "Student, DU", t: "MessMaintain turned our daily arguments into 5-minute task. The automated meal rate calculation is a lifesaver!" },
              { n: "Sabbir Hossain", r: "Job Holder, Dhaka", t: "Finally a system that handles deposits and shared costs transparently. Highly recommended for any bachelor mess." },
              { n: "Ariful Islam", r: "Manager, Green Mess", t: "As a manager, I love how easy it is to approve members and log bazar costs. The monthly summary is perfect." }
            ].map((testi, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 relative">
                <div className="flex gap-1 text-amber-500 mb-4">
                  {[1,2,3,4,5].map(s => <span key={s}>★</span>)}
                </div>
                <p className="text-slate-600 dark:text-slate-400 italic mb-6 text-lg">"{testi.t}"</p>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{testi.n}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{testi.r}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-slate-50 dark:bg-slate-900/20 relative z-10 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-slate-900 dark:text-white mb-16 tracking-tight">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: "Is MessMaintain free to use?", a: "Yes! MessMaintain is completely free for student messes and small bachelor shared living spaces." },
              { q: "How many members can join a mess?", a: "There is no hard limit. You can manage a mess with 3 members or 300 members seamlessly." },
              { q: "Is my data secure?", a: "Absolutely. We use industry-standard encryption and JWT-based authentication to keep your financial data private." },
              { q: "Can I use it on my mobile phone?", a: "Yes, MessMaintain is built with a mobile-first approach and works perfectly on any smartphone browser." }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">{faq.q}</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to simplify your mess?</h2>
          <p className="text-indigo-100 text-xl mb-10">Join thousands of students and bachelors who have stopped arguing over money and started living better.</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-full font-bold hover:shadow-2xl transition-all transform hover:-translate-y-1 text-lg">
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-black text-slate-400 py-16 text-center border-t border-slate-800 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-1.5 rounded-lg">
              <PieChart size={18} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">MessMaintain</span>
          </div>
          <p className="mb-6">© {new Date().getFullYear()} MessMaintain. Built for better living.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient }: { icon: React.ReactNode, title: string, description: string, gradient: string }) {
  return (
    <div className="flex flex-col p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800/50 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-indigo-900/20 transition-all group overflow-hidden relative">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity`}></div>
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm bg-gradient-to-br ${gradient} text-white`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl border border-indigo-200 dark:border-indigo-800">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
