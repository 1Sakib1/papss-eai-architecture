# PAPSS Integration Hub — Enterprise Application Integration (EAI) Architecture
> **Pan-African Payment and Settlement System (PAPSS)** Cross-Border Instant Payment Infrastructure · ISO 20022 · SOAP 1.2 / WSDL 1.1 · BPMN 2.0 · Canonical Integration Model

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![ISO 20022](https://img.shields.io/badge/ISO%2020022-pacs.008%20%7C%20pacs.002%20%7C%20pacs.009-059669)](https://www.iso20022.org)
[![SOAP](https://img.shields.io/badge/SOAP%201.2-WSDL%201.1%20%7C%20WS--Security-F59E0B)](https://www.w3.org/TR/soap12-part1/)
[![BPMN 2.0](https://img.shields.io/badge/BPMN-2.0%20Choreography-blue)](https://www.omg.org/spec/BPMN/2.0/)
[![License: MIT](https://img.shields.io/badge/License-MIT-slate)](LICENSE)

An interactive, production-grade **Enterprise Application Integration (EAI) Architecture & Simulation Portal** for the **Pan-African Payment and Settlement System (PAPSS)**.

Developed by **@Sakib** to model, formally specify, validate, and simulate instant cross-border commercial bank payments, real-time liquidity pre-funding, and multilateral net settlement across central banks.

---

## 🏛️ Architecture Overview

The **PAPSS Integration Hub** acts as the central Enterprise Service Bus (ESB) and canonical message broker connecting commercial banks, national central banks, and Afreximbank:

```
[ Roffi Trading Ltd (Ghana) ]                         [ Legos Corp (Nigeria) ]
              │ (REST / JSON)                                       ▲ (REST / JSON)
              ▼                                                     │
[ Ecobank Ghana (ECOCGHAC) ]                          [ Alt Bank Nigeria (ALTBNGLA) ]
   (Originator Direct Bank)                              (Beneficiary Direct Bank)
              │ (WS-01 SOAP 1.2)                                    ▲ (WS-03 SOAP 1.2)
              ▼                                                     │
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │                      PAPSS INTEGRATION HUB (EAI)                             │
 │                                                                              │
 │  ┌───────────────────────┐   ┌────────────────────────┐   ┌───────────────┐  │
 │  │      API Gateway      │──▶│  Message Broker / ESB  │──▶│  WS-BPEL 2.0  │  │
 │  │ (XSD Schema Validation│   │ (WS-ReliableMessaging  │   │ (Orchestration│  │
 │  │  & WS-Security X.509) │   │  & Dead-Letter Queues) │   │  State Engine)│  │
 │  └───────────────────────┘   └────────────────────────┘   └───────────────┘  │
 │              │                            │                       │          │
 │              ▼                            ▼                       ▼          │
 │  ┌───────────────────────┐   ┌────────────────────────┐   ┌───────────────┐  │
 │  │  Data Transformation  │   │  Payment Validation &  │   │  Pre-Funding  │  │
 │  │ (Canonical ISO 20022  │   │  Sanctions Screening   │   │  Management   │  │
 │  │  pacs.008 at Edge)    │   │  (UN/OFAC/AML Lists)   │   │ (WS-04 Ledger)│  │
 │  └───────────────────────┘   └────────────────────────┘   └───────────────┘  │
 │                                                                   │          │
 │  ┌───────────────────────┐   ┌────────────────────────┐           ▼          │
 │  │ Audit & Reconciliation│   │  Error & Notifications │   ┌───────────────┐  │
 │  │ (Immutable Ledger)    │   │  (WS-06 Outbound Push) │   │  Settlement   │  │
 │  │                       │   │                        │   │ Orchestration │  │
 │  └───────────────────────┘   └────────────────────────┘   │ (WS-05 Netting│  │
 └───────────────────────────────────────────────────────────┴───────┬──────────┘
                                                                     │ (WS-05 Net Settlement)
                     ┌───────────────────────┬───────────────────────┘
                     ▼                       ▼                       ▼
            [ Bank of Ghana ]        [ Afreximbank ]       [ Central Bank of Nigeria ]
               (BOG-RTGS)               (AFRXEGCX)                 (CBN-RTGS)
            GHS Settlement Leg     USD Hard-Currency Leg       NGN Settlement Leg
```

---

## ⚡ Core Capabilities of the Portal

### 1. ⚡ Interactive BPMN 2.0 Simulator
- **Playable Execution Engine:** Steps through the 9-participant choreography defined in `BPMN.bpmn`.
- **Fault Injection Scenarios:**
  - **Happy Path:** Clean execution of a GHS 250,000.00 payment to Legos Corp in under 120 seconds.
  - **Insufficient Pre-Funding (AM04):** Automatic payment hold (`PDNG`), Top-up request emitted to Ecobank Treasury, Bank of Ghana RTGS funding order, and automated resumption.
  - **Compliance / Sanctions Hit (WS-02):** Fuzzy-match against UN/OFAC lists triggers quarantine with zero data leakage to sender.
  - **Invalid Beneficiary Account (AC01):** NUBAN check-digit failure triggers immediate compensation, releases GHS reserve, and dispatches rejection.
  - **Beneficiary Timeout & ESB Retry:** Simulates network degradation, exponential backoff (30s, 2m, 8m), and switches to idempotent `GetCreditStatus` query.

### 2. 🔌 Web Services Catalog (WS-01 to WS-06)
- Fully documented SOAP 1.2 / WSDL 1.1 operations with inputs, outputs, fault tables, and ISO 20022 message mapping:
  - `WS-01 SubmitPaymentInstruction`: Entry point for cross-border credit transfers.
  - `WS-02 ValidatePaymentInstruction`: Composite format validation and sanctions screening.
  - `WS-03 ConfirmBeneficiaryCredit`: Instructions to beneficiary bank with companion `GetCreditStatus`.
  - `WS-04 UpdatePreFundingPosition`: Atomically manages participant pre-funding ledger balances.
  - `WS-05 SubmitNetSettlementInstruction`: Multilateral net settlement across RTGS systems.
  - `WS-06 NotifyPaymentStatus`: Unified outbound notification and report dispatcher.
- **Live Interactive SOAP Requester:** Test requests and receive real-time simulated SOAP Envelopes and fault messages.

### 3. 🛡️ Live XML Schema (XSD) Validator
- Real-time client-side XML syntax & schema validator mirroring `xmllint` (libxml2).
- Validates against:
  - `PapssCommonTypes.xsd`: UETR regex, BIC pattern, Currency enumeration, Amount decimals.
  - `PaymentInstruction.xsd`: Version-4 UUID uniqueness, PartyType sequence, SchemaVersion.
  - `NetSettlementInstruction.xsd`: MinOccurs 2 participants, CycleId format, dual-control sign-off.
- Catches the 4 deliberate defects in `PaymentInstruction_Invalid_Sample.xml`:
  1. Truncated BIC (`ECOCGH`)
  2. Unregistered Currency (`GBP`)
  3. Invalid fraction digits (`250000.555`)
  4. Missing Creditor Account element

### 4. 🔄 Canonical Data Transformation & Complexity Reduction
- Interactive 3-way mapping matrix: **Ecobank Proprietary Core Format ↔ Canonical ISO 20022 pacs.008 ↔ Alt Bank Nigeria NUBAN Format**.
- **O(N) vs O(N²) Scalability Calculator:** Demonstrates how connecting Africa's 54 central banks requires only **54 adapters** with PAPSS, compared to **2,862 pairwise translators** in a point-to-point network (a **98.1% savings**).

### 5. ⚖️ Multilateral Net Settlement Engine
- Live netting balance calculator verifying zero-sum multilateral clearing (`TotalNetAmount = 0.00 GHS`).
- Dual-control digital authorization simulator requiring two authorized officers before release.

---

## 📂 Repository Structure

```
├── public/
│   ├── BPMN.bpmn                          # Full OMG BPMN 2.0 XML specification
│   ├── PAPSS_Cross_Border_Payment.bpmn    # Process diagram definition
│   ├── lucidchart_architecture.json       # Exported Lucidchart architecture model
│   ├── schemas/
│   │   ├── PapssCommonTypes.xsd           # Reusable ISO 20022 XML type library
│   │   ├── PaymentInstruction.xsd         # WS-01 & WS-02 message schema
│   │   ├── NetSettlementInstruction.xsd   # WS-05 multilateral settlement schema
│   │   ├── PaymentInstructionService.wsdl # WSDL 1.1 / SOAP 1.2 service definition
│   │   ├── PaymentInstruction_Sample.xml  # Valid pacs.008 sample document
│   │   ├── NetSettlementInstruction_Sample.xml # Valid net settlement sample
│   │   ├── PaymentInstruction_Invalid_Sample.xml # 4-defect test document
│   │   └── InsufficientPreFunding_Fault.xml # Realistic AM04 SOAP Fault envelope
│   └── docs/
│       ├── Task2_Web_Service_Design.docx  # Full authored Task 2 specification
│       └── Task3_XML_Schema_Design.docx   # Full authored Task 3 specification
├── src/
│   ├── components/
│   │   ├── Header.jsx                     # Top navigation & system status
│   │   ├── ArchitectureHub.jsx            # Interactive EAI topology visualizer
│   │   ├── BpmnSimulator.jsx              # 5-scenario BPMN payment engine
│   │   ├── WebServicesCatalog.jsx         # WS-01 to WS-06 & SOAP tester
│   │   ├── SchemaValidator.jsx            # XSD code viewer & live XML validator
│   │   ├── DataTransformation.jsx         # Canonical mapping matrix & O(N) slider
│   │   ├── NetSettlement.jsx              # Multilateral netting calculator
│   │   ├── TechDocumentation.jsx          # Academic reports & bibliography
│   │   └── DownloadsModal.jsx             # Direct file download modal
│   ├── data/
│   │   ├── servicesData.js                # Specifications for WS-01 to WS-06
│   │   ├── mappingData.js                 # Field transformation rules
│   │   └── embedded_assets.js             # Embedded XSD, WSDL, and XML assets
│   ├── utils/
│   │   └── xmlValidator.js                # Client-side XML schema validation engine
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/1Sakib1/papss-eai-architecture.git

# Enter the project directory
cd papss-eai-architecture

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Visit `http://localhost:3000` in your web browser.

### Production Build
```bash
npm run build
```
The optimized static bundle will be generated in the `dist/` directory, ready to deploy to Vercel, Netlify, or GitHub Pages.

---

## 📜 References & Citations

- **Christensen, E., Curbera, F., Meredith, G., & Weerawarana, S. (2001).** *Web Services Description Language (WSDL) 1.1* [W3C Note]. World Wide Web Consortium.
- **Erl, T. (2005).** *Service-Oriented Architecture: Concepts, Technology, and Design*. Prentice Hall.
- **Hohpe, G., & Woolf, B. (2004).** *Enterprise Integration Patterns: Designing, Building, and Deploying Messaging Solutions*. Addison-Wesley.
- **ISO 20022 Registration Authority. (n.d.).** *ISO 20022 Universal Financial Industry Message Scheme*. https://www.iso20022.org/
- **OASIS. (2007).** *Web Services Business Process Execution Language Version 2.0* [OASIS Standard].
- **W3C. (2007).** *SOAP Version 1.2 Part 1: Messaging Framework (2nd ed.)* [W3C Recommendation].

---

## 👤 Author

**Nazmus Sakib (@Sakib)**  
GitHub: [@1Sakib1](https://github.com/1Sakib1)  
*Pan-African Payment and Settlement System (PAPSS) EAI Architecture Project · Nov 2026*
