import { HeroHeader } from "./components/HeroHeader";
import { HeroHeadline } from "./components/HeroHeadline";
import { EventCategoryCards } from "./components/EventCategoryCards";
import { CTASection } from "./components/CTASection";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <HeroHeader />
      
      {/* Main Hero Content */}
      <main className="w-full max-w-7xl mx-auto px-6 pt-16 pb-12">
        {/* Headline Section */}
        <HeroHeadline />
        
        {/* 3D Card Arrangement */}
        <EventCategoryCards />
        
        {/* Call to Action */}
        <CTASection />
      </main>
    </div>
  );
}