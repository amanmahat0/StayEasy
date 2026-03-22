const StatsStrip = () => {
  const stats = [
    { value: "1000+", label: "Properties Listed" },
    { value: "500+", label: "Verified Landlords" },
    { value: "2000+", label: "Happy Tenants" },
    { value: "50+", label: "Cities in Nepal" },
  ];

  return (
    <section className="bg-gray-50 py-12 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-1">
            <h3 className="text-3xl md:text-4xl font-bold text-[#A989C8]">{stat.value}</h3>
            <p className="text-gray-600 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsStrip;