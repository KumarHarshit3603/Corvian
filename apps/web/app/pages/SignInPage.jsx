import { AuthPageContent } from "./PublicPageParts";

export default function SignInPage({ onNavigate }) {
  return <AuthPageContent mode="signin" onNavigate={onNavigate} />;
}
