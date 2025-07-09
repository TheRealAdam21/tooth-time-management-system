
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { appointmentSchema } from "@/lib/validationSchemas";

const AppointmentScheduler = () => {
  const { isAuthorized, loading: authLoading } = useAuthGuard();
  const [patients, setPatients] = useState<any[]>([]);
  const [dentists, setDentists] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    patient_id: "",
    dentist_id: "",
    appointment_date: "",
    appointment_time: "",
    service_type: "",
    notes: ""
  });

  useEffect(() => {
    if (isAuthorized) {
      fetchPatients();
      fetchDentists();
    }
  }, [isAuthorized]);

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('id, first_name, last_name')
      .order('last_name', { ascending: true });

    if (error) {
      console.error('Error fetching patients:', error);
    } else {
      setPatients(data || []);
    }
  };

  const fetchDentists = async () => {
    const { data, error } = await supabase
      .from('dentists')
      .select('id, first_name, last_name, specialization')
      .order('last_name', { ascending: true });

    if (error) {
      console.error('Error fetching dentists:', error);
    } else {
      setDentists(data || []);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthorized) {
      toast.error("Unauthorized access. Please log in as a dentist.");
      return;
    }
    
    try {
      const appointmentDateTime = `${formData.appointment_date}T${formData.appointment_time}:00`;
      
      const appointmentData = {
        patient_id: formData.patient_id,
        dentist_id: formData.dentist_id,
        appointment_datetime: appointmentDateTime,
        service_type: formData.service_type,
        notes: formData.notes || null
      };

      // Validate appointment data
      const validatedData = appointmentSchema.parse(appointmentData);
      
      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: validatedData.patient_id,
          dentist_id: validatedData.dentist_id,
          appointment_datetime: validatedData.appointment_datetime,
          service_type: validatedData.service_type,
          notes: validatedData.notes,
          status: 'pending'
        });

      if (error) throw error;

      toast.success("Appointment scheduled successfully! Awaiting dentist approval.");
      setFormData({
        patient_id: "",
        dentist_id: "",
        appointment_date: "",
        appointment_time: "",
        service_type: "",
        notes: ""
      });
    } catch (error: any) {
      console.error('Error:', error);
      if (error.name === 'ZodError') {
        const fieldErrors = error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
        toast.error(`Validation error: ${fieldErrors}`);
      } else if (error.message?.includes('permission denied') || error.message?.includes('RLS')) {
        toast.error("Permission denied. Please ensure you're logged in as a dentist.");
      } else {
        toast.error("Failed to schedule appointment. Please try again.");
      }
    }
  };

  const serviceTypes = [
    "General Checkup",
    "Cleaning",
    "Filling",
    "Root Canal",
    "Crown",
    "Extraction",
    "Whitening",
    "Orthodontic Consultation",
    "Emergency"
  ];

  if (authLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!isAuthorized) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Unauthorized access. Please log in as a dentist.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="patient_id">Patient *</Label>
              <Select value={formData.patient_id} onValueChange={(value) => handleInputChange("patient_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dentist_id">Dentist *</Label>
              <Select value={formData.dentist_id} onValueChange={(value) => handleInputChange("dentist_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dentist" />
                </SelectTrigger>
                <SelectContent>
                  {dentists.map((dentist) => (
                    <SelectItem key={dentist.id} value={dentist.id}>
                      Dr. {dentist.first_name} {dentist.last_name} 
                      {dentist.specialization && ` - ${dentist.specialization}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="appointment_date">Date *</Label>
              <Input
                id="appointment_date"
                type="date"
                value={formData.appointment_date}
                onChange={(e) => handleInputChange("appointment_date", e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <Label htmlFor="appointment_time">Time *</Label>
              <Input
                id="appointment_time"
                type="time"
                value={formData.appointment_time}
                onChange={(e) => handleInputChange("appointment_time", e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="service_type">Service Type *</Label>
              <Select value={formData.service_type} onValueChange={(value) => handleInputChange("service_type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
                placeholder="Any special requirements or notes..."
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Schedule Appointment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AppointmentScheduler;
