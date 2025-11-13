import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Heart, Activity, Utensils, Brain, Shield } from "lucide-react";

const Resources = () => {
  const navigate = useNavigate();

  const resources = [
    {
      icon: Heart,
      title: "Pet Health Basics",
      description: "Essential information about maintaining your pet's health, recognizing signs of illness, and preventive care.",
      articles: [
        "Understanding Pet Vaccinations",
        "Common Pet Health Issues",
        "Preventive Care Schedule",
        "Emergency Signs to Watch For"
      ]
    },
    {
      icon: Utensils,
      title: "Nutrition & Diet",
      description: "Learn about proper nutrition, feeding schedules, and dietary requirements for different pets.",
      articles: [
        "Choosing the Right Pet Food",
        "Human Foods Pets Can't Eat",
        "Managing Pet Weight",
        "Special Diet Considerations"
      ]
    },
    {
      icon: Brain,
      title: "Training & Behavior",
      description: "Tips and techniques for training your pet and understanding their behavior.",
      articles: [
        "Basic Obedience Training",
        "House Training Guide",
        "Understanding Pet Body Language",
        "Solving Common Behavior Problems"
      ]
    },
    {
      icon: Activity,
      title: "Exercise & Play",
      description: "Guidelines for keeping your pet active and mentally stimulated.",
      articles: [
        "Age-Appropriate Exercise",
        "Indoor Activities",
        "Outdoor Safety Tips",
        "Interactive Toys and Games"
      ]
    },
    {
      icon: Shield,
      title: "Safety & First Aid",
      description: "Essential safety information and basic first aid for pet emergencies.",
      articles: [
        "Pet-Proofing Your Home",
        "Travel Safety",
        "Basic First Aid",
        "Poison Prevention"
      ]
    },
    {
      icon: BookOpen,
      title: "Life Stage Care",
      description: "Specific care requirements for puppies, kittens, adult pets, and seniors.",
      articles: [
        "Puppy & Kitten Care",
        "Adult Pet Maintenance",
        "Senior Pet Care",
        "End of Life Considerations"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/owner/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Pet Care Resources</h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive guides and articles to help you provide the best care for your pets
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{resource.title}</h3>
                    <p className="text-muted-foreground text-sm">{resource.description}</p>
                  </div>
                </div>
                <div className="space-y-2 ml-16">
                  {resource.articles.map((article, articleIndex) => (
                    <Button
                      key={articleIndex}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto py-2"
                    >
                      <span className="text-sm">{article}</span>
                    </Button>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 p-6 bg-gradient-primary">
          <h3 className="text-xl font-bold text-primary-foreground mb-2">Need Personalized Advice?</h3>
          <p className="text-primary-foreground/90 mb-4">
            While these resources provide general information, every pet is unique. 
            Book a consultation with one of our veterinarians for personalized advice.
          </p>
          <Button
            variant="secondary"
            onClick={() => navigate("/owner/dashboard")}
          >
            Book Appointment
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Resources;
