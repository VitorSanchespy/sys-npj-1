// Login
import auth from '@/services';
auth.login({ email, senha }).then(response => {
  localStorage.setItem('token', response.data.token);
});

// Chamada API
import api from '@/services/api';
api.get('/dados').then(response => console.log(response.data));