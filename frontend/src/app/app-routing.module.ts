import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ExpenseListComponent } from './expenses/expense-list/expense-list.component';

import { IncomesComponent } from './incomes/incomes.component';
import { BudgetsComponent } from './budgets/budgets.component';
import { HomeComponent } from './home/home.component';
import { BankSyncComponent } from './bank-sync/bank-sync.component';
import { InvestmentsComponent } from './investments/investments.component';
import { WorkspacesComponent } from './workspaces/workspaces.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { GoalsComponent } from './goals/goals.component';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';
import { AdminComponent } from './admin/admin.component';
import { WealthRoadmapComponent } from './wealth-roadmap/wealth-roadmap.component';
import { AboutComponent } from './public/about/about.component';
import { PricingComponent } from './public/pricing/pricing.component';
import { PrivacyComponent } from './public/privacy/privacy.component';
import { TermsComponent } from './public/terms/terms.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { HelpDeskComponent } from './help-desk/help-desk.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'expenses', component: ExpenseListComponent },
  { path: 'incomes', component: IncomesComponent },
  { path: 'subscriptions', component: SubscriptionsComponent },
  { path: 'budgets', component: BudgetsComponent },
  { path: 'bank-sync', component: BankSyncComponent },
  { path: 'investments', component: InvestmentsComponent },
  { path: 'workspaces', component: WorkspacesComponent },
  { path: 'invoices', component: InvoicesComponent },
  { path: 'goals', component: GoalsComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'help', component: HelpDeskComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'home', component: HomeComponent },
  { path: 'roadmap', component: WealthRoadmapComponent },
  { path: 'about', component: AboutComponent },
  { path: 'pricing', component: PricingComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'terms', component: TermsComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
