import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { gsap } from 'gsap';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatDividerModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser = '';
  role = 'user';
  isPremium = false;
  
  firstName = '';
  lastName = '';
  phone = '+91 98765 43210';
  email = '';
  
  // Password Change
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordStrength = 0;
  
  // Statistics
  verifiedLedgerRows = 42;
  activeBudgetsCount = 4;
  connectedWallets = 3;
  accountAgeDays = 30;

  showAlert = false;
  alertMessage = '';

  ngOnInit(): void {
    this.currentUser = localStorage.getItem('currentUser') || 'guest@cashflow.corp';
    this.role = localStorage.getItem('role') || 'user';
    this.isPremium = localStorage.getItem('isPremium') === 'true';
    this.email = this.currentUser;

    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const matching = users.find((u: any) => u.email === this.currentUser);
    if (matching) {
      this.firstName = matching.firstName || 'Akarsh';
      this.lastName = matching.lastName || 'Srivastava';
      if (matching.storedData) {
        this.verifiedLedgerRows = matching.storedData.expenses || 42;
        this.activeBudgetsCount = matching.storedData.budgets || 4;
      }
    } else {
      this.firstName = 'Akarsh';
      this.lastName = 'Srivastava';
    }

    // Card transitions are driven by robust native CSS staggered keyframes instead of JS staggering
  }

  saveDetails(): void {
    if (!this.firstName.trim() || !this.lastName.trim()) {
      this.triggerAlert('⚠ First and Last name cannot be left blank.', 'warning');
      return;
    }

    // Save back to local storage registered users
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const idx = users.findIndex((u: any) => u.email === this.currentUser);
    if (idx !== -1) {
      users[idx].firstName = this.firstName;
      users[idx].lastName = this.lastName;
      localStorage.setItem('registeredUsers', JSON.stringify(users));
    }

    this.triggerAlert('✨ Personal details updated successfully on Mainframe!', 'success');
  }

  changePassword(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.triggerAlert('⚠ All password fields must be filled.', 'warning');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.triggerAlert('✗ New passwords do not match. Please verify.', 'error');
      return;
    }

    if (this.newPassword.length < 8) {
      this.triggerAlert('✗ New password must be at least 8 characters long.', 'error');
      return;
    }

    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordStrength = 0;
    this.triggerAlert('🔒 Security challenge accepted. Password upgraded successfully!', 'success');
  }

  checkPasswordStrength(): void {
    let score = 0;
    if (this.newPassword.length >= 8) score++;
    if (/[A-Z]/.test(this.newPassword)) score++;
    if (/[0-9]/.test(this.newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(this.newPassword)) score++;
    this.passwordStrength = score;
  }

  triggerAlert(msg: string, type: 'success' | 'warning' | 'error'): void {
    this.alertMessage = msg;
    this.showAlert = true;
    
    setTimeout(() => {
      gsap.fromTo('.custom-profile-alert', 
        { scale: 0.9, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.5)' }
      );
    }, 0);

    setTimeout(() => {
      gsap.to('.custom-profile-alert', {
        opacity: 0,
        y: -10,
        duration: 0.3,
        onComplete: () => { this.showAlert = false; }
      });
    }, 4000);
  }
}
