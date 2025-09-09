import { Button } from "./ui/button";

export function CTASection() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
      <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full">
        Explore Events
      </Button>
      <Button variant="link" className="text-gray-700 hover:text-gray-900">
        Create Event
      </Button>
    </div>
  );
}