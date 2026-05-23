import React from "react";

const Hero: React.FC = () => {
  return (
    <section
      className="
        relative
        w-full
        min-h-screen
        flex
        items-center
        justify-center
        px-4
        sm:px-6
        lg:px-8
        py-16
        overflow-hidden
        bg-cover
        bg-center
        bg-no-repeat
      "
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1654658975918-a2c06424550a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBidWlsZGQtbm8lMjBhcGFydG1lbnQlMjBidWlsZGQtaW5nLXN0cmVldHN8ZW58MXx8fHwxNzY2MDcxMzM3&ixlib=rb-4.1.0&q=80&w=1080')",
      }}
    >
      {/* White Overlay */}
      <div className="absolute inset-0 bg-white/60" />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#A989C8]/40 rounded-full blur-[100px]" />

        <div className="absolute bottom-[-10%] left-[-10%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-[#A989C8]/30 rounded-full blur-[90px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto text-center">
        
        {/* Heading */}
        <h1
          className="
            text-4xl
            sm:text-5xl
            md:text-6xl
            font-extrabold
            leading-tight
            tracking-tight
            text-[#1A1D2E]
            mb-6
          "
        >
          Find Verified Rentals
          <br />
          You Can Trust
        </h1>

        {/* Paragraph */}
        <p
          className="
            text-sm
            sm:text-base
            md:text-lg
            max-w-2xl
            mx-auto
            leading-relaxed
            mb-10
            text-[#1A1D2E]
            px-2
          "
        >
          Discover comfortable rooms, modern flats, and prime
          land across Nepal. Secure bookings with verified
          landlords and digital agreements.
        </p>

        {/* Search Card */}
        <div
          className="
            bg-white
            rounded-3xl
            shadow-[0_20px_50px_rgba(0,0,0,0.08)]
            border
            border-gray-100
            p-5
            sm:p-8
            w-full
            max-w-md
            md:max-w-3xl
            mx-auto
          "
        >
          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            
            {/* Location */}
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-500 mb-2 ml-1">
                Location
              </label>

              <div className="relative flex items-center">
                <span className="absolute left-4 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </span>

                <input
                  type="text"
                  placeholder="Kathmandu, Patan..."
                  className="
                    w-full
                    pl-12
                    pr-4
                    py-3
                    border
                    border-gray-200
                    rounded-xl
                    outline-none
                    focus:border-[#A989C8]
                    focus:ring-2
                    focus:ring-[#A989C8]/20
                    transition-all
                    text-gray-700
                    text-sm
                    sm:text-base
                  "
                />
              </div>
            </div>

            {/* Property Type */}
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-500 mb-2 ml-1">
                Property Type
              </label>

              <div className="relative">
                <select
                  className="
                    w-full
                    pl-4
                    pr-10
                    py-3
                    border
                    border-gray-200
                    rounded-xl
                    outline-none
                    focus:border-[#A989C8]
                    focus:ring-2
                    focus:ring-[#A989C8]/20
                    transition-all
                    text-gray-700
                    font-medium
                    text-sm
                    sm:text-base
                  "
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select type
                  </option>

                  <option value="room">Room</option>
                  <option value="land">Land</option>
                  <option value="flats">Flats</option>
                </select>

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  ▼
                </span>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <button
            className="
              w-full
              bg-[#A989C8]
              hover:bg-[#8d6aa9]
              text-white
              font-bold
              py-3.5
              rounded-xl
              transition-all
              shadow-md
              flex
              items-center
              justify-center
              gap-2
              group
              text-sm
              sm:text-base
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:scale-110 transition-transform"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>

            Search Properties
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;