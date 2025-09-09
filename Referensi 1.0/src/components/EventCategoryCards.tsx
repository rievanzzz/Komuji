import { Music, Palette, UtensilsCrossed, Trophy, Laptop, Theater, Briefcase } from "lucide-react";

export function EventCategoryCards() {
  const cards = [
    {
      id: 1,
      title: "Music Concert",
      icon: Music,
      gradient: "from-red-500 to-red-600",
      rotation: "-rotate-12",
      position: "left-4",
      zIndex: "z-10"
    },
    {
      id: 2,
      title: "Art Workshop", 
      icon: Palette,
      gradient: "from-yellow-400 to-orange-500",
      rotation: "-rotate-6",
      position: "left-36",
      zIndex: "z-20"
    },
    {
      id: 3,
      title: "Food Festival",
      icon: UtensilsCrossed,
      gradient: "from-orange-400 to-red-500",
      rotation: "rotate-3",
      position: "left-72",
      zIndex: "z-30"
    },
    {
      id: 4,
      title: "Sports Event",
      icon: Trophy,
      gradient: "from-blue-500 to-indigo-600",
      rotation: "rotate-8",
      position: "left-108",
      zIndex: "z-40"
    },
    {
      id: 5,
      title: "Tech Conference",
      icon: Laptop,
      gradient: "from-green-400 to-emerald-500",
      rotation: "rotate-12",
      position: "left-144",
      zIndex: "z-50"
    },
    {
      id: 6,
      title: "Cultural Event",
      icon: Theater,
      gradient: "from-purple-500 to-violet-600",
      rotation: "-rotate-3",
      position: "left-180",
      zIndex: "z-20"
    }
  ];

  return (
    <div className="relative w-full max-w-7xl mx-auto h-80 mb-16 flex items-center justify-center overflow-hidden">
      <div className="relative w-full max-w-6xl h-64">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              className={`absolute w-60 h-60 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl cursor-pointer top-1/2 -translate-y-1/2 ${card.position} ${card.rotation} ${card.zIndex}`}
              style={{
                filter: 'drop-shadow(0 20px 25px rgb(0 0 0 / 0.15))'
              }}
            >
              <div className={`w-full h-full bg-gradient-to-br ${card.gradient} rounded-2xl p-6 flex flex-col justify-between overflow-hidden relative`}>
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -translate-y-4 translate-x-4"></div>
                
                <div className="flex justify-end relative z-10">
                  <IconComponent className="w-8 h-8 text-white opacity-90" />
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-white font-medium text-lg leading-tight">{card.title}</h3>
                  <div className="w-12 h-0.5 bg-white opacity-70 rounded-full mt-3"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-gray-500 text-sm max-w-md">
          Discover incredible events in your area and book tickets instantly
        </p>
      </div>
    </div>
  );
}