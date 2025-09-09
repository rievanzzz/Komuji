import { Button } from "./ui/button";

export function HeroHeader() {
  return (
    <header className="w-full h-20 flex items-center justify-between px-6 bg-white">
      <div className="flex items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <span className="font-medium text-lg text-gray-900">EventHub</span>
        </div>
      </div>
      
      <nav className="hidden md:flex items-center gap-8">
        <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">Browse Events</a>
        <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">Create Event</a>
        <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">Pricing</a>
        <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">About</a>
        <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">Contact</a>
        <Button variant="outline" size="sm">Login</Button>
      </nav>
      
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      </div>
    </header>
  );
}