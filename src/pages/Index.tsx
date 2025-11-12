import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stethoscope, Heart, Calendar, Shield, Phone, MessageSquare } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">AskYourVet</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link to="/about">About</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/contact">Contact</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Expert Veterinary Care,
            <span className="block text-primary mt-2">Just a Click Away</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Connect pet owners with certified veterinarians for appointments, consultations, and emergency care.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Veterinarian Card */}
          <Card className="p-8 hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-card border-2 hover:border-primary">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mb-6 shadow-soft">
                <Stethoscope className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-4">I'm a Veterinarian</h3>
              <p className="text-muted-foreground mb-8">
                Manage appointments, view patient records, and provide expert care to pets in need.
              </p>
              <Button size="lg" className="w-full bg-gradient-primary" asChild>
                <Link to="/vet/login">Continue as Vet</Link>
              </Button>
            </div>
          </Card>

          {/* Pet Owner Card */}
          <Card className="p-8 hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-card border-2 hover:border-secondary">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-secondary flex items-center justify-center mb-6 shadow-soft">
                <Heart className="w-10 h-10 text-secondary-foreground" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-4">I'm a Pet Owner</h3>
              <p className="text-muted-foreground mb-8">
                Book appointments, access health resources, and get emergency support for your beloved pets.
              </p>
              <Button size="lg" className="w-full bg-gradient-secondary" asChild>
                <Link to="/owner/login">Continue as Pet Owner</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 text-center bg-card">
            <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
            <h4 className="font-semibold text-foreground mb-2">Easy Booking</h4>
            <p className="text-sm text-muted-foreground">Schedule appointments with instant availability checks</p>
          </Card>
          
          <Card className="p-6 text-center bg-card">
            <Shield className="w-12 h-12 text-accent mx-auto mb-4" />
            <h4 className="font-semibold text-foreground mb-2">Secure Platform</h4>
            <p className="text-sm text-muted-foreground">Your data protected with enterprise-grade security</p>
          </Card>
          
          <Card className="p-6 text-center bg-card">
            <Phone className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h4 className="font-semibold text-foreground mb-2">Emergency Support</h4>
            <p className="text-sm text-muted-foreground">24/7 access to emergency veterinary assistance</p>
          </Card>
          
          <Card className="p-6 text-center bg-card">
            <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
            <h4 className="font-semibold text-foreground mb-2">Smart Chatbot</h4>
            <p className="text-sm text-muted-foreground">Get instant answers to your pet care questions</p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-border">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2024 AskYourVet. Caring for pets, supporting vets.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
