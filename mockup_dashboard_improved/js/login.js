
document.getElementById('loginBtn').addEventListener('click', function(){
  const user = document.getElementById('username').value || 'Usuario';
  const pass = document.getElementById('password').value || '';
  
  if(user.trim().length === 0 || pass.trim().length === 0){
    alert('Por favor ingresa usuario y contraseña (puedes usar demo/demo).');
    return;
  }
  sessionStorage.setItem('mock_user', user);
  
  window.location.href = 'dashboard.html';
});

document.getElementById('demoBtn').addEventListener('click', function(){
  sessionStorage.setItem('mock_user', 'Demo');
  window.location.href = 'dashboard.html';
});
