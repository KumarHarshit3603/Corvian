import { AuthPageContent } from "./PublicPageParts";

export default function SignUpPage({ onNavigate, onAuthenticated }) {
  return <AuthPageContent mode="signup" onNavigate={onNavigate} onAuthenticated={onAuthenticated} />;
}
