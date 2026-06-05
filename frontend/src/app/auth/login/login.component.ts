import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth, googleAuthProvider } from '../../firebase-init';

interface ServerErrors {
  [field: string]: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  serverErrors: ServerErrors = {};
  generalError = '';

  constructor(private fb: FormBuilder, private router: Router, private auth: AuthService) {}

  async submit(): Promise<void> {
    this.serverErrors = {};
    this.generalError = '';
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value as { email: string; password: string };
      
      // Intercept authentication if account is marked as suspended by admin
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const matchingUser = users.find((u: any) => u.email === email);
      if (matchingUser && matchingUser.suspended) {
        this.generalError = '🔒 Access Denied: This account has been suspended by system administrators.';
        return;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        if (userCredential && userCredential.user) {
          const token = await userCredential.user.getIdToken();
          const role = email === 'akarshsrivastava322@gmail.com' ? 'admin' : 'user';
          
          this.auth.socialLogin({ email, provider: 'Firebase', token }).subscribe({
            next: (res) => {
              if (res && res.accessToken) {
                localStorage.setItem('token', res.accessToken);
              }
              localStorage.setItem('loggedIn', 'true');
              localStorage.setItem('currentUser', email);
              localStorage.setItem('role', role);
              localStorage.setItem('isPremium', 'true');
              
              const history = JSON.parse(localStorage.getItem('loginHistory') || '[]');
              history.push({ email, role, time: new Date().toISOString(), provider: 'Firebase' });
              localStorage.setItem('loginHistory', JSON.stringify(history));
              
              this.router.navigate([role === 'admin' ? '/admin' : '/dashboard']);
            },
            error: (err) => {
              console.warn('Firebase login succeeded but backend social-login failed. Falling back to local backend auth.', err);
              this.fallbackLocalLogin(email, password);
            }
          });
          return;
        }
      } catch (err: any) {
        console.warn('Firebase email/password login failed or bypassed, falling back to local backend auth.', err);
        this.fallbackLocalLogin(email, password);
      }
    }
  }

  private fallbackLocalLogin(email: string, password: string): void {
    this.auth.login({ email, password }).subscribe({
      next: (resp) => {
        const role = resp?.role || (email === 'akarshsrivastava322@gmail.com' ? 'admin' : 'user');
        if (resp && resp.accessToken) {
          localStorage.setItem('token', resp.accessToken);
        }
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('currentUser', email);
        localStorage.setItem('role', role);
        localStorage.setItem('isPremium', resp?.isPremium ? 'true' : 'false');
        const history = JSON.parse(localStorage.getItem('loginHistory') || '[]');
        history.push({ email, role, time: new Date().toISOString() });
        localStorage.setItem('loginHistory', JSON.stringify(history));
        this.router.navigate([role === 'admin' ? '/admin' : '/dashboard']);
      },
      error: (err) => {
        if (err?.error?.errors) {
          for (const e of err.error.errors) {
            if (e.field) this.serverErrors[e.field] = e.message;
          }
        } else if (err?.error?.message) {
          this.generalError = err.error.message;
        } else {
          this.generalError = 'Login failed. Please try again.';
        }
      }
    });
  }

  async socialLogin(provider: string): Promise<void> {
    let email = 'user@cashflow.corp';
    let firstName = 'John';
    let lastName = 'Doe';
    let token = '';

    if (provider === 'Google') {
      try {
        const result = await signInWithPopup(firebaseAuth, googleAuthProvider);
        if (result && result.user) {
          email = result.user.email || email;
          const displayName = result.user.displayName || '';
          if (displayName) {
            const parts = displayName.trim().split(/\s+/);
            firstName = parts[0] || 'Google';
            lastName = parts.slice(1).join(' ') || 'User';
          }
          token = await result.user.getIdToken();
        }
      } catch (err: any) {
        console.warn("Firebase Google Sign-In popup bypassed or failed. Falling back to sandbox simulator.", err);
        
        let errorDetails = "";
        if (err && err.message) {
          errorDetails = `\n\nError details: ${err.message}`;
        }
        
        const choice = window.confirm(
          `🔒 Google Authentication API Disabled:\n` +
          `The Firebase Identity Toolkit API is currently disabled or has not been activated in the Google Cloud Console for this project.` +
          errorDetails +
          `\n\nWould you like to simulate a successful sandbox Google Sign-In instead?`
        );
        
        if (choice) {
          const isAdmin = window.confirm(
            `Choose Sandbox Role:\n\n` +
            `• Click [OK] to log in as the Sandbox Administrator (Akarsh).\n` +
            `• Click [Cancel] to log in as a Regular Sandbox User (John Doe).`
          );
          if (isAdmin) {
            email = 'akarshsrivastava322@gmail.com';
            firstName = 'Akarsh';
            lastName = 'Srivastava';
          } else {
            email = 'user@cashflow.corp';
            firstName = 'John';
            lastName = 'Doe';
          }
        } else {
          return;
        }
      }
    } else {
      window.alert(`Redirecting to ${provider} OAuth Gateway...\n\n(Simulating successful federated authentication inside local sandbox)`);
    }

    const role = email === 'akarshsrivastava322@gmail.com' ? 'admin' : 'user';

    this.auth.socialLogin({ email, firstName, lastName, provider, token }).subscribe({
      next: (res) => {
        if (res && res.accessToken) {
          localStorage.setItem('token', res.accessToken);
        }
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('currentUser', email);
        localStorage.setItem('role', role);
        localStorage.setItem('isPremium', 'true');
        
        const history = JSON.parse(localStorage.getItem('loginHistory') || '[]');
        history.push({ email, role, time: new Date().toISOString(), provider });
        localStorage.setItem('loginHistory', JSON.stringify(history));
        
        this.router.navigate([role === 'admin' ? '/admin' : '/dashboard']);
      },
      error: (err) => {
        console.error('SSO backend login failed, falling back to offline mock mode', err);
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('currentUser', email);
        localStorage.setItem('role', role);
        localStorage.setItem('isPremium', 'true');
        this.router.navigate([role === 'admin' ? '/admin' : '/dashboard']);
      }
    });
  }
}
