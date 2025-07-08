
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, FileText, LogOut, Stethoscope } from "lucide-react";
import DentistDashboard from "@/components/DentistDashboard";
import PatientList from "@/components/PatientList";
import { useAuth } from "@/contexts/AuthContext";

const DentistDashboardFull = () => {
  const [activeTab, setActiveTab] = useState("appointments");
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Dentist Dashboard</h1>
              <p className="text-gray-600">Welcome, Dr. {user?.user_metadata?.first_name}!</p>
            </div>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Patient Records
            </TabsTrigger>
          </TabsList>

          {/* Appointment Management */}
          <TabsContent value="appointments" className="space-y-6">
            <DentistDashboard />
          </TabsContent>

          {/* Patient Records with Visit & Payment Tracking */}
          <TabsContent value="patients" className="space-y-6">
            <PatientList showVisits={true} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DentistDashboardFull;
