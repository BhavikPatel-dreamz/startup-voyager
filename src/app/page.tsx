'use client'
import { ShoppingCart, BarChart3,  Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <ShoppingCart className="text-white text-2xl" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">CartVoyager</h1>
          </div>
          <p className="text-xl text-slate-600 mb-4 max-w-2xl mx-auto">
            An AI-powered engine that drives e-commerce conversions in real time.
          </p>
          <p className="text-sm text-slate-500 italic mb-8 max-w-2xl mx-auto">
            Currently reducing cart abandonment with pop-ups that trigger at the perfect moment.
          </p>
          <Button 
            size="lg" 
            className="bg-primary bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            onClick={() => window.location.href = "/login"}
          >
            Sign In
          </Button>
          <p className="text-sm text-slate-500 mt-3">
            Sign in using your Replit account to access the platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="text-primary text-xl" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Cart Recovery</h3>
              <p className="text-sm text-slate-600">Automatically detect user behavior and trigger targeted opt-in campaigns</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Settings className="text-green-600 text-xl" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Easy Setup</h3>
              <p className="text-sm text-slate-600">One-time script installation with guided platform integration</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="text-accent text-xl" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Analytics</h3>
              <p className="text-sm text-slate-600">Track performance with detailed metrics and conversion rates</p>
            </CardContent>
          </Card>
        </div>

        
      </div>
    </div>
  );
}
