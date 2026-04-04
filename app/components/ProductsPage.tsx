import { Link } from "react-router";

interface ProductsPageProps {
  bannerSrc?: string;
  visible?: boolean;
}

export function ProductsPage({ bannerSrc = "/images/bg.png", visible = true }: ProductsPageProps) {
  if (!visible) return null;

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-[#f8f9ff] text-[#0f1c2c]">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-[0px_12px_32px_rgba(15,41,77,0.12)]">
        <div className="max-w-[1160px] mx-auto flex justify-between items-center px-4 h-16">
          <Link to="/" className="text-2xl font-bold text-blue-700 tracking-tight">
            Trip.com Tour
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-blue-600 border-b-2 border-blue-600 pb-1 font-semibold" href="#">Tours</a>
            <a className="text-slate-600 hover:text-blue-600 transition-colors text-sm" href="#">Hotels</a>
            <a className="text-slate-600 hover:text-blue-600 transition-colors text-sm" href="#">Flights</a>
            <a className="text-slate-600 hover:text-blue-600 transition-colors text-sm" href="#">Trains</a>
            <a className="text-slate-600 hover:text-blue-600 transition-colors text-sm" href="#">Car Rentals</a>
            <a className="text-slate-600 hover:text-blue-600 transition-colors text-sm" href="#">Bundle & Save</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-600 font-semibold text-sm hover:text-blue-600 transition-all">
              My Bookings
            </button>
            <button className="bg-gradient-to-br from-[#0049E3] to-[#3264FF] text-white px-6 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <main className="mt-16">
        {/* Hero Section */}
        <section className="relative h-[500px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              className="w-full h-full object-cover"
              src={bannerSrc}
              alt="Trip.com Tour"
            />
            <div className="absolute inset-0 bg-[#0f1c2c]/20" />
          </div>
          <div className="relative z-10 max-w-[1160px] mx-auto px-4 w-full">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight mb-8">
                Architecture of <br />
                <span className="text-[#3264ff]">Next Adventure</span>
              </h1>
            </div>
          </div>
        </section>

        {/* Featured Tours */}
        <section className="max-w-[1160px] mx-auto px-4 py-24">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-[#0049e3] font-semibold text-xs tracking-widest uppercase mb-2 block">
                Curated Experiences
              </span>
              <h2 className="text-3xl font-bold text-[#0f1c2c]">
                Architectural Wonders & Hidden Gems
              </h2>
            </div>
            <button className="text-[#0049e3] font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View all tours
              <span className="text-sm">→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {tourCards.map((tour, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-[0px_12px_32px_rgba(15,41,77,0.12)] group cursor-pointer transition-transform duration-300 hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={tour.image}
                    alt={tour.title}
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                    <span className="text-yellow-500">★</span> {tour.rating}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-[#0f1c2c] font-semibold text-lg mb-4 line-clamp-2">
                    {tour.title}
                  </h3>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[#434655] text-xs">From</span>
                    <span className="text-[#0049e3] font-bold text-lg">{tour.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-[#eff4ff] py-24">
          <div className="max-w-[1160px] mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-6">
                  <div className="bg-[#d6e3f9] p-4 rounded-xl flex-shrink-0 self-start">
                    <span className="text-[#0049e3] text-3xl">{feature.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-[#434655] text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Top Destinations */}
        <section className="max-w-[1160px] mx-auto px-4 py-24">
          <h2 className="text-3xl font-bold text-[#0f1c2c] mb-12">Global Design Capitals</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[600px]">
            {destinations.map((dest, index) => (
              <div
                key={index}
                className={`${dest.size} relative group overflow-hidden rounded-xl cursor-pointer`}
              >
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src={dest.image}
                  alt={dest.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1c2c]/80 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <h4 className="text-white text-3xl font-bold mb-2">{dest.name}</h4>
                  <p className="text-white/80 text-sm">{dest.tours}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="max-w-[1160px] mx-auto px-4 mb-24">
          <div className="bg-gradient-to-br from-[#0049E3] to-[#3264FF] rounded-3xl p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">Unlock 10% Off Your First Tour</h2>
              <p className="text-white/80 max-w-md">
                Join our architectural travel newsletter for exclusive member prices and early access to new curated tours.
              </p>
            </div>
            <div className="relative z-10 w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <input
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-lg px-6 py-4 focus:ring-2 focus:ring-white/50 w-full md:w-80 backdrop-blur-sm"
                placeholder="Enter your email"
                type="email"
              />
              <button className="bg-white text-[#0049e3] font-bold px-8 py-4 rounded-lg hover:bg-[#eff4ff] transition-colors">
                Subscribe
              </button>
            </div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 bg-slate-50">
        <div className="max-w-[1160px] mx-auto px-4">
          <div className="text-center text-slate-500 text-sm">
            © 2024 Trip.com Tour. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

const tourCards = [
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4Dj8Qvvbm5dBlpr9TcLa1jjgU3cU6gci8MgOrc4S_EXU4JFw4bSY2HRpe_3W4YsGGpQdfbtK2T-akNl-Wt7-wTYfloxPzcUIgh-U5m0ppFL7DNyi4R-EqVrQbRTpp51jIyk-QK9PHJ_YxQLhtZjWR1e4-RxNOJoQkgmmDtDrHuZjdo9gDhD5Hx0jZJeUoaMnG-MXosl14T47VAyxUSbgqhsLz1DkippaxtTYXXzvVhpR-qCDiZpPr34qVJuLFSzZoW9poYSpqSRL_",
    title: "Tokyo Modernism: Private Architectural Walking Tour",
    rating: "4.8",
    price: "¥12,800",
  },
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAurG-ylAir7o7aPPwf-NKIP2raXGDRDFAQfRcmVXywPmnayzNEh585H_rd3ASLy3AIFRgMruGNQJHDlxddAdnzuV5M0gQ0au3J1-n7Ihkm-vagI4b5iqpRlIWDOU5eRWOWVqEMc7xr0NwBi1HBTGc6xILE0j62XvPLhpkLIbGI9Z09IOl3nw-HU7aACWxWQc7Et6BbQHC4CWG2CjLYPFVDwyJ3Tcc8IZsWz_G2qxhX9F1tRRzTlbSGEhz6jYDIQsRQggYOIqup3haY",
    title: "Heritage of Agra: Sunrise Taj Mahal Experience",
    rating: "4.9",
    price: "¥8,500",
  },
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuABkGBBrJ8LgvWoYOGQCXdOJNTOWFY1K9uHiYY5PvinSz-y5a9bo8iNANiGiGa4GiEDbwp4tovPeJUqyt0KgqM_XIxP3JOsVkDhuVY8EpR3Q2VvZJSMrQVcM9LM62L2guO4uUogEV4ZJc3LKL4JexWuV5xooZExEniA-2dw87PEcyGnHVnnKpPxH6an0UDeTVXbYKVXfXagHzbtfgC9OkM_Jb9df7uJS6AiayOeejTMt37gopxyUwhVpqp8SWSYRvmEeQMxgcJY6oPp",
    title: "Parisian Elegance: Seine Cruise & Dinner",
    rating: "4.7",
    price: "¥15,200",
  },
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHrdZ9P7YbdgSwSXcwTupFgZE_Q_WSz6E8so67EDJeVdLEuVyULbafeDiLGRVnxnGXLkP11z5RLshyLJXeUk8sctdXEyzNn6oQrbgwEr9IdASpSEi-I_iQBbG9o_yOcgc0CBxQuHfidDrnrhVGfcfzgT5f3xNwi9x7DlfD0PZFPPKlu_9Iu23SdacYd87qHT2FqJ-NEwGAtNQl0IgJp6WDG0CRlgpvnriYVKeMR-FKQQZ65V4HW7UxqOn9qmW-Vo3hmkVcXcuYyFEZ",
    title: "Sky High Dubai: Burj Khalifa Observatory Visit",
    rating: "4.8",
    price: "¥6,400",
  },
];

const features = [
  {
    icon: "✓",
    title: "Trip.com Guarantee",
    description: "Book with confidence. We ensure price transparency and a secure transaction for every tour.",
  },
  {
    icon: "☎",
    title: "24/7 Global Support",
    description: "Our experts are available around the clock to assist you in over 20 languages anywhere in the world.",
  },
  {
    icon: "★",
    title: "Expert Curated",
    description: "Every activity is hand-picked by local experts to ensure the highest quality architectural and cultural experiences.",
  },
];

const destinations = [
  {
    name: "Paris",
    tours: "342 Tours Available",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmdTwqrao_V4WWHZ0hMZbLMpflnDPWqomTPdAuy98kB_K1_JagEf0-JsNMn8Rez7R2qhnN-kh5wYPRSxQe2ZlMngZoM6Flu_bP0BXdvm-5BL0PJsbjl4bFxh1yPca0KCk8q3l8hdF5fDRwc1zWgy_U9fUFJuppGLXzjSgG6FXAmGq9G8bCrJigintfhQbIK7fhBjn1E_DjS1OI6CQo_36one0yz_dIwTTfEA0oSfiM4Hun0u3h5ew99guZoWUgexBdaTk0k46Mtz79",
    size: "md:col-span-2 md:row-span-2",
  },
  {
    name: "Venice",
    tours: "",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtdkkhK7kKzcBvJyuHcJQ88Cjl8wXuP3Q63Os7dURkCw7-2gDT6kMFp_HVXzsqggvBIhajpIO2-bClqFd-1Jr8t7mP83bhAlLRgQAr7YO7pJemmjcLu3SSMtqtd6IzrsXvY6UbrFipWbi_X3J8dWm00u0D9SfOHllWuZSewgETtjj-FQIqQ2-z8bU4jeJypdUhf1xwU926rColCLqbvinGEDsF-1xSruiW8aqwhgOpOXdl_HBFiQLHEguG4CxLKw2qemjs_AKGdfUq",
    size: "",
  },
  {
    name: "Kyoto",
    tours: "",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCuMMxodo8NBEVQDrkmhx0n-CKedZ0r9pN_9vkboJPKnDcQKdpceqSMwk6-raqurZZGNOdcxMIBlmRKlY45XLov0xtAhtOvIhZMnI6KZW8oWj-oLFBHgU1dojREZLf25dmD7uVpJ7HeVlUQ4MSxC0_c3FvsXjj4IYaBI2qoEmkG3sSrl_OdjUK177eAXDMG2_RZglCxPXvw4lk6_VX2R38u9HQIMlncQKijgChqIC6vtuGSsk-CEooL9xhu-4EYRdKFdcze2lMQPCl",
    size: "",
  },
  {
    name: "New York",
    tours: "",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFdvClJpQjSYqmyTx2Glm1gGrt88dF3Vi3Om-poj5fo9zMotmjIL6XiS6irUQ1bGpmCwu6HxzwGgbNai6inyBeqSDcm4ANuKOtHUIQZY4hb7nPd3o2tk-Y3P9cKNPRKvdIAknAXH8kdET18x0hNuVXq-mXO4JwauG2dZBtJz-JCBaw9-TPGW5hbKzRqFIFik3S4WoFHT0k4pGHoHYo_RHGBv4D_hgYVKxuW-shTdxnGTYaRpjqWbOV6wD_Wn_gC-utD6g5fcOyxtSQ",
    size: "md:col-span-2",
  },
];
