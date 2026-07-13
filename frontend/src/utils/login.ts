import Swal from 'sweetalert2';
import { getRequest, postRequest } from '../utils/apiRequest';
import type { tokenResponse, User } from '../types/auth.types';
import { numberToRole } from '../types/auth.types';

export const showLogPrompt = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Log In',
      html: `
        <input id="swal-input1" class="swal2-input" placeholder="Login" required>
        <input id="swal-input2" class="swal2-input" placeholder="Password" type="password" required>
      `,
      showCancelButton: true,
      background:"#fdf0d5",
      color: "#003049",
      focusConfirm: false,
      preConfirm: () => {
        const login = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const pwd = (document.getElementById('swal-input2') as HTMLInputElement).value;
        
        if (!login || !pwd) {
          Swal.showValidationMessage('Please enter both login and password');
          return false;
        }
        
        return { login, pwd };
      }
    });

    if (formValues) {
      const response = await postRequest<tokenResponse>('user/login', {login: formValues.login, password: formValues.pwd});
      console.log('Response:', response.data);
      
      if (response.success && response.data) {      
        const token = response.data.token;
        const admResponse = await postRequest<tokenResponse>('user/login', {login: "admin.test", password: "test"});
        
        if (admResponse.success && admResponse.data) {
          const admToken = admResponse.data.token;
          const allUsersResponse = await getRequest<User[]>('user/all', admToken);
          
          if (allUsersResponse.success && allUsersResponse.data) {
            const allUsers = allUsersResponse.data;
            let id = null;
            
            for (const user of allUsers) {
              if (user.login === formValues.login) {
                id = user.id;
                break;
              }
            }
            
            if (id) {
              const userInfoResponse = await getRequest<any>(`user/${id}`, token);
              
              if (userInfoResponse.success && userInfoResponse.data) {
                const projectsResponse = await getRequest<any[]>('projects/all', token);
                console.log(projectsResponse.data);
                let projectId = null;
                
                if (projectsResponse.success && projectsResponse.data) {
                  const stocksProject = projectsResponse.data.find(p => p.name === 'stocks');
                  if (stocksProject) {
                    projectId = stocksProject.id;
                    localStorage.setItem('stocksProjectId', projectId);
                  }
                }
                
                if (!projectId) {
                  console.log("DEFAULTING");
                  projectId = '89da542d-310e-4604-8158-22cfa75f129d'; // DEFAULT
                }
                
                  const roleResponse = await postRequest<{ role: number }>('projects/role', { "projectID" : projectId }, token);
                
                let userRole: User['role'] = 'user'; // Default
                
                if (roleResponse.success && roleResponse.data && typeof roleResponse.data.role === 'number') {
                  userRole = numberToRole(roleResponse.data.role);
                }
                
                const userWithRole: User = {
                  id: userInfoResponse.data.id,
                  login: userInfoResponse.data.login,
                  role: userRole,
                  avatar: userInfoResponse.data.avatar || '',
                  displayName: userInfoResponse.data.displayName || userInfoResponse.data.login
                };
                
                Swal.fire({
                  background:"#fdf0d5",
                  color: "#003049",
                  title: 'Success!',
                  text:`Hi ${userWithRole.displayName}, you are connected as ${userRole}!`,
                  icon:'success'
                });
                
                return {user: userWithRole, token: token} as {user: User, token: string};
              }
            }
          }
        }
      } else {
        Swal.fire({
          background:"#fdf0d5",
          color: "#003049",
          title:'Error!',
          text:'Invalid login or password.',
          icon:'error'
        });
      }
    }
  };



export const showRegisterPrompt = async () => {
  const { value: formValues } = await Swal.fire({
    title: 'Register',
    html: `
      <input id="swal-input1" class="swal2-input" placeholder="Login" required>
      <input id="swal-input2" class="swal2-input" placeholder="Password" type="password" required>
      <input id="swal-input3" class="swal2-input" placeholder="Confirm Password" type="password" required>
    `,
    showCancelButton: true,
    background:"#fdf0d5",
    color: "#003049",
    focusConfirm: false,
    preConfirm: () => {
      const login = (document.getElementById('swal-input1') as HTMLInputElement).value;
      const pwd = (document.getElementById('swal-input2') as HTMLInputElement).value;
      const repwd = (document.getElementById('swal-input3') as HTMLInputElement).value;
      
      if (!login || !pwd || !repwd) {
        Swal.showValidationMessage('Please enter both login and password');
        return false;
      }

      if (pwd !== repwd) {
        Swal.showValidationMessage('Please enter the same password twice');
        return false;
      }
      
      return { login, pwd };
    }
  });

  if (formValues) {
    const admResponse = await postRequest<tokenResponse>('user/login', {login: "admin.test", password: "test"});
    
    if (admResponse.success && admResponse.data) {      
      const admToken = admResponse.data.token;
        const registerResponse = await postRequest<User>('user', {
          login: formValues.login,
          password: formValues.pwd,
          isAdmin: false
        }, admToken);
      
      if (registerResponse.success && registerResponse.data) {
        console.log('Account created');
        const loginResponse = await postRequest<tokenResponse>('user/login', {login: formValues.login, password: formValues.pwd});

        if( loginResponse.success && loginResponse.data) {
          const token = loginResponse.data.token;
          const projectsResponse = await getRequest<any[]>('projects/all', token);
          console.log(projectsResponse.data);
          let projectId = null;
          
          if (projectsResponse.success && projectsResponse.data) {
            const stocksProject = projectsResponse.data.find(p => p.name === 'stocks');
            if (stocksProject) {
              projectId = stocksProject.id;
              localStorage.setItem('stocksProjectId', projectId);
            }
          }
          
          if (!projectId) {
            console.log("DEFAULTING");
            projectId = '89da542d-310e-4604-8158-22cfa75f129d'; // DEFAULT
          }
          
            const roleResponse = await postRequest<{ role: number }>('projects/role', { "projectID" : projectId }, token);
          
          let userRole: User['role'] = 'user'; // Default
          
          if (roleResponse.success && roleResponse.data && typeof roleResponse.data.role === 'number') {
            userRole = numberToRole(roleResponse.data.role);
          }
          
          const userWithRole: User = {
            id: registerResponse.data.id,
            login: registerResponse.data.login,
            role: userRole,
            avatar: registerResponse.data.avatar || '',
            displayName: registerResponse.data.displayName || registerResponse.data.login
          };
          
          Swal.fire({
            background:"#fdf0d5",
            color: "#003049",
            title: 'Success!',
            text:`Hi ${userWithRole.displayName}, you are connected as ${userRole}!`,
            icon:'success'
          });
          
          return {user: userWithRole, token: token} as {user: User, token: string};
        }
      }
      else {
        Swal.fire({
          background:"#fdf0d5",
          color: "#003049",
          title:'Error!',
          text:'login already exists.',
          icon:'error'
        });
      }
    }
  }
};