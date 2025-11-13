import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Stethoscope, BookOpen, Activity, Users, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">AskYourVet</h1>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/">Home</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            About AskYourVet
          </h2>
          <p className="text-xl text-muted-foreground">
            Your trusted partner in pet health and wellness
          </p>
        </div>

        {/* Mission Section */}
        <Card className="p-8 mb-8 bg-card">
          <h3 className="text-3xl font-bold text-foreground mb-4">Our Mission</h3>
          <p className="text-lg text-muted-foreground leading-relaxed">
            At AskYourVet, we bridge the gap between pet owners and certified veterinarians, 
            making quality pet healthcare accessible to everyone. We believe every pet deserves 
            the best medical care, and every pet owner deserves peace of mind.
          </p>
        </Card>

        {/* Core Values Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-card">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-primary-foreground" />
            </div>
            <h4 className="text-xl font-bold text-foreground mb-3">Pet Health Excellence</h4>
            <p className="text-muted-foreground">
              We prioritize comprehensive pet health management, from routine checkups to emergency care. 
              Our platform provides tools for tracking vaccinations, medications, and health milestones.
            </p>
          </Card>

          <Card className="p-6 bg-card">
            <div className="w-16 h-16 rounded-full bg-gradient-secondary flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-secondary-foreground" />
            </div>
            <h4 className="text-xl font-bold text-foreground mb-3">Training & Behavior</h4>
            <p className="text-muted-foreground">
              Beyond medical care, we offer expert guidance on pet training, behavior management, 
              and nutrition. Our veterinarians provide personalized advice for your pet's unique needs.
            </p>
          </Card>

          <Card className="p-6 bg-card">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-primary-foreground" />
            </div>
            <h4 className="text-xl font-bold text-foreground mb-3">Community Care</h4>
            <p className="text-muted-foreground">
              We've built a supportive community where pet owners can access resources, 
              educational materials, and connect with experienced veterinary professionals.
            </p>
          </Card>
        </div>

        {/* How Doctors Treat Animals */}
        <Card className="p-8 mb-8 bg-card">
          <div className="flex items-center gap-3 mb-6">
            <Stethoscope className="w-10 h-10 text-primary" />
            <h3 className="text-3xl font-bold text-foreground">How Our Veterinarians Care for Your Pets</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-semibold text-foreground mb-2">Comprehensive Examination</h4>
              <p className="text-muted-foreground">
                Every appointment begins with a thorough physical examination. Our veterinarians 
                check vital signs, assess body condition, and examine all major organ systems to 
                ensure your pet's overall health.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-semibold text-foreground mb-2">Preventive Care Approach</h4>
              <p className="text-muted-foreground">
                We believe in proactive healthcare. Our doctors focus on preventive measures including 
                vaccinations, parasite control, dental care, and regular health screenings to catch 
                potential issues before they become serious problems.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-semibold text-foreground mb-2">Advanced Diagnostics</h4>
              <p className="text-muted-foreground">
                When needed, our veterinarians utilize modern diagnostic tools and techniques. 
                From blood work to imaging studies, we ensure accurate diagnosis and effective 
                treatment planning for your pet.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-semibold text-foreground mb-2">Compassionate Treatment</h4>
              <p className="text-muted-foreground">
                Our veterinarians treat every animal with gentle care and respect. We understand 
                that pets can be anxious during visits, so we use stress-reduction techniques and 
                create a calm, welcoming environment for both pets and their owners.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-semibold text-foreground mb-2">Ongoing Support</h4>
              <p className="text-muted-foreground">
                Treatment doesn't end when you leave the clinic. Our veterinarians provide detailed 
                care instructions, follow-up appointments, and are available for questions throughout 
                your pet's recovery or ongoing care journey.
              </p>
            </div>
          </div>
        </Card>

        {/* Qualifications */}
        <Card className="p-8 bg-card">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-10 h-10 text-primary" />
            <h3 className="text-3xl font-bold text-foreground">Our Veterinary Team</h3>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            All veterinarians on our platform are licensed, certified professionals with extensive 
            training in animal medicine. They bring years of experience treating various species and 
            conditions, from routine wellness care to complex medical cases.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our team includes specialists in areas such as surgery, dentistry, internal medicine, 
            and emergency care. We're committed to continuing education and staying current with 
            the latest advances in veterinary medicine.
          </p>
        </Card>
      </section>
    </div>
  );
};

export default About;
