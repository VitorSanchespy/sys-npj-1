import React from "react";
import ProfileView from "../../components/profile/ProfileView";
import ChangePasswordForm from "../../components/profile/ChangePasswordForm";

export default function ProfilePage() {
  return (
    <div style={{ maxWidth: 500, margin: "auto", paddingTop: 64 }}>
      <ProfileView />
      <hr />
      <ChangePasswordForm />
    </div>
  );
}