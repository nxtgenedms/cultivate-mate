import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sprout, Droplets, Sun, TrendingUp, Calendar, MapPin, Activity } from "lucide-react";

const Dashboard = () => {
  const cultivationAreas = [
    {
      id: 1,
      name: "Greenhouse A",
      crop: "Tomatoes",
      stage: "Flowering",
      health: "Excellent",
      progress: 65,
      location: "North Section",
      planted: "2024-08-15",
      nextAction: "Fertilize",
    },
    {
      id: 2,
      name: "Field B",
      crop: "Lettuce",
      stage: "Vegetative",
      health: "Good",
      progress: 45,
      location: "East Field",
      planted: "2024-09-01",
      nextAction: "Water",
    },
    {
      id: 3,
      name: "Greenhouse C",
      crop: "Peppers",
      stage: "Fruiting",
      health: "Excellent",
      progress: 80,
      location: "South Section",
      planted: "2024-07-20",
      nextAction: "Harvest",
    },
  ];

  const recentActivities = [
    { id: 1, action: "Watered", area: "Greenhouse A", time: "2 hours ago" },
    { id: 2, action: "Fertilized", area: "Field B", time: "5 hours ago" },
    { id: 3, action: "Pest Control", area: "Greenhouse C", time: "Yesterday" },
    { id: 4, action: "Pruned", area: "Greenhouse A", time: "2 days ago" },
  ];

  const stats = [
    { label: "Active Plots", value: "12", icon: MapPin, change: "+2" },
    { label: "Healthy Plants", value: "847", icon: Sprout, change: "+23" },
    { label: "Water Usage", value: "245L", icon: Droplets, change: "-12" },
    { label: "Yield Rate", value: "94%", icon: TrendingUp, change: "+5" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card shadow-[var(--shadow-soft)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sprout className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">CultivateHub</h1>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule
              </Button>
              <Button variant="default">
                <Sprout className="mr-2 h-4 w-4" />
                New Plot
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="transition-[var(--transition-smooth)] hover:shadow-[var(--shadow-strong)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-accent">{stat.change}</span> from last week
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cultivation Areas */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Active Cultivation Areas</h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="grid gap-4">
              {cultivationAreas.map((area) => (
                <Card key={area.id} className="transition-[var(--transition-smooth)] hover:shadow-[var(--shadow-strong)]">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="mb-2">{area.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {area.location}
                        </CardDescription>
                      </div>
                      <Badge variant={area.health === "Excellent" ? "success" : "default"}>
                        {area.health}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Sprout className="h-4 w-4 text-primary" />
                          <span className="font-medium">{area.crop}</span>
                        </div>
                        <Badge variant="outline">{area.stage}</Badge>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Growth Progress</span>
                          <span className="font-medium">{area.progress}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${area.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t pt-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Planted: {area.planted}</span>
                        </div>
                        <Button size="sm" variant="secondary">
                          {area.nextAction}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div>
            <h2 className="mb-4 text-2xl font-bold">Recent Activity</h2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Timeline
                </CardTitle>
                <CardDescription>Latest cultivation activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        {activity.action === "Watered" ? (
                          <Droplets className="h-4 w-4 text-primary" />
                        ) : (
                          <Sun className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.area}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Droplets className="mr-2 h-4 w-4" />
                  Schedule Watering
                </Button>
                <Button className="w-full" variant="outline">
                  <Sun className="mr-2 h-4 w-4" />
                  Check Weather
                </Button>
                <Button className="w-full" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Calendar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
