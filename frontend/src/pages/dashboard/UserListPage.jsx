import React from "react";
import UserList from "../../components/usuarios/UserList";

export default function UserListPage() {
  return (
    <div style={{ maxWidth: 900, margin: "auto", paddingTop: 40 }}>
      <UserList />
    </div>
  );
}