import { ShieldCheck, Home, Clock, BadgeCheck } from 'lucide-react';

const WhyChooseUs = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: "Verified & Secure",
      desc: "All landlords and tenants go through comprehensive KYC verification."
    },
    {
      icon: Home,
      title: "Wide Selection",
      desc: "Rooms, flats, and land across Nepal with detailed property information."
    },
    {
      icon: Clock,
      title: "Real-Time Updates",
      desc: "Automated availability tracking and instant booking notifications."
    },
    {
      icon: BadgeCheck, // Using badge for 'Digital Agreements'
      title: "Digital Agreements",
      desc: "Legally valid digital rental agreements with e-signature support."
    }
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">What Makes Us Different</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          We combine technology with local expertise to provide a seamless rental experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
                <div key={idx} className="flex flex-col items-center text-center group">
                    <div className="w-16 h-16 bg-[#A989C8]/10 rounded-2xl flex items-center justify-center text-[#A989C8] mb-6 transition-all group-hover:bg-[#A989C8] group-hover:text-white">
                        <Icon size={32} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
            )
        })}
      </div>
    </section>
  );
};

export default WhyChooseUs;