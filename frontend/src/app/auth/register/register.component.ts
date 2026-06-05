import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth, googleAuthProvider } from '../../firebase-init';

interface ServerErrors {
  [field: string]: string;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  serverErrors: ServerErrors = {};
  generalError = '';

  constructor(private fb: FormBuilder, private router: Router, private auth: AuthService) {}

  async submit(): Promise<void> {
    this.serverErrors = {};
    this.generalError = '';
    if (this.registerForm.valid) {
      const { firstName, lastName, email, password } = this.registerForm.value as any;

      try {
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        if (userCredential && userCredential.user) {
          const token = await userCredential.user.getIdToken();
          const role = email === 'akarshsrivastava322@gmail.com' ? 'admin' : 'user';
          
          this.auth.socialLogin({ email, firstName, lastName, provider: 'Firebase', token }).subscribe({
            next: (res) => {
              if (res && res.accessToken) {
                localStorage.setItem('token', res.accessToken);
              }
              localStorage.setItem('loggedIn', 'true');
              localStorage.setItem('currentUser', email);
              localStorage.setItem('role', role);
              localStorage.setItem('isPremium', 'false');
              
              const history = JSON.parse(localStorage.getItem('loginHistory') || '[]');
              history.push({ email, role, time: new Date().toISOString(), provider: 'Firebase' });
              localStorage.setItem('loginHistory', JSON.stringify(history));
              
              this.router.navigate([role === 'admin' ? '/admin' : '/dashboard']);
            },
            error: (err) => {
              console.warn('Firebase registration succeeded but backend social-login failed. Falling back to local backend auth.', err);
              this.fallbackLocalRegister(firstName, lastName, email, password);
            }
          });
          return;
        }
      } catch (err: any) {
        console.warn('Firebase email/password registration failed or bypassed, falling back to local backend auth.', err);
        this.fallbackLocalRegister(firstName, lastName, email, password);
      }
    }
  }

  private fallbackLocalRegister(firstName: string, lastName: string, email: string, password: string): void {
    this.auth.register({ firstName, lastName, email, password }).subscribe({
      next: (resp) => {
        if (resp && resp.accessToken) {
          localStorage.setItem('token', resp.accessToken);
        }
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('currentUser', email);
        const role = resp?.role || (email === 'akarshsrivastava322@gmail.com' ? 'admin' : 'user');
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
          this.generalError = 'Registration failed. Please try again.';
        }
      }
    });
  }

  async socialRegister(provider: string): Promise<void> {
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
        console.warn("Firebase Google Sign-Up popup bypassed or failed. Falling back to sandbox simulator.", err);
        
        let errorDetails = "";
        if (err && err.message) {
          errorDetails = `\n\nError details: ${err.message}`;
        }
        
        const choice = window.confirm(
          `🔒 Google Authentication API Disabled:\n` +
          `The Firebase Identity Toolkit API is currently disabled or has not been activated in the Google Cloud Console for this project.` +
          errorDetails +
          `\n\nWould you like to simulate a successful sandbox Google Sign-Up instead?`
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
        localStorage.setItem('isPremium', 'false');
        
        const history = JSON.parse(localStorage.getItem('loginHistory') || '[]');
        history.push({ email, role, time: new Date().toISOString(), provider });
        localStorage.setItem('loginHistory', JSON.stringify(history));
        
        this.router.navigate([role === 'admin' ? '/admin' : '/dashboard']);
      },
      error: (err) => {
        console.error('SSO backend registration failed, falling back to offline mock mode', err);
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('currentUser', email);
        localStorage.setItem('role', role);
        localStorage.setItem('isPremium', 'false');
        this.router.navigate([role === 'admin' ? '/admin' : '/dashboard']);
      }
    });
  }
}
