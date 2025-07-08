
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PatientDashboard from "@/components/PatientDashboard";
import DentistDashboardFull from "@/components/DentistDashboardFull";

const Index = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  // Show appropriate dashboard based on user role
  if (userRole === 'patient') {
    return <PatientDashboard />;
  } else if (userRole === 'dentist') {
    return <DentistDashboardFull />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Unable to determine user role. Please contact support.</p>
      </div>
    </div>
  );
};

export default Index;
