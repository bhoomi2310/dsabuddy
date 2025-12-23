import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/config/constants";

export function useNavigation() {
  const navigate = useNavigate();

  return {
    goToHome: () => navigate(ROUTES.HOME),
    goToRegister: () => navigate(ROUTES.REGISTER),
    goToLogin: () => navigate(ROUTES.LOGIN),
    goToDashboard: () => navigate(ROUTES.DASHBOARD),
    goToProfile: () => navigate(ROUTES.PROFILE),
    goBack: () => navigate(-1),
  };
}
