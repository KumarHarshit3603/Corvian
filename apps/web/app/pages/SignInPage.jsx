import { AuthPageContent } from "./PublicPageParts";

export default function SignInPage({ onNavigate, onAuthenticated }) {
  return <AuthPageContent mode="signin" onNavigate={onNavigate} onAuthenticated={onAuthenticated} />;
}
