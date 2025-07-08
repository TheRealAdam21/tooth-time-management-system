
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { User, Phone, Mail, Calendar, FileText, Eye } from "lucide-react";
import VisitTracker from "./VisitTracker";

interface PatientListProps {
  showVisits?: boolean;
}

const PatientList = ({ showVisits = false }: PatientListProps) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('last_name', { ascending: true });

    if (error) {
      console.error('Error fetching patients:', error);
    } else {
      setPatients(data || []);
    }
    setLoading(false);
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
  );

  if (loading) {
    return <div className="text-center">Loading patients...</div>;
  }

  if (selectedPatient && showVisits) {
    return (
      <div>
        <Button 
          onClick={() => setSelectedPatient(null)} 
          className="mb-4"
          variant="outline"
        >
          ← Back to Patient List
        </Button>
        <VisitTracker patient={selectedPatient} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            {showVisits ? "Patient Records" : "Registered Patients"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="grid gap-4">
            {filteredPatients.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {searchTerm ? "No patients found matching your search" : "No patients registered yet"}
              </p>
            ) : (
              filteredPatients.map((patient) => (
                <Card key={patient.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-lg font-semibold mb-2">
                          <User className="h-4 w-4" />
                          {patient.first_name} {patient.last_name}
                          {patient.gender && (
                            <Badge variant="outline">{patient.gender}</Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          {patient.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {patient.phone}
                            </div>
                          )}
                          {patient.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {patient.email}
                            </div>
                          )}
                          {patient.date_of_birth && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(patient.date_of_birth).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        {patient.insurance_provider && (
                          <div className="mt-2 text-sm">
                            <Badge className="bg-green-100 text-green-800">
                              Insurance: {patient.insurance_provider}
                            </Badge>
                          </div>
                        )}

                        {patient.medical_history && (
                          <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Medical History:</strong> {patient.medical_history}
                          </div>
                        )}
                      </div>

                      {showVisits && (
                        <Button
                          onClick={() => setSelectedPatient(patient)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Records
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientList;
