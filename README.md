# 💰 CashFlow Enterprise — Premium SaaS Capital Mainframe

CashFlow is an enterprise-grade SaaS financial mainframe and capital ledger platform, engineered for modern, high-growth teams. This repository is built as a highly responsive full-stack system comprising a modern **Angular frontend** and a high-performance **Spring Boot Java backend**.

---

## 🏛️ Architecture Overview

The system utilizes a secure, distributed tiered service layer:
* **Frontend Console:** Built with **Angular 17** and **TypeScript**, styled using **Angular Material** frosted cards, and animated via **GSAP** and **Three.js WebGL** 3D graphics.
* **Backend API Gateway:** High-throughput **Spring Boot (Java 21)** REST engine managing secure transactions, WebSocket triggers, and background sync engines.
* **Cloud Database Store:** Integrated with **Supabase PostgreSQL** as the primary relational persistence warehouse.
* **Cache Memory Layer:** Utilizes **Redis** to store and retrieve high-volume financial summaries, analytics projections, and parsed AI responses.
* **WebSocket messaging Broker:** Manages simple broker networks at `/ws` via **STOMP & SockJS** to broadcast transactional webhook swipes to active dashboards reactively in real-time.
* **Generative AI Core:** Connects with the **Google Gemini AI API** to audit executive sliders, output burn rate diagnostics, and forecast cash runways.

---

## 💎 Key Enterprise Features

### 🎙️ 1. WebRTC Teammate Audio Sandbox
* Live, multi-user secure WebRTC voice bridges integrated within workspace boundaries.
* Pulsing variable-height voice waveforms animated dynamically to reflect active audio frequencies.
* Active speaker bubble tracking (Sarah, Rahul, Host) with instant microphone mute triggers.

### 🔌 2. Stripe & Plaid API Webhook Cockpit
* Simulated webhook dispatch panel on the dashboard console.
* Instant Stripe payments upgrading users to Premium VIP tier status across both the database and the UI.
* Plaid credit/debit swipes adding mock expenses on-the-fly and broadcasting them reactively over WebSocket channels.

### ⚖️ 3. Consolidated Multi-Currency & Entity Switcher
* Corporate switcher supporting active workspace toggling (*Global Consolidated Inc*, *India Subsidiary Pvt Ltd*, *Europe Subsidiary Gmbh*).
* Live forex translation picker supporting real-time currency conversion (INR ₹, USD $, EUR €) across net reserves, wallets, and timeline ledger streams.

### 🧠 4. AI-Powered Executive Runway & Burn Advisor
* Typewriter-scrolling advice cards summarizing cash runway timelines and burn rates based on slider variables.
* Integrates directly with the Spring Boot `/api/ai/forecast` API.

### 🧭 5. Unified SaaS Top Navigation Bar
* Responsive 76px topbar featuring a brand logo, color pill-style active link indicators, sliding search inputs, notification badges, and a user profile avatar trigger.
* Auto-collapsing hamburger toggle opening a clean, vertical mobile drawer.

---

## 📂 Project Structure

* `/frontend/` — Single-page console application (Angular 17, Material, GSAP).
* `/backend/` — Server repository (Spring Boot Java 21, JPA, Security).
* `/.env.example` — Template defining required API credentials and keys.

---

## 🚀 Getting Started Locally

### 1. Configure Environmental APIs
Copy `.env.example` to `.env` in the root workspace folder and fill in your active developer credentials:
```env
# Backend & Server config
API_BASE_URL=http://localhost:8080/api
JWT_SECRET=ReplaceWithSecureSecretKey

# Google Gemini AI Integration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_URL=https://api.google.com/gemini

# Plaid API Sandbox credentials
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox

# Database Configurations
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/cashflow_db
SPRING_DATASOURCE_USER=postgres
SPRING_DATASOURCE_PASSWORD=your_password
```

### 2. Start the Backend API Server
Ensure Maven and JDK 21 are configured on your shell:
```bash
cd backend
mvn clean spring-boot:run
```
*The database seeds a default administrator account automatically upon successful startup: `akarshsrivastava322@gmail.com`.*

### 3. Start the Frontend Console
Ensure Node.js is installed locally:
```bash
cd frontend
npm install
npm start
```
Open `http://localhost:4200` to access the premium CashFlow mainframe.

---

## 🛠 Troubleshooting: TypeScript / `tsconfig.json` Errors

If your editor shows errors related to `tsconfig.json` (unknown compiler options, deprecation warnings, or `ng serve`/`tsc` differences), follow these steps:

- Ensure project dependencies are installed from the repository root:

```bash
cd frontend
npm install
```

- Use the workspace TypeScript version in your editor (VS Code):
  - Open the Command Palette → `TypeScript: Select TypeScript Version` → choose `Use Workspace Version`.

- Verify TypeScript compiler locally to reproduce errors (no emit):

```bash
cd frontend
npx tsc -p tsconfig.json --noEmit
```

- Common cause: the editor is using a globally installed older TypeScript version that doesn't recognize newer options such as `ignoreDeprecations` (TS 5+). Installing and selecting the workspace TypeScript version resolves this.

