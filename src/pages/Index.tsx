import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import heroImage from "@/assets/hero-cultivation.jpg";
import { Leaf, Shield, BarChart3, Users } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            VitaCore CMS
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 animate-fade-in">
            Cannabis Cultivation Management System
          </p>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Complete lifecycle management from propagation to harvest with compliance tracking, 
            IPM protocols, and quality assurance workflows.
          </p>
          <div className="flex gap-4 justify-center">
            {user ? (
              <Button 
                size="lg" 
                onClick={() => navigate('/dashboard')}
                className="shadow-[var(--shadow-strong)]"
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/auth')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Complete Cultivation Management
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Lifecycle Tracking</h3>
              <p className="text-muted-foreground">
                Batch and plant management from clone to harvest
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Compliance Ready</h3>
              <p className="text-muted-foreground">
                Built-in protocols and audit trails
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Analytics</h3>
              <p className="text-muted-foreground">
                Real-time insights and reporting
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Role-Based Access</h3>
              <p className="text-muted-foreground">
                7 user roles with granular permissions
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
