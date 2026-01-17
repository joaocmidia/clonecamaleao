import { useState } from "react";
import { AccountSearch } from "@/components/AccountSearch";
import { WebhookForm } from "@/components/WebhookForm";

const Index = () => {
  const [selectedAdSetId, setSelectedAdSetId] = useState<string | null>(null);

  const handleSelectAdSet = (adSetId: string) => {
    setSelectedAdSetId(adSetId);
  };

  const handleBack = () => {
    setSelectedAdSetId(null);
  };

  return (
    <div>
      {selectedAdSetId ? (
        <WebhookForm initialAdSetId={selectedAdSetId} onBack={handleBack} />
      ) : (
        <AccountSearch onSelectAdSet={handleSelectAdSet} />
      )}
    </div>
  );
};

export default Index;