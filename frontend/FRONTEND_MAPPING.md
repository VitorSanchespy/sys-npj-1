# Mapeamento Detalhado de Telas, Rotas e Componentes – Sistema NPJ

## 1. **Rotas Globais**

| Caminho                | Quem acessa           | O que faz                                                                |
|------------------------|----------------------|--------------------------------------------------------------------------|
| `/login`               | Todos                | Login do sistema                                                         |
| `/logout`              | Todos logados        | Faz logout, limpa sessão e redireciona                                   |
| `/register`            | Admin/Professor      | Cadastro de usuário (opcional, pode ser só backend)                      |
| `/reset-password`      | Todos                | Recuperação de senha                                                     |
| `/perfil`              | Todos logados        | Visualiza e edita informações do próprio perfil                           |
| `/`                    | Todos logados        | Dashboard (atalhos, resumo de processos/atualizações recentes)           |

---

## 2. **Processos**

### Aluno

| Caminho                          | O que faz                                                                     |
|----------------------------------|-------------------------------------------------------------------------------|
| `/meus-processos` (ou `/processos`) | Lista processos designados ao aluno (`GET /api/processos/meus-processos`)      |
| `/processos/:id`                 | Detalhe do processo, lista atualizações e arquivos                            |
| `/processos/:id/atualizar`       | Formulário para cadastrar atualização no processo (Aluno só nos seus processos) |

### Professor de Estágio

| Caminho                          | O que faz                                                                     |
|----------------------------------|-------------------------------------------------------------------------------|
| `/processos`                     | Lista todos os processos (`GET /api/processos`)                               |
| `/processos/:id`                 | Detalhe do processo, lista alunos atribuídos, atualizações, arquivos          |
| `/processos/:id/atribuir-aluno`  | Formulário/modal para atribuir aluno ao processo                              |
| `/processos/:id/remover-aluno`   | Ação para remover aluno do processo                                           |
| `/processos/:id/atualizar`       | Formulário para cadastrar atualização no processo                             |

---

## 3. **Atualizações de Processo**

| Caminho                          | O que faz                                                                     |
|----------------------------------|-------------------------------------------------------------------------------|
| `/processos/:id/atualizacoes`    | Lista todas as atualizações do processo                                       |
| `/processos/:id/atualizacoes/nova` | Formulário para criar atualização (usado por aluno e professor)              |

---

## 4. **Arquivos**

| Caminho                                  | O que faz                                                           |
|------------------------------------------|---------------------------------------------------------------------|
| `/processos/:id/arquivos`                | Lista arquivos anexados ao processo                                 |
| `/processos/:id/arquivos/upload`         | Formulário/upload de arquivo para o processo                        |

---

## 5. **Usuários/Admin**

| Caminho                 | Quem acessa           | O que faz                                    |
|-------------------------|----------------------|----------------------------------------------|
| `/usuarios`             | Admin                | Lista todos usuários                         |
| `/usuarios/:id`         | Admin/Prof           | Detalhe do usuário, editar dados             |
| `/usuarios/:id/editar`  | Admin/Prof           | Formulário para editar dados                 |
| `/usuarios/:id/reativar`| Admin                | Ação para reativar usuário                   |

---

## 6. **Componentes Principais**

- **Auth**
  - `LoginForm`
  - `RegisterForm`
  - `ResetPasswordForm`
  - `LogoutPage`

- **Perfil**
  - `ProfilePage` (visualizar e editar)
  - `ProfileEditForm`

- **Processos**
  - `ProcessList` (Aluno e Professor)
  - `ProcessDetail`
  - `ProcessAssignStudentModal` (Professor)
  - `ProcessRemoveStudentButton` (Professor)
  - `ProcessUpdateForm` (Aluno e Professor)

- **Atualizações**
  - `UpdateList` (dentro do ProcessDetail)
  - `UpdateForm`

- **Arquivos**
  - `FileList` (dentro do ProcessDetail)
  - `FileUploadForm`

- **Usuários**
  - `UserList` (Admin)
  - `UserDetail`
  - `UserEditForm`

- **Layout**
  - `MainLayout`
  - `AuthLayout`
  - `Header`
  - `Sidebar` (opcional)

---

## 7. **Fluxo de Permissões**

- **Aluno**
  - Só vê e atua em seus processos (valide pelo backend e pelo frontend)
  - Só vê detalhes/atualizações/processos em que está designado
  - Só pode cadastrar atualização em processos designados

- **Professor**
  - Vê e edita todos processos
  - Atribui/remover alunos de processos
  - Vê e cadastra atualizações em qualquer processo

- **Admin**
  - Gerencia usuários (CRUD)
  - Pode acessar tudo (depende do backend)

---

## 8. **Sugestão de Estrutura de Diretórios**

```
src/
  components/
    auth/
    profile/
    processos/
    atualizacoes/
    arquivos/
    usuarios/
    layout/
  pages/
    auth/
    dashboard/
    processos/
    usuarios/
    perfil/
  routes/
    AppRouter.jsx
  contexts/
    AuthContext.jsx
  utils/
  App.jsx
  index.jsx
```

---

## 9. **Exemplo de Rotas React Router (Pseudocódigo)**

```jsx
<Route path="/login" element={<LoginPage />} />
<Route path="/logout" element={<LogoutPage />} />
<Route path="/perfil" element={<ProfilePage />} />

{/* Processos - Aluno */}
<Route path="/meus-processos" element={<ProcessList />} />
<Route path="/processos/:id" element={<ProcessDetail />} />
<Route path="/processos/:id/atualizacoes/nova" element={<UpdateForm />} />

{/* Processos - Professor */}
<Route path="/processos" element={<ProcessList />} />
<Route path="/processos/:id/atribuir-aluno" element={<ProcessAssignStudentModal />} />

{/* Arquivos */}
<Route path="/processos/:id/arquivos" element={<FileList />} />
<Route path="/processos/:id/arquivos/upload" element={<FileUploadForm />} />

{/* Usuários/Admin */}
<Route path="/usuarios" element={<UserList />} />
<Route path="/usuarios/:id" element={<UserDetail />} />
<Route path="/usuarios/:id/editar" element={<UserEditForm />} />
```

---

## 10. **Observações**

- **Todos os componentes de formulário** devem validar os campos obrigatórios conforme o backend.
- **Todos os requests** devem enviar JWT no header.
- **Feedbacks (toasts, loaders, erros)** são fundamentais para experiência do usuário.
- Permissões devem ser validadas tanto no frontend quanto no backend.

---

Pronto!  
Com esse mapeamento, você tem um guia claro para implementar ou refatorar todo o frontend do sistema NPJ, garantindo cobertura total das funcionalidades do diagrama de atividades, das regras de negócio e dos endpoints reais do backend.

Se quiser um exemplo de estrutura de código para algum componente/tela específica, só pedir!