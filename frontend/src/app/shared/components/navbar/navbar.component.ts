import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  role = '';
  currentUser = '';
  isAdmin = false;
  isMobileMenuOpen = false;
  unreadNotifications = 3;
  searchQuery = '';
  themeMode: 'light' | 'dark' = 'light';
  private routerSub!: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateAuthState();
    // Subscribe to router events to sync auth state and auto-close mobile drawer
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateAuthState();
        this.isMobileMenuOpen = false;
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  updateAuthState(): void {
    this.isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    this.role = localStorage.getItem('role') || '';
    this.currentUser = localStorage.getItem('currentUser') || '';
    this.isAdmin = this.isLoggedIn && this.role === 'admin';
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleTheme(): void {
    this.themeMode = this.themeMode === 'light' ? 'dark' : 'light';
    const body = document.body;
    if (this.themeMode === 'dark') {
      body.classList.add('dark-theme-preview');
    } else {
      body.classList.remove('dark-theme-preview');
    }
  }

  onSearchSubmit(): void {
    if (!this.searchQuery.trim()) return;
    window.alert(`Search query submitted: "${this.searchQuery}"`);
    this.searchQuery = '';
  }

  clearNotifications(): void {
    this.unreadNotifications = 0;
  }

  logout(): void {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('role');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isPremium');
    this.updateAuthState();
    this.router.navigate(['/home']);
  }
}

