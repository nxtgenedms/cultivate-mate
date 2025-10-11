import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, Droplets, TrendingUp, Calendar, Shield, BarChart3 } from "lucide-react";
import heroImage from "@/assets/hero-cultivation.jpg";

const Index = () => {
  const features = [
    {
      icon: Sprout,
      title: "Plant Management",
      description: "Track every crop from seed to harvest with detailed growth stages and health monitoring.",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Automated reminders for watering, fertilizing, and maintenance tasks.",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Real-time insights into yield rates, resource usage, and cultivation efficiency.",
    },
    {
      icon: Droplets,
      title: "Resource Tracking",
      description: "Monitor water usage, fertilizer application, and optimize resource allocation.",
    },
    {
      icon: Shield,
      title: "Health Monitoring",
      description: "Early detection of pests, diseases, and environmental stress factors.",
    },
    {
      icon: TrendingUp,
      title: "Growth Optimization",
      description: "Data-driven recommendations to maximize yield and improve crop quality.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Hero Image with Overlay */}
        <div className="relative h-[600px]">
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="Modern sustainable cultivation farm"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="container relative mx-auto flex h-full items-center px-4">
            <div className="max-w-2xl space-y-6 text-background">
              <div className="flex items-center gap-2 text-background/90">
                <Sprout className="h-10 w-10" />
                <span className="text-xl font-semibold">CultivateHub</span>
              </div>
              <h1 className="text-5xl font-bold leading-tight lg:text-6xl">
                Smart Cultivation Management for Modern Growers
              </h1>
              <p className="text-xl text-background/90">
                Track, optimize, and maximize your agricultural yields with intelligent monitoring and
                data-driven insights.
              </p>
              <div className="flex gap-4">
                <Button size="lg" variant="hero" asChild>
                  <Link to="/dashboard">
                    View Dashboard
                    <TrendingUp className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-background/40 bg-background/10 text-background backdrop-blur-sm hover:bg-background/20">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="border-t bg-card shadow-[var(--shadow-soft)]">
          <div className="container mx-auto grid grid-cols-2 gap-8 px-4 py-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">12+</div>
              <div className="text-sm text-muted-foreground">Active Plots</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">847</div>
              <div className="text-sm text-muted-foreground">Plants Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">94%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">30%</div>
              <div className="text-sm text-muted-foreground">Water Saved</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">Everything You Need to Succeed</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Comprehensive tools designed to help you manage every aspect of your cultivation operations.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="transition-[var(--transition-smooth)] hover:shadow-[var(--shadow-strong)] hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-y bg-gradient-to-r from-primary to-accent py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-4xl font-bold">Ready to Grow Smarter?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/90">
            Join modern growers who are maximizing their yields with intelligent cultivation management.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-background text-foreground hover:bg-background/90" asChild>
              <Link to="/dashboard">Get Started Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/40 bg-primary-foreground/10 hover:bg-primary-foreground/20">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">CultivateHub</span>
          </div>
          <p>© 2024 CultivateHub. Smart cultivation management for modern growers.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