- If you see an `unknown compiler option 'ignoreDeprecations'` message, update your editor's TypeScript to >= 5.0, or remove that option from `frontend/tsconfig.json` if you must support an older TypeScript version.

- Angular Language Service: ensure the `Angular Language Service` VS Code extension is up-to-date to avoid false template/diagnostic errors.

### 📡 Troubleshooting: WebSocket CORS & 400 Bad Request (Request Header Too Large)

In local development environments, Tomcat may throw a `400 Bad Request: Request header is too large` exception when browser requests carry large cookie payloads (e.g., shared across localhost ports). 
* **The Symptom:** Misleading CORS block warnings on SockJS `/ws/info?t=...` endpoints, because Tomcat rejects the request at the low-level connector and drops custom Spring CORS response headers.
* **The Solution:** Spring Boot 3.x requires explicit request header size configuration. In `backend/src/main/resources/application.yml`, configure:
  ```yaml
  server:
    max-http-request-header-size: 65536
  ```
  This expands the allowed header size window to 64KB, successfully unblocking WebSocket and administration endpoints.

## 🔒 Enterprise Federated Security & OAuth2 Integration

### 1. Sandbox Simulation Mode (Default)
By default, the Google and GitHub SSO buttons operate in an **integrated sandbox simulation mode** to allow immediate local database operations without requiring complex external OAuth client registration:
* **Redirection Alerts**: Clicking a social button displays the alert captured in your browser dashboard (e.g., `Redirecting to Google OAuth Gateway...`).
* **Database Integration & JWT Security**: Instead of just mock visual states, the frontend dynamically contacts the Spring Boot REST controller endpoint `/api/auth/social-login`.
* **Automatic Provisioning**: The backend checks your local PostgreSQL database. If a user matching the SSO email does not exist, they are registered with a secure UUID-based federated password instantly.
* **Token Handshake**: The backend generates a secure, signed JWT token (`JwtTokenProvider`) and transfers it back to the Angular Client. This token is used to authenticate all subsequent ledger, analytics, and forecast API calls!

### 2. Transitioning to Live Production Google OAuth2
To disable the sandbox simulation and wire up actual secure Google Sign-In, follow this integration guide:

#### A. Configure Credentials on Google Cloud Console
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Search for **APIs & Services** -> **OAuth Consent Screen**. Fill out the app information and add the scope `email` and `profile`.
4. Go to **Credentials**, click **Create Credentials**, and select **OAuth client ID**.
5. Set Application Type to **Web Application**.
6. Under **Authorized Javascript Origins**, add:
   * `http://localhost:4200`
7. Under **Authorized Redirect URIs**, add:
   * `http://localhost:8080/login/oauth2/code/google`
8. Click **Create** and copy your **Client ID** and **Client Secret**.

#### B. Setup the Angular Client-Side SDK
Install the official Google Auth package in `frontend/`:
```bash
npm install @abacritt/angularx-social-login
```
Register the provider inside `frontend/src/app/app.module.ts`:
```typescript
import { SocialLoginModule, SocialAuthServiceConfig, GoogleLoginProvider } from '@abacritt/angularx-social-login';

@NgModule({
  imports: [
    SocialLoginModule
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider('YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com')
          }
        ]
      } as SocialAuthServiceConfig,
    }
  ]
})
```
Now, update `socialLogin` in `login.component.ts` to trigger Google's sign-in popup:
```typescript
import { SocialAuthService, GoogleLoginProvider } from '@abacritt/angularx-social-login';

// Inject SocialAuthService inside the constructor, then trigger sign-in:
this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then(user => {
  // Send the actual user.idToken inside the token property of SocialAuthRequest
  this.auth.socialLogin({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    provider: 'Google',
    token: user.idToken
  }).subscribe(res => {
    localStorage.setItem('token', res.accessToken);
    this.router.navigate(['/dashboard']);
  });
});
```

#### C. Enable Secure Backend ID Token Verification
In Spring Boot, add Google's API Client library to `pom.xml`:
```xml
<dependency>
  <groupId>com.google.api-client</groupId>
  <artifactId>google-api-client</artifactId>
  <version>2.2.0</version>
</dependency>
```
Now, verify the `token` securely in `AuthService.java`:
```java
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

public AuthResponse socialLogin(SocialAuthRequest request) {
    if ("Google".equalsIgnoreCase(request.getProvider()) && request.getToken() != null) {
        // Secure server-side verification of Google Token:
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList("YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"))
                .build();
        try {
            GoogleIdToken idToken = verifier.verify(request.getToken());
            if (idToken == null) throw new IllegalArgumentException("Invalid Google OAuth Token");
            
            // Extract verified profile info
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            
            // Look up or provision user...
        } catch (Exception e) {
            throw new IllegalArgumentException("OAuth authentication failed: " + e.getMessage());
        }
    }
    // ... Database persistence and JWT signature
}
```
This multi-tiered validation guarantees bank-grade security for your corporate financial ledger, preventing malicious users from spoofing federated identities.
