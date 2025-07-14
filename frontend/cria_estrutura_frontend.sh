#!/bin/bash

mkdir -p src/api
mkdir -p src/components/auth
mkdir -p src/components/profile
mkdir -p src/components/processos
mkdir -p src/components/atualizacoes
mkdir -p src/components/arquivos
mkdir -p src/components/usuarios
mkdir -p src/components/layout
mkdir -p src/contexts
mkdir -p src/hooks
mkdir -p src/pages/auth
mkdir -p src/pages/dashboard
mkdir -p src/routes
mkdir -p src/utils

touch src/api/apiRequest.js

touch src/components/auth/LoginForm.jsx
touch src/components/auth/RegisterForm.jsx
touch src/components/auth/ResetPasswordForm.jsx
touch src/components/auth/LogoutButton.jsx

touch src/components/profile/ProfileView.jsx
touch src/components/profile/ProfileEditForm.jsx

touch src/components/processos/ProcessList.jsx
touch src/components/processos/ProcessDetail.jsx
touch src/components/processos/ProcessForm.jsx
touch src/components/processos/ProcessAssignStudentModal.jsx
touch src/components/processos/ProcessRemoveStudentButton.jsx
touch src/components/processos/ProcessUpdateForm.jsx

touch src/components/atualizacoes/UpdateList.jsx
touch src/components/atualizacoes/UpdateForm.jsx

touch src/components/arquivos/FileList.jsx
touch src/components/arquivos/FileUploadForm.jsx

touch src/components/usuarios/UserList.jsx
touch src/components/usuarios/UserDetail.jsx
touch src/components/usuarios/UserEditForm.jsx

touch src/components/layout/Header.jsx
touch src/components/layout/Sidebar.jsx
touch src/components/layout/MainLayout.jsx
touch src/components/layout/AuthLayout.jsx
touch src/components/layout/Loader.jsx

touch src/contexts/AuthContext.jsx

touch src/hooks/useAuth.js
touch src/hooks/useApi.js

touch src/pages/auth/LoginPage.jsx
touch src/pages/auth/RegisterPage.jsx
touch src/pages/auth/ResetPasswordPage.jsx
touch src/pages/auth/LogoutPage.jsx

touch src/pages/dashboard/DashboardPage.jsx
touch src/pages/dashboard/ProfilePage.jsx
touch src/pages/dashboard/ProcessListPage.jsx
touch src/pages/dashboard/ProcessDetailPage.jsx
touch src/pages/dashboard/UserListPage.jsx
touch src/pages/dashboard/FilePage.jsx

touch src/routes/AppRouter.jsx

touch src/utils/formatters.js
touch src/utils/validators.js
touch src/utils/constants.js
touch src/utils/request.js

touch src/App.jsx
touch src/index.jsx

echo "Estrutura criada com sucesso!"