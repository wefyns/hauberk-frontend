import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pages } from '../../constants/routes';

function Onboarding() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to license agreement as the first step
    navigate(Pages.LicenseAgreement, { replace: true });
  }, [navigate]);

  return null; // This component just redirects
}

export default Onboarding;