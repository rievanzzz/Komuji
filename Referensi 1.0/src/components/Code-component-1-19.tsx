import { Music, Palette, UtensilsCrossed, Trophy, Laptop, Theater, Briefcase } from "lucide-react";

export function EventCategoryCards() {
  const cards = [
    {
      id: 1,
      title: "Music Concert",
      icon: Music,
      gradient: "from-purple-500 to-pink-500",
      rotation: "-rotate-12",
      position: "left-0 top-4 z-10",
      scale: "scale-95"
    },
    {
      id: 2,
      title: "Art Workshop",
      icon: Palette,
      gradient: "from-orange-400 to-red-500",
      rotation: "-rotate-6",
      position: "left-12 top-0 z-20",
      scale: "scale-100"
    },
    {
      id: 3,
      title: "Food Festival",
      icon: UtensilsCrossed,
      gradient: "from-yellow-400 to-orange-500",
      rotation: "rotate-3",
      position: "left-1/2 -translate-x-1/2 top-2 z-30",
      scale: "scale-105"
    },
    {
      id: 4,
      title: "Sports Event",
      icon: Trophy,
      gradient: "from-blue-500 to-teal-400",
      rotation: "rotate-8",
      position: "right-12 top-0 z-20",
      scale: "scale-100"
    },
    {
      id: 5,
      title: "Tech Conference",
      icon: Laptop,
      gradient: "from-indigo-500 to-purple-600",
      rotation: "rotate-12",
      position: "right-0 top-4 z-10",
      scale: "scale-95"
    },
    {
      id: 6,
      title: "Cultural Event",
      icon: Theater,
      gradient: "from-green-400 to-blue-500",
      rotation: "-rotate-3",
      position: "left-20 top-12 z-5",
      scale: "scale-90"
    },
    {
      id: 7,
      title: "Business Seminar",
      icon: Briefcase,
      gradient: "from-gray-400 to-blue-600",
      rotation: "rotate-6",
      position: "right-20 top-12 z-5",
      scale: "scale-90"
    }
  ];

  return (
    <div className="relative w-full max-w-5xl mx-auto h-80 mb-16">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className={`absolute w-70 h-48 rounded-xl shadow-2xl transform transition-all duration-300 hover:scale-110 hover:shadow-3xl hover:z-50 cursor-pointer ${card.position} ${card.rotation} ${card.scale}`}
          >
            <div className={`w-full h-full bg-gradient-to-br ${card.gradient} rounded-xl p-6 flex flex-col justify-between`}>
              <div className="flex justify-end">
                <IconComponent className="w-8 h-8 text-white opacity-80" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{card.title}</h3>
                <div className="w-12 h-1 bg-white opacity-60 rounded-full mt-2"></div>
              </div>
            </div>
          </div>
        );
      })}
      
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-gray-500 text-sm">
          Discover incredible events in your area and book tickets instantly
        </p>
      </div>
    </div>
  );
}