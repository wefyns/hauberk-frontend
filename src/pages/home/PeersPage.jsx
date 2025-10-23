import React from "react";

import { CAsSection } from "../../components/sections/ca-section/CASection";
import { PeersSection } from "../../components/sections/peers-section/PeersSection";
import DbInfoSection from "../../components/sections/db-info-section/DbInfoSection";

export default function PeersPage() {
  return (
    <div>
      <PeersSection />
      <CAsSection />
      <DbInfoSection />
    </div>
  );
}