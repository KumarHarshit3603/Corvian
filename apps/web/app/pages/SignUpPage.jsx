import { AuthPageContent } from "./PublicPageParts";

export default function SignUpPage({ onNavigate }) {
  return <AuthPageContent mode="signup" onNavigate={onNavigate} />;
}
