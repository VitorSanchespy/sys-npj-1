import React from "react";
import DashboardSummary from "../../components/dashboard/DashboardSummary";

export default function DashboardPage() {
  return (
    <div style={{ maxWidth: 1100, margin: "auto", paddingTop: 40 }}>
      <DashboardSummary />
    </div>
  );
}