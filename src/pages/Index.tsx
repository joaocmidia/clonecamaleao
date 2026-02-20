import { useState } from "react";
import { AccountSearch } from "@/components/AccountSearch";
import { WebhookForm } from "@/components/WebhookForm";
import { Navbar } from "@/components/Navbar";

const Index = () => {
  const [selectedAdSetId, setSelectedAdSetId] = useState<string | null>(null);
  const [token, setToken] = useState("");

  const handleSelectAdSet = (adSetId: string) => {
    setSelectedAdSetId(adSetId);
  };

  const handleBack = () => {
    setSelectedAdSetId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onTokenChange={setToken} />
      {selectedAdSetId ? (
        <WebhookForm initialAdSetId={selectedAdSetId} onBack={handleBack} token={token} />
      ) : (
        <AccountSearch onSelectAdSet={handleSelectAdSet} token={token} />
      )}
    </div>
  );
};

export default Index;
