export function HeroHeadline() {
  return (
    <div className="flex flex-col items-center text-center mb-12">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          Live Events
        </div>
        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          Book Now
        </div>
      </div>
      
      <h1 className="text-6xl font-black text-gray-900 tracking-tight leading-none max-w-4xl">
        A place to showcase your amazing events
      </h1>
      
      <p className="text-lg text-gray-500 mt-4 max-w-2xl">
        Discover amazing events and connect with your community
      </p>
    </div>
  );
}