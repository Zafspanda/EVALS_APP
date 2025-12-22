# 📘 Course Correction Proposal  
## Aligning the Evals App Frontend with the Sendle Design System (SDS)

---

## 1. Purpose

This document outlines a required course correction for the frontend architecture of the **Evals App**.  
It exists to realign the project with:

- Sendle’s Design System (SDS)
- long-term maintainability
- consistent UI/UX across products
- scalable technical foundations

This proposal clarifies **what must change**, **why**, and **how the team should proceed**.

---

## 2. Background

The initial Evals App frontend was generated using:

- **Vue 3.5**
- **Vite**
- **Naive UI**
- **TypeScript**

This choice emerged organically through an LLM-assisted prototyping workflow rather than through an architectural decision.

The app currently provides:

- CSV bulk imports  
- multi-turn trace viewing  
- open coding and annotations  
- Clerk authentication  
- progress statistics  
- FastAPI backend integration  

As the design direction evolved, the team attempted to use the **Sendle Design System (SDS)** to unify the UI.  
This revealed an underlying incompatibility between SDS and the current Vue stack.

---

## 3. Problem Summary

### 3.1 SDS Is Not Compatible With Vue

The SDS repository contains:

- `sds-ui` → **React** component library  
- `sds-erb` → Rails/ERB helper library  
- Webpack + Babel builds  
- no Vue components  
- no Web Components output  
- no framework-agnostic distribution  
- no CSS-only bundle  

SDS cannot be used natively inside a Vue application.

Attempts to integrate SDS into Vue resulted in:

- rendering failures  
- runtime errors  
- missing React runtimes  
- bundler incompatibilities (Webpack vs Vite)  
- unpredictable styling collisions  

### 3.2 Maintainability Risks

Remaining on Vue would require:

- manually rebuilding each SDS component in Vue  
- maintaining a custom UI toolkit indefinitely  
- diverging from Sendle’s design standards  
- losing the ability to adopt SDS updates  
- adding preventable long-term technical debt  

This creates a misalignment between the app and Sendle’s design and engineering foundations.

---

## 4. Proposed Direction

### 4.1 Rebuild the Frontend Using React + Vite + SDS

The recommended direction is to rebuild the frontend using:

- **React** (native environment for SDS)  
- **Vite**  
- **Sendle Design System (`sds-ui`)**  
- **Clerk React SDK**  
- **TypeScript**  

Backend and infrastructure remain unchanged:

- FastAPI  
- MongoDB  
- Redis  
- Docker  
- Clerk backend auth  

### 4.2 Why React Is the Correct Choice

- SDS components are created in React  
- immediate compatibility with existing SDS code  
- no need to rebuild UI components manually  
- easier long-term maintenance  
- consistent UX across Sendle apps  
- React’s ecosystem suits component-heavy experimental tooling  
- greatly reduces design drift  
- future contributors (internal or external) understand React + SDS immediately  

---

## 5. Expected Impact

### 5.1 Positive Impacts

- full SDS compatibility  
- improved developer experience  
- reduces long-term technical debt  
- simplifies onboarding for new engineers  
- better UI/UX consistency with core Sendle products  
- flexibility for future features (eval dashboards, model comparisons, reporting)  

### 5.2 Short-Term Costs

- rebuild frontend components in React  
- re-wire routing and API services  
- re-implement Clerk in React  
- re-implement UI views  

Since the app is still early-stage, these costs are modest compared to long-term savings.

---

## 6. Migration Plan

### **Phase 1 — Preparation (1–2 days)**  
- Scaffold React + Vite project  
- Install SDS + Clerk  
- Set up routing (React Router)  
- Mirror existing directory structure  
- Configure environment variables  

### **Phase 2 — Component Migration (3–7 days)**  
Rebuild the following in React with SDS:

1. Authentication wrapper  
2. Home / Stats page  
3. CSV Import page  
4. Trace List  
5. Trace Viewer (multi-turn)  
6. Annotation editor  

Use SDS components for:

- Buttons  
- Inputs  
- Textareas  
- Alerts  
- Modals  
- Tables  

### **Phase 3 — Theming (1–2 days)**  
- Apply SDS tokens (colors, spacing, typography, radii, etc.)  
- Validate with UX  
- Ensure spacing + grid match SDS guidelines  

### **Phase 4 — Testing (1–3 days)**  
- E2E workflow testing  
- CSV parsing validation  
- Annotation flows  
- Auth integration  
- API calls  
- Visual regression checks  

### **Phase 5 — Deployment (0.5–1 day)**  
- Produce production build  
- Deploy to Vite-friendly hosting or containerised infra  
- Regression test  

---

## 7. Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Missing SDS components | Build lightweight SDS-styled equivalents |
| Team not familiar with React | Provide pairing sessions & SDS examples |
| Deadline pressure | Begin migration early while the app is small |
| SDS not covering niche UI needs | Raise gap analysis to UX and design team |

---

## 8. Recommendation

Proceed with rebuilding the frontend in **React + Vite + SDS** immediately while the Evals App is still small and inexpensive to migrate.

This ensures:

- alignment with Sendle’s design direction  
- elimination of unnecessary future technical debt  
- improved quality and consistency  
- full compatibility with design and engineering practices  
- easier scaling and long-term feature development  

---

## 9. Next Steps

### **For Product Owner**
- Approve migration direction and scope  

### **For UX**
- Validate use of SDS components  
- Identify gaps that need custom React components  

### **For Frontend Engineering**
- Scaffold React project  
- Begin phased migration  
- Map Vue components → React equivalents  

### **For Architecture**
- Review final stack  
- Confirm compatibility with SDS long term  

### **For QA**
- Prepare new test plans for React flows  

---

# **Appendix: Summary for Executive Stakeholders**

The Evals App frontend must migrate from Vue → React to align with the Sendle Design System (SDS), ensure maintainability, and avoid building a parallel design ecosystem.  
Backend remains unchanged.  
Migration is low-cost at this early stage and prevents significant technical debt later.

---