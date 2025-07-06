import { GraduationCap, BarChart3, Users, Shield, ChevronRight, Star } from 'lucide-react';

const Home = () => {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-white opacity-50"></div>
            
            <div className="relative z-10 flex items-center justify-center min-h-screen">
                <section className="bg-white w-full p-12">
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-8 shadow-lg">
                            <GraduationCap className="w-12 h-12 text-white" />
                        </div>
                        
                        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent mb-6 tracking-tight">
                            Smart Marks Portal
                        </h1>
                        
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Transform your educational experience with our comprehensive student performance management platform. 
                            Secure, intelligent, and designed for the modern classroom.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
                                Get Started
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="px-8 py-4 border-2 border-blue-600 text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300 hover:shadow-md">
                                Learn More
                            </button>
                        </div>
                    </div>
                    
                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-shadow duration-300">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-4">
                                <BarChart3 className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Analytics & Insights</h3>
                            <p className="text-gray-600">Advanced analytics to track student progress and identify areas for improvement.</p>
                        </div>
                        
                        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-lg transition-shadow duration-300">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-xl mb-4">
                                <Users className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Collaborative Platform</h3>
                            <p className="text-gray-600">Seamless collaboration between educators, students, and administrators.</p>
                        </div>
                        
                        <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-shadow duration-300">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-xl mb-4">
                                <Shield className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Secure & Reliable</h3>
                            <p className="text-gray-600">Bank-level security with 99.9% uptime guarantee for peace of mind.</p>
                        </div>
                    </div>
                    
                    {/* Trust Indicators */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                            <span className="font-medium">Trusted by 10,000+ educators</span>
                        </div>
                        <div className="text-gray-600 font-medium">
                            ISO 27001 Certified
                        </div>
                        <div className="text-gray-600 font-medium">
                            99.9% Uptime SLA
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Home;