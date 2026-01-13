<!DOCTYPE html>
<html lang="bn" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>mCash Remit - Send Money to Bangladesh</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet">
    
    <script src="https://cdn.tailwindcss.com"></script>
    
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#0056D2', // mCash Blue
                        secondary: '#FDB913', // mCash Gold
                        dark: '#0B1120',
                        light: '#F4F7FA'
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        heading: ['Poppins', 'sans-serif'],
                    },
                    animation: {
                        'float': 'float 6s ease-in-out infinite',
                        'float-delayed': 'float 6s ease-in-out 3s infinite',
                        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    },
                    keyframes: {
                        float: {
                            '0%, 100%': { transform: 'translateY(0)' },
                            '50%': { transform: 'translateY(-20px)' },
                        }
                    }
                }
            }
        }
    </script>

    <style>
        /* Custom Styles for Glassmorphism & Animations */
        body { font-family: 'Inter', sans-serif; overflow-x: hidden; }
        
        .glass-header {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.3);
        }

        .hero-bg {
            background: linear-gradient(135deg, #0056D2 0%, #003a8c 100%);
            position: relative;
            overflow: hidden;
        }

        /* Animated Blobs in Background */
        .blob {
            position: absolute;
            filter: blur(80px);
            z-index: 0;
            opacity: 0.6;
        }
        .blob-1 { top: -10%; left: -10%; width: 500px; height: 500px; background: #4facfe; animation: float 8s infinite; }
        .blob-2 { bottom: -10%; right: -10%; width: 400px; height: 400px; background: #FDB913; animation: float-delayed 10s infinite; }

        .glass-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
        }

        .feature-card {
            transition: all 0.3s ease;
        }
        .feature-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0, 86, 210, 0.1);
        }
    </style>
</head>
<body class="bg-light text-slate-800">

    <header class="fixed w-full top-0 z-50 glass-header transition-all duration-300">
        <div class="container mx-auto px-6 py-4 flex justify-between items-center">
            <div class="flex items-center gap-2">
                <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    M
                </div>
                <span class="text-2xl font-heading font-bold text-primary">mCash<span class="text-secondary">Remit</span></span>
            </div>

            <nav class="hidden md:flex space-x-8 font-medium text-slate-600">
                <a href="#" class="hover:text-primary transition">Home</a>
                <a href="#features" class="hover:text-primary transition">Features</a>
                <a href="#rates" class="hover:text-primary transition">Exchange Rates</a>
                <a href="#contact" class="hover:text-primary transition">Contact</a>
            </nav>

            <a href="#" class="hidden md:inline-block bg-secondary text-dark font-bold px-6 py-2.5 rounded-full hover:bg-yellow-400 transition shadow-lg transform hover:scale-105">
                Download App
            </a>

            <button class="md:hidden text-2xl text-slate-700">
                <i class="fa-solid fa-bars"></i>
            </button>
        </div>
    </header>

    <section class="hero-bg pt-40 pb-20 md:pt-48 md:pb-32 text-white relative">
        <div class="blob blob-1 rounded-full"></div>
        <div class="blob blob-2 rounded-full"></div>

        <div class="container mx-auto px-6 relative z-10">
            <div class="flex flex-col md:flex-row items-center gap-12">
                
                <div class="w-full md:w-1/2 space-y-6" data-aos="fade-right">
                    <span class="inline-block bg-white/20 px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/10 text-secondary">
                        🚀 #1 Trusted Remittance App
                    </span>
                    <h1 class="text-4xl md:text-6xl font-heading font-bold leading-tight">
                        Send Money to <br>
                        <span class="text-secondary">Bangladesh</span> Instantly
                    </h1>
                    <p class="text-lg text-blue-100 max-w-lg leading-relaxed">
                        Best exchange rates, low fees, and instant transfer. Your trusted partner for sending money home safely.
                    </p>
                    
                    <div class="flex flex-wrap gap-4 pt-4">
                        <button class="bg-secondary text-dark font-bold px-8 py-4 rounded-xl hover:bg-yellow-400 transition shadow-xl flex items-center gap-2 transform hover:-translate-y-1">
                            <i class="fa-brands fa-google-play text-xl"></i> Google Play
                        </button>
                        <button class="bg-white text-primary font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition shadow-xl flex items-center gap-2 transform hover:-translate-y-1">
                            <i class="fa-brands fa-apple text-xl"></i> App Store
                        </button>
                    </div>

                    <div class="flex items-center gap-4 pt-6 text-sm font-medium opacity-90">
                        <div class="flex items-center gap-1"><i class="fa-solid fa-circle-check text-green-400"></i> Secure</div>
                        <div class="flex items-center gap-1"><i class="fa-solid fa-circle-check text-green-400"></i> Fast</div>
                        <div class="flex items-center gap-1"><i class="fa-solid fa-circle-check text-green-400"></i> 24/7 Support</div>
                    </div>
                </div>

                <div class="w-full md:w-1/2 flex justify-center md:justify-end" data-aos="fade-left">
                    <div class="relative w-80 md:w-96">
                        <div class="glass-card p-6 rounded-3xl animate-float">
                            <div class="flex justify-between items-center mb-6">
                                <span class="text-sm font-medium opacity-80">Send Amount</span>
                                <span class="bg-white/20 px-2 py-1 rounded text-xs">MYR</span>
                            </div>
                            <div class="text-3xl font-bold mb-2">1,000.00</div>
                            
                            <div class="my-6 relative h-px bg-white/20">
                                <div class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-secondary p-2 rounded-full text-dark">
                                    <i class="fa-solid fa-arrow-down-up"></i>
                                </div>
                            </div>

                            <div class="flex justify-between items-center mb-6">
                                <span class="text-sm font-medium opacity-80">They Receive</span>
                                <span class="bg-white/20 px-2 py-1 rounded text-xs">BDT</span>
                            </div>
                            <div class="text-3xl font-bold text-secondary mb-6">25,450.00</div>

                            <button class="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg">
                                Send Now
                            </button>
                        </div>
                        
                        <div class="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl animate-float-delayed flex items-center gap-3 text-dark">
                            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <i class="fa-solid fa-check"></i>
                            </div>
                            <div>
                                <div class="text-xs text-gray-500">Transfer Status</div>
                                <div class="font-bold">Completed</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
            <svg class="relative block w-full h-[60px] md:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="fill-light"></path>
            </svg>
        </div>
    </section>

    <section id="features" class="py-20 bg-light">
        <div class="container mx-auto px-6">
            <div class="text-center max-w-2xl mx-auto mb-16" data-aos="fade-up">
                <h2 class="text-3xl md:text-4xl font-heading font-bold text-dark mb-4">
                    Why Choose <span class="text-primary">mCash?</span>
                </h2>
                <p class="text-slate-600">We provide the safest, fastest, and most affordable way to send your hard-earned money to your family.</p>
            </div>

            <div class="grid md:grid-cols-3 gap-8">
                <div class="feature-card bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center" data-aos="fade-up" data-aos-delay="100">
                    <div class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary text-3xl mx-auto mb-6">
                        <i class="fa-solid fa-bolt"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3">Instant Transfer</h3>
                    <p class="text-slate-500 text-sm leading-relaxed">
                        Your money reaches your loved ones in seconds. No more waiting days for bank transfers.
                    </p>
                </div>

                <div class="feature-card bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center" data-aos="fade-up" data-aos-delay="200">
                    <div class="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center text-secondary text-3xl mx-auto mb-6">
                        <i class="fa-solid fa-hand-holding-dollar"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3">Best Rates</h3>
                    <p class="text-slate-500 text-sm leading-relaxed">
                        We offer the highest exchange rates in the market with zero hidden fees. More money for your family.
                    </p>
                </div>

                <div class="feature-card bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center" data-aos="fade-up" data-aos-delay="300">
                    <div class="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 text-3xl mx-auto mb-6">
                        <i class="fa-solid fa-shield-halved"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-3">100% Secure</h3>
                    <p class="text-slate-500 text-sm leading-relaxed">
                        Bank-grade security encryption ensures your money and data are always safe with us.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <section class="py-20 bg-white">
        <div class="container mx-auto px-6">
            <div class="flex flex-col md:flex-row items-center gap-16">
                <div class="w-full md:w-1/2" data-aos="fade-right">
                    <img src="https://img.freepik.com/free-vector/e-wallet-concept-illustration_114360-7561.jpg" alt="How it works" class="rounded-3xl shadow-2xl w-full">
                </div>
                <div class="w-full md:w-1/2 space-y-8" data-aos="fade-left">
                    <h2 class="text-3xl md:text-4xl font-heading font-bold text-dark">
                        Send Money in <br><span class="text-primary">3 Simple Steps</span>
                    </h2>

                    <div class="flex gap-4">
                        <div class="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">1</div>
                        <div>
                            <h4 class="text-xl font-bold mb-2">Create Account</h4>
                            <p class="text-slate-500">Sign up with your details and verify your identity in minutes.</p>
                        </div>
                    </div>

                    <div class="flex gap-4">
                        <div class="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">2</div>
                        <div>
                            <h4 class="text-xl font-bold mb-2">Enter Amount</h4>
                            <p class="text-slate-500">Enter how much you want to send and choose the recipient.</p>
                        </div>
                    </div>

                    <div class="flex gap-4">
                        <div class="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">3</div>
                        <div>
                            <h4 class="text-xl font-bold mb-2">Confirm & Send</h4>
                            <p class="text-slate-500">Pay using your preferred method and money is sent instantly.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="py-20">
        <div class="container mx-auto px-6">
            <div class="bg-primary rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl" data-aos="zoom-in">
                <div class="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                <div class="absolute bottom-0 left-0 w-40 h-40 bg-secondary opacity-10 rounded-full -ml-10 -mb-10"></div>

                <h2 class="text-3xl md:text-5xl font-heading font-bold text-white mb-6 relative z-10">
                    Ready to send money?
                </h2>
                <p class="text-blue-100 text-lg mb-8 max-w-2xl mx-auto relative z-10">
                    Join thousands of happy customers who trust mCash Remit for their daily transactions. Download the app today!
                </p>
                <div class="flex flex-col md:flex-row justify-center gap-4 relative z-10">
                    <button class="bg-secondary text-dark font-bold px-8 py-3 rounded-full hover:bg-yellow-400 transition shadow-lg">
                        Download Now
                    </button>
                    <button class="bg-transparent border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white hover:text-primary transition">
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    </section>

    <footer class="bg-dark text-white pt-20 pb-10">
        <div class="container mx-auto px-6">
            <div class="grid md:grid-cols-4 gap-12 mb-16">
                <div class="col-span-1 md:col-span-1">
                    <div class="flex items-center gap-2 mb-6">
                        <div class="w-8 h-8 bg-primary rounded flex items-center justify-center font-bold">M</div>
                        <span class="text-xl font-bold">mCash</span>
                    </div>
                    <p class="text-gray-400 text-sm leading-relaxed">
                        Fast, secure and reliable remittance service for Bangladesh expatriates worldwide.
                    </p>
                </div>

                <div>
                    <h4 class="font-bold text-lg mb-6">Quick Links</h4>
                    <ul class="space-y-3 text-gray-400 text-sm">
                        <li><a href="#" class="hover:text-secondary transition">About Us</a></li>
                        <li><a href="#" class="hover:text-secondary transition">How it Works</a></li>
                        <li><a href="#" class="hover:text-secondary transition">Exchange Rates</a></li>
                        <li><a href="#" class="hover:text-secondary transition">Testimonials</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-bold text-lg mb-6">Legal</h4>
                    <ul class="space-y-3 text-gray-400 text-sm">
                        <li><a href="#" class="hover:text-secondary transition">Privacy Policy</a></li>
                        <li><a href="#" class="hover:text-secondary transition">Terms of Service</a></li>
                        <li><a href="#" class="hover:text-secondary transition">Compliance</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-bold text-lg mb-6">Contact Us</h4>
                    <ul class="space-y-3 text-gray-400 text-sm">
                        <li class="flex items-center gap-3"><i class="fa-solid fa-envelope text-primary"></i> support@mcash.com</li>
                        <li class="flex items-center gap-3"><i class="fa-solid fa-phone text-primary"></i> +60 12-345 6789</li>
                        <li class="flex items-center gap-3"><i class="fa-solid fa-location-dot text-primary"></i> Kuala Lumpur, Malaysia</li>
                    </ul>
                </div>
            </div>

            <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                <p>&copy; 2026 mCash Remit. All rights reserved.</p>
                <div class="flex gap-4 mt-4 md:mt-0">
                    <a href="#" class="hover:text-white transition"><i class="fa-brands fa-facebook-f"></i></a>
                    <a href="#" class="hover:text-white transition"><i class="fa-brands fa-twitter"></i></a>
                    <a href="#" class="hover:text-white transition"><i class="fa-brands fa-instagram"></i></a>
                </div>
            </div>
        </div>
    </footer>

    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script>
        AOS.init({
            duration: 800,
            once: true,
            offset: 100
        });

        // Navbar Scroll Effect
        window.addEventListener('scroll', function() {
            const header = document.querySelector('header');
            if (window.scrollY > 50) {
                header.classList.add('shadow-md', 'py-2');
            } else {
                header.classList.remove('shadow-md', 'py-2');
            }
        });
    </script>
</body>
</html>