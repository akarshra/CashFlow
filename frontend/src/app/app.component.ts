import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { gsap } from 'gsap';
import { Subscription } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'CashFlow';
  isMobile = false;
  hideNavigation = false;
  isLoggedIn = false;
  role = '';
  currentUser = '';
  theme: 'classic' | 'dark' = 'classic';
  private breakpointSub!: Subscription;
  private routerSub!: Subscription;

  constructor(private breakpointObserver: BreakpointObserver, private router: Router) {}

  ngOnInit(): void {
    this.breakpointSub = this.breakpointObserver
      .observe(['(max-width: 900px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    this.loadTheme();
    this.updateAuthState();
    this.hideNavigation = this.shouldHideNavigation(this.router.url);
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.hideNavigation = this.shouldHideNavigation(event.urlAfterRedirects);
        this.updateAuthState();
      });
  }

  private updateAuthState(): void {
    this.isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    this.role = localStorage.getItem('role') || '';
    this.currentUser = localStorage.getItem('currentUser') || '';
  }

  private loadTheme(): void {
    // Force light-theme warm-white guidelines ("remove dark mode")
    this.theme = 'classic';
    localStorage.setItem('appTheme', 'classic');
    document.body.classList.remove('dark-theme');
  }

  get canShowSidebar(): boolean {
    return this.isLoggedIn && !this.hideNavigation;
  }

  get isAdmin(): boolean {
    return this.isLoggedIn && this.role === 'admin';
  }

  get showNavbar(): boolean {
    return this.isLoggedIn && !this.hideNavigation;
  }
  private shouldHideNavigation(url: string): boolean {
    return url === '/' || url === '/home';
  }

  logout(): void {
    localStorage.removeItem('loggedIn');
    this.updateAuthState();
    this.router.navigate(['/home']);
  }

  // Interactive Parallax: Navbar gently floats/rotates toward cursor position
  private onMouseMove = (event: MouseEvent) => {
    const navbar = document.querySelector('.global-topbar') as HTMLElement;
    if (!navbar) return;

    // Normalize coordinates between -0.5 and 0.5
    const x = (event.clientX / window.innerWidth) - 0.5;
    const y = (event.clientY / window.innerHeight) - 0.5;

    // Gently translate navbar X/Y up to 20px and tilt in 3D coordinate bounds
    gsap.to(navbar, {
      x: x * 25,
      y: y * 12,
      rotationX: -y * 5,
      rotationY: x * 5,
      transformPerspective: 1000,
      ease: 'power2.out',
      duration: 0.55
    });
  };

  ngAfterViewInit(): void {
    gsap.from('app-root', { opacity: 0, duration: 1.2, y: 20 });
    gsap.from('.brand-title', { x: -40, opacity: 0, duration: 0.8, delay: 0.3 });

    // Enable floating navbar parallax movement
    window.addEventListener('mousemove', this.onMouseMove);
  }

  ngOnDestroy(): void {
    this.breakpointSub?.unsubscribe();
    this.routerSub?.unsubscribe();
    window.removeEventListener('mousemove', this.onMouseMove);
  }
}
