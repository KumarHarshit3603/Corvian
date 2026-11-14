import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Notice, PageFrame, Panel, useNotice } from "./shared/ExchangeUi";

export default function SettingsPage() {
  const [section, setSection] = useState("Profile");
  const [notice, notify] = useNotice();
  const sections = [
    "Profile",
    "Security",
    "Preferences",
    "Notifications",
    "API management",
  ];
  return (
    <PageFrame
      title="Settings"
      description="Manage your account preferences and security"
    >
      <Notice message={notice} />
      <div className="grid gap-4 lg:grid-cols-[230px_minmax(0,1fr)]">
        <Panel className="h-fit p-2">
          {sections.map((item) => (
            <button
              key={item}
              onClick={() => setSection(item)}
              className={`w-full rounded-lg px-3 py-3 text-left text-sm ${section === item ? "bg-surface font-medium text-brand" : "text-slate-300 hover:bg-surface"}`}
            >
              {item}
            </button>
          ))}
        </Panel>
        <div className="space-y-4">
          <Panel className="p-5">
            <h2 className="font-semibold text-white">{section} information</h2>
            <p className="mt-1 text-xs text-muted">
              Your personal details and account identity
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["Display name", "Harper Kim"],
                ["Email address", "harper.kim@email.com"],
                ["Account ID", "VX-2048-7193"],
                ["Account type", "Individual"],
              ].map(([label, value]) => (
                <label key={label} className="text-xs text-muted">
                  {label}
                  <div className="mt-2 rounded-lg border border-line bg-bg px-3 py-3 text-sm text-white">
                    {value}
                  </div>
                </label>
              ))}
            </div>
            <button
              onClick={() => notify("Profile editor opened.")}
              className="mt-5 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-white hover:border-brand/50"
            >
              Edit profile
            </button>
          </Panel>
          <Panel className="flex items-center justify-between gap-4 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 text-up" size={19} />
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Two-factor authentication
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Add an extra layer of protection to your account.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-up/10 px-2.5 py-1 text-xs text-up">
              Enabled
            </span>
          </Panel>
          <Panel className="flex items-center justify-between gap-4 p-5">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Account verification
              </h3>
              <p className="mt-1 text-xs text-muted">
                Identity verification helps secure higher withdrawal limits.
              </p>
            </div>
            <span className="rounded-full bg-up/10 px-2.5 py-1 text-xs text-up">
              Verified
            </span>
          </Panel>
        </div>
      </div>
    </PageFrame>
  );
}
