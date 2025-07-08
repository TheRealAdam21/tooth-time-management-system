
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, FileText, DollarSign, UserPlus, Stethoscope } from "lucide-react";
import PatientForm from "@/components/PatientForm";
import AppointmentScheduler from "@/components/AppointmentScheduler";
import DentistDashboard from "@/components/DentistDashboard";
import PatientList from "@/components/PatientList";
import PaymentTracker from "@/components/PaymentTracker";

const Index = () => {
  const [activeTab, setActiveTab] = useState("patients");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">Dental Clinic Management</h1>
          </div>
          <p className="text-lg text-gray-600">Professional Patient Care & Appointment Management</p>
        </div>

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Patients
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="dentist" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Dentist Panel
            </TabsTrigger>
            <TabsTrigger value="visits" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Patient Records
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payments
            </TabsTrigger>
          </TabsList>

          {/* Patient Management */}
          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                  Patient Registration
                </CardTitle>
                <CardDescription>
                  Register new patients and manage patient information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PatientForm />
              </CardContent>
            </Card>
            <PatientList />
          </TabsContent>

          {/* Appointment Scheduling */}
          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Schedule Appointment
                </CardTitle>
                <CardDescription>
                  Book appointments for dental services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AppointmentScheduler />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dentist Dashboard */}
          <TabsContent value="dentist" className="space-y-6">
            <DentistDashboard />
          </TabsContent>

          {/* Patient Records */}
          <TabsContent value="visits" className="space-y-6">
            <PatientList showVisits={true} />
          </TabsContent>

          {/* Payment Management */}
          <TabsContent value="payments" className="space-y-6">
            <PaymentTracker />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
