export const SERVICES = [
  {
    ref: "WS-01",
    name: "SubmitPaymentInstruction",
    provider: "API Gateway → Workflow Management",
    consumer: "Ecobank Ghana (Originator Bank)",
    bpmnFlow: "Payment instruction (Submit Payment → Payment In)",
    isoMessage: "pacs.008.001.08 → pacs.002.001.10",
    protocol: "SOAP 1.2 / WSDL 1.1 / WS-Security (X.509) / WS-ReliableMessaging",
    purpose: "The primary entry point for a cross-border credit transfer. Ecobank Ghana submits a signed instruction on behalf of Roffi Trading Ltd; PAPSS validates the XML schema at the API Gateway, checks idempotency via UETR, assigns a clearing reference and admits the instruction to BPEL orchestration. Synchronous reply is an acknowledgement (ACTC/RJCT/PDNG); final outcome returns asynchronously via WS-06.",
    inputs: [
      { field: "paymentId", type: "UUID (UETR)", req: "M", notes: "End-to-end identifier; also the idempotency key" },
      { field: "originatorBankId", type: "BIC (8 or 11)", req: "M", notes: "Submitting bank BIC (e.g. ECOCGHAC)" },
      { field: "beneficiaryBankId", type: "BIC (8 or 11)", req: "M", notes: "Routing target BIC (e.g. ALTBNGLA)" },
      { field: "originatorName", type: "string(140)", req: "M", notes: "Originating ordering customer" },
      { field: "originatorAccount", type: "string(34)", req: "M", notes: "Padded branch + account number" },
      { field: "beneficiaryName", type: "string(140)", req: "M", notes: "Beneficiary creditor name; screened by WS-02" },
      { field: "beneficiaryAccount", type: "string(34)", req: "M", notes: "10-digit NUBAN for Nigerian accounts" },
      { field: "instructedAmount", type: "decimal(18,2) [Ccy]", req: "M", notes: "e.g. 250000.00 GHS" },
      { field: "settlementCurrency", type: "ISO 4217", req: "M", notes: "NGN (destination currency)" },
      { field: "fxQuoteRef", type: "string(35)", req: "O", notes: "References the FX Quote data object" },
      { field: "purposeCode", type: "ExternalPurpose1Code", req: "M", notes: "e.g. GDDS (Goods trade)" },
      { field: "requestedExecutionDate", type: "date (YYYY-MM-DD)", req: "M", notes: "Settlement date" },
      { field: "chargeBearer", type: "enum DEBT/CRED/SHAR", req: "M", notes: "Charge allocation (e.g. SHAR)" },
      { field: "remittanceInformation", type: "string(140)", req: "O", notes: "Invoice reference / description" },
      { field: "digitalSignature", type: "ds:Signature", req: "M", notes: "WS-Security X.509 signature" }
    ],
    outputs: [
      { field: "paymentId", type: "UUID", notes: "Echoed from request" },
      { field: "clearingReference", type: "string(35)", notes: "PAPSS-assigned reference (e.g. PAPSS-2026-GH-0001234)" },
      { field: "acceptanceStatus", type: "enum ACTC / RJCT / PDNG", notes: "ACTC = accepted after technical validation" },
      { field: "validationStatus", type: "enum PASS / PENDING / FAIL", notes: "PENDING while WS-02 sanctions screening runs" },
      { field: "receivedTimestamp", type: "dateTime (UTC)", notes: "Normalises GMT and WAT clocks" },
      { field: "rejectReasonCode", type: "ExternalStatusReason1Code", notes: "Present only when RJCT" }
    ],
    faults: [
      { fault: "DuplicatePaymentInstruction", code: "AM05", recovery: "Original ACK replayed; no second debit", escalation: "Logged only" },
      { fault: "InvalidAccountDetails", code: "AC01/AC04", recovery: "None - non-retryable", escalation: "Reject, release reserve, notify via WS-06" },
      { fault: "SchemaValidationFault", code: "TECHNICAL", recovery: "None - rejected at API Gateway", escalation: "Return 400 Bad Request with schema errors" }
    ],
    sampleRequest: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               xmlns:pay="http://papss.org/schema/payment/v1"
               xmlns:cmn="http://papss.org/schema/common/v1">
  <soap:Header>
    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <wsse:BinarySecurityToken ValueType="X509v3">MIIEvgIBADANBgkqhkiG9w0B...</wsse:BinarySecurityToken>
    </wsse:Security>
  </soap:Header>
  <soap:Body>
    <pay:PaymentInstruction SchemaVersion="1.0">
      <pay:GroupHeader>
        <pay:MessageId>PAPSS-MSG-2026-10-15-000412</pay:MessageId>
        <pay:CreationDateTime>2026-10-15T09:41:58Z</pay:CreationDateTime>
        <pay:NumberOfTransactions>1</pay:NumberOfTransactions>
        <pay:InstructingAgent><cmn:BICFI>ECOCGHAC</cmn:BICFI></pay:InstructingAgent>
        <pay:InstructedAgent><cmn:BICFI>ALTBNGLA</cmn:BICFI></pay:InstructedAgent>
      </pay:GroupHeader>
      <pay:CreditTransferTransaction>
        <pay:PaymentId>8f3c1b2a-77d4-4e19-9a52-0b6c1d3e4f58</pay:PaymentId>
        <pay:EndToEndId>ROFFI-INV-2026-0881</pay:EndToEndId>
        <pay:InstructedAmount Ccy="GHS">250000.00</pay:InstructedAmount>
        <pay:SettlementCurrency>NGN</pay:SettlementCurrency>
        <pay:FxRate>24.871500</pay:FxRate>
        <pay:RequestedExecutionDate>2026-10-15</pay:RequestedExecutionDate>
        <pay:ChargeBearer>SHAR</pay:ChargeBearer>
        <pay:PurposeCode>GDDS</pay:PurposeCode>
        <pay:Debtor>
          <cmn:Name>Roffi Trading Ltd</cmn:Name>
          <cmn:Account>0124558877001</cmn:Account>
          <cmn:Country>GH</cmn:Country>
        </pay:Debtor>
        <pay:Creditor>
          <cmn:Name>Legos Corp</cmn:Name>
          <cmn:Account>3081447729</cmn:Account>
          <cmn:Country>NG</cmn:Country>
        </pay:Creditor>
      </pay:CreditTransferTransaction>
    </pay:PaymentInstruction>
  </soap:Body>
</soap:Envelope>`,
    sampleResponse: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               xmlns:pay="http://papss.org/schema/payment/v1">
  <soap:Body>
    <pay:PaymentAcknowledgement>
      <pay:PaymentId>8f3c1b2a-77d4-4e19-9a52-0b6c1d3e4f58</pay:PaymentId>
      <pay:ClearingReference>PAPSS-2026-GH-0001234</pay:ClearingReference>
      <pay:AcceptanceStatus>ACTC</pay:AcceptanceStatus>
      <pay:ValidationStatus>PENDING</pay:ValidationStatus>
      <pay:ReceivedTimestamp>2026-10-15T09:42:01Z</pay:ReceivedTimestamp>
    </pay:PaymentAcknowledgement>
  </soap:Body>
</soap:Envelope>`
  },
  {
    ref: "WS-02",
    name: "ValidatePaymentInstruction",
    provider: "Payment Validation + Compliance & Sanctions Screening",
    consumer: "Workflow Management (BPEL invoke)",
    bpmnFlow: "Internal to Check Payment task",
    isoMessage: "pacs.002 status",
    protocol: "SOAP 1.2 / Internal ESB Service",
    purpose: "A composite service invoked by BPEL at the Check Payment task. It runs account format validation and sanctions/AML screening against UN, OFAC, and regional lists, returning one decision that drives the Payment Route? gateway. Keeping it distinct from WS-01 permits re-screening on watchlist updates without requiring originator re-submission.",
    inputs: [
      { field: "paymentId", type: "UUID", req: "M", notes: "Target payment identifier" },
      { field: "clearingReference", type: "string(35)", req: "M", notes: "PAPSS clearing reference" },
      { field: "originatorName", type: "string(140)", req: "M", notes: "Originator name for AML check" },
      { field: "originatorCountry", type: "ISO 3166 alpha-2", req: "M", notes: "e.g. GH" },
      { field: "beneficiaryName", type: "string(140)", req: "M", notes: "Creditor name for Sanctions screening" },
      { field: "beneficiaryCountry", type: "ISO 3166 alpha-2", req: "M", notes: "e.g. NG" },
      { field: "beneficiaryAccount", type: "string(34)", req: "M", notes: "Format & check-digit validation" },
      { field: "beneficiaryBankId", type: "BIC", req: "M", notes: "Checked against PAPSS participant register" },
      { field: "amount", type: "decimal(18,2) [Ccy]", req: "M", notes: "Threshold & currency limits" },
      { field: "purposeCode", type: "ExternalPurpose1Code", req: "M", notes: "Classification check" },
      { field: "screeningProfile", type: "enum STANDARD/ENHANCED", req: "M", notes: "Enhanced for high-risk corridors" }
    ],
    outputs: [
      { field: "paymentId", type: "UUID", notes: "Echoed payment ID" },
      { field: "validationStatus", type: "enum PASS / FAIL", notes: "Format and account check outcome" },
      { field: "complianceStatus", type: "enum CLEAR / HIT / REVIEW", notes: "Screening engine decision" },
      { field: "sanctionsMatchScore", type: "integer 0-100", notes: "Fuzzy-match confidence (0 = no match)" },
      { field: "matchedListRef", type: "string(35)", notes: "Present only when HIT" },
      { field: "screeningReference", type: "string(35)", notes: "Audit key written to Audit & Reconciliation" },
      { field: "decisionTimestamp", type: "dateTime (UTC)", notes: "Timestamp of automated decision" }
    ],
    faults: [
      { fault: "FailedSanctionsCheck", code: "HOLD", recovery: "None - never auto-retried", escalation: "Manual compliance officer review" },
      { fault: "SanctionsScreeningUnavailable", code: "TECHNICAL", recovery: "ESB retry after 5s", escalation: "Flag Exception, Open Case" },
      { fault: "PAPSSValidationTimeout", code: "TECHNICAL", recovery: "Recheck Due timer re-invoke", escalation: "Flag Exception, return status PDNG" }
    ],
    sampleRequest: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               xmlns:val="http://papss.org/schema/validation/v1">
  <soap:Body>
    <val:ValidatePaymentRequest>
      <val:paymentId>8f3c1b2a-77d4-4e19-9a52-0b6c1d3e4f58</val:paymentId>
      <val:clearingReference>PAPSS-2026-GH-0001234</val:clearingReference>
      <val:originatorName>Roffi Trading Ltd</val:originatorName>
      <val:originatorCountry>GH</val:originatorCountry>
      <val:beneficiaryName>Legos Corp</val:beneficiaryName>
      <val:beneficiaryCountry>NG</val:beneficiaryCountry>
      <val:beneficiaryAccount>3081447729</val:beneficiaryAccount>
      <val:beneficiaryBankId>ALTBNGLA</val:beneficiaryBankId>
      <val:amount Ccy="GHS">250000.00</val:amount>
      <val:purposeCode>GDDS</val:purposeCode>
      <val:screeningProfile>STANDARD</val:screeningProfile>
    </val:ValidatePaymentRequest>
  </soap:Body>
</soap:Envelope>`,
    sampleResponse: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               xmlns:val="http://papss.org/schema/validation/v1">
  <soap:Body>
    <val:ValidatePaymentResponse>
      <val:paymentId>8f3c1b2a-77d4-4e19-9a52-0b6c1d3e4f58</val:paymentId>
      <val:validationStatus>PASS</val:validationStatus>
      <val:complianceStatus>CLEAR</val:complianceStatus>
      <val:sanctionsMatchScore>0</val:sanctionsMatchScore>
      <val:screeningReference>SCR-2026-1015-88392</val:screeningReference>
      <val:decisionTimestamp>2026-10-15T09:42:04Z</val:decisionTimestamp>
    </val:ValidatePaymentResponse>
  </soap:Body>
</soap:Envelope>`
  },
  {
    ref: "WS-03",
    name: "ConfirmBeneficiaryCredit",
    provider: "Alt Bank Nigeria Bank Adapter",
    consumer: "Settlement Orchestration",
    bpmnFlow: "NGN credit instruction, Credit result, Credit status query",
    isoMessage: "pacs.008 → pacs.002",
    protocol: "SOAP 1.2 / MTLS / WSDL 1.1",
    purpose: "PAPSS instructs the beneficiary bank (Alt Bank Nigeria) to credit Legos Corp in local currency (NGN) and confirm immediate ledger posting. A companion GetCreditStatus operation on the same port type handles Credit status queries when the Credit Timeout timer fires, eliminating duplicate credits on network timeouts.",
    inputs: [
      { field: "paymentId", type: "UUID", req: "M", notes: "Idempotency key at beneficiary bank" },
      { field: "clearingReference", type: "string(35)", req: "M", notes: "PAPSS clearing reference" },
      { field: "beneficiaryAccount", type: "string(34)", req: "M", notes: "10-digit NUBAN" },
      { field: "beneficiaryName", type: "string(140)", req: "M", notes: "Matched against account holder record" },
      { field: "creditCurrency", type: "ISO 4217", req: "M", notes: "NGN" },
      { field: "creditAmount", type: "decimal(18,2)", req: "M", notes: "Post-conversion amount (6,217,875.00 NGN)" },
      { field: "fxRate", type: "decimal(11,6)", req: "M", notes: "Locked rate: 24.871500" },
      { field: "valueDate", type: "date", req: "M", notes: "Settlement date" },
      { field: "originatorBankId", type: "BIC", req: "M", notes: "ECOCGHAC" },
      { field: "remittanceInformation", type: "string(140)", req: "O", notes: "Invoice ROFFI-INV-2026-0881" }
    ],
    outputs: [
      { field: "paymentId", type: "UUID", notes: "Echoed identifier" },
      { field: "creditStatus", type: "enum ACSC / RJCT / PDNG", notes: "ACSC = Accepted, Settlement Completed" },
      { field: "confirmationReference", type: "string(35)", notes: "Alt Bank Nigeria posting journal ref" },
      { field: "creditedAmount", type: "decimal(18,2)", notes: "Confirmed amount posted (6,217,875.00 NGN)" },
      { field: "creditTimestamp", type: "dateTime (UTC)", notes: "Timestamp of customer credit" }
    ],
    faults: [
      { fault: "InvalidAccountDetails", code: "AC01/AC04", recovery: "None - non-retryable", escalation: "Auto-release reserved GHS, notify via WS-06" },
      { fault: "BeneficiaryBankUnavailable", code: "TECHNICAL", recovery: "3 ESB redeliveries (30s, 2m, 8m)", escalation: "Invoke GetCreditStatus query; do not re-credit" },
      { fault: "CreditConfirmationTimeout", code: "TECHNICAL", recovery: "Wait Credit event timer fires", escalation: "Mark Pending, Flag Exception" }
    ],
    sampleRequest: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               xmlns:crd="http://papss.org/schema/credit/v1">
  <soap:Body>
    <crd:ConfirmBeneficiaryCreditRequest>
      <crd:paymentId>8f3c1b2a-77d4-4e19-9a52-0b6c1d3e4f58</crd:paymentId>
      <crd:clearingReference>PAPSS-2026-GH-0001234</crd:clearingReference>
      <crd:beneficiaryAccount>3081447729</crd:beneficiaryAccount>
      <crd:beneficiaryName>Legos Corp</crd:beneficiaryName>
      <crd:creditCurrency>NGN</crd:creditCurrency>
      <crd:creditAmount>6217875.00</crd:creditAmount>
      <crd:fxRate>24.871500</crd:fxRate>
      <crd:valueDate>2026-10-15</crd:valueDate>
      <crd:originatorBankId>ECOCGHAC</crd:originatorBankId>
      <crd:remittanceInformation>Invoice ROFFI-INV-2026-0881, cocoa processing equipment</crd:remittanceInformation>
    </crd:ConfirmBeneficiaryCreditRequest>
  </soap:Body>
</soap:Envelope>`,
    sampleResponse: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               xmlns:crd="http://papss.org/schema/credit/v1">
  <soap:Body>
    <crd:ConfirmBeneficiaryCreditResponse>
      <crd:paymentId>8f3c1b2a-77d4-4e19-9a52-0b6c1d3e4f58</crd:paymentId>
      <crd:creditStatus>ACSC</crd:creditStatus>
      <crd:confirmationReference>ALTB-NG-TXN-20261015-99214</crd:confirmationReference>
      <crd:creditedAmount>6217875.00</crd:creditedAmount>
      <crd:creditTimestamp>2026-10-15T09:42:15Z</crd:creditTimestamp>
    </crd:ConfirmBeneficiaryCreditResponse>
  </soap:Body>
</soap:Envelope>`
  },
  {
    ref: "WS-04",
    name: "UpdatePreFundingPosition",
    provider: "Pre-Funding Management",
    consumer: "Participant Treasury, RTGS Adapters, Workflow",
    bpmnFlow: "GHS/NGN funding orders, funding results, balance results, Check Funds",
    isoMessage: "pacs.009, camt.054, camt.052",
    protocol: "SOAP 1.2 / High-Throughput In-Memory Ledger",
    purpose: "Maintains each participant's pre-funded clearing balance per currency. Guarantees zero credit risk: PAPSS clears transactions only against real funds already held in the central bank RTGS. Invoked for CREDIT (RTGS funding order confirmed), RESERVE (funds earmarked for in-flight payment), RELEASE (unwinding failed payment), and DEBIT (clearing cycle finalization).",
    inputs: [
      { field: "participantId", type: "BIC", req: "M", notes: "Direct participant whose position moves" },
      { field: "sponsorId", type: "BIC", req: "O", notes: "Sponsoring bank for indirect participants" },
      { field: "settlementCurrency", type: "ISO 4217", req: "M", notes: "GHS, NGN, USD, etc." },
      { field: "movementType", type: "enum CREDIT/DEBIT/RESERVE/RELEASE", req: "M", notes: "RESERVE earmarks; RELEASE unwinds" },
      { field: "amount", type: "decimal(18,2)", req: "M", notes: "Transaction amount" },
      { field: "fundingOrderId", type: "string(35)", req: "O", notes: "Present for CREDIT from RTGS" },
      { field: "rtgsReference", type: "string(35)", req: "O", notes: "Central bank RTGS journal ref" },
      { field: "rtgsSystemId", type: "enum BOG-RTGS/CBN-RTGS", req: "O", notes: "Source RTGS bridge" },
      { field: "relatedPaymentId", type: "UUID", req: "O", notes: "Present for RESERVE / RELEASE" },
      { field: "valueDate", type: "date", req: "M", notes: "Effective date" }
    ],
    outputs: [
      { field: "participantId", type: "BIC", notes: "BIC identifier" },
      { field: "settlementCurrency", type: "ISO 4217", notes: "Currency code" },
      { field: "clearingBalance", type: "decimal(18,2)", notes: "Total pre-funded ledger balance" },
      { field: "availableBalance", type: "decimal(18,2)", notes: "Clearing balance less current reservations" },
      { field: "reservedAmount", type: "decimal(18,2)", notes: "Earmarked against in-flight payments" },
      { field: "lastMovementId", type: "string(35)", notes: "Ledger journal entry reference" },
      { field: "movementStatus", type: "enum APPLIED / REJECTED", notes: "Outcome of position update" },
      { field: "thresholdBreachFlag", type: "boolean", notes: "True if balance drops below liquidity floor" }
    ],
    faults: [
      { fault: "InsufficientPreFunding", code: "AM04", recovery: "Payment held (PDNG), Top-up request issued", escalation: "Funding Timeout (PT30M) → Open Case & Release" },
      { fault: "RTGSConfirmationFailure", code: "TECHNICAL", recovery: "Status re-query from ESB store", escalation: "Central bank & treasury operations alerted" },
      { fault: "PositionLocked", code: "TECHNICAL", recovery: "Micro-retry after 100ms", escalation: "Ledger concurrency exception" }
    ],
    sampleRequest: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               xmlns:pf="http://papss.org/schema/prefunding/v1">
  <soap:Body>
    <pf:UpdatePreFundingPositionRequest>
      <pf:participantId>ECOCGHAC</pf:participantId>
      <pf:settlementCurrency>GHS</pf:settlementCurrency>
      <pf:movementType>RESERVE</pf:movementType>
      <pf:amount>250000.00</pf:amount>
      <pf:relatedPaymentId>8f3c1b2a-77d4-4e19-9a52-0b6c1d3e4f58</pf:relatedPaymentId>
      <pf:valueDate>2026-10-15</pf:valueDate>
    </pf:UpdatePreFundingPositionRequest>
  </soap:Body>
</soap:Envelope>`,
    sampleResponse: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               xmlns:pf="http://papss.org/schema/prefunding/v1">
  <soap:Body>
    <pf:UpdatePreFundingPositionResponse>
      <pf:participantId>ECOCGHAC</pf:participantId>
      <pf:settlementCurrency>GHS</pf:settlementCurrency>
      <pf:clearingBalance>4250000.00</pf:clearingBalance>
      <pf:availableBalance>4000000.00</pf:availableBalance>
      <pf:reservedAmount>250000.00</pf:reservedAmount>
      <pf:lastMovementId>LEDG-MOV-20261015-094208</pf:lastMovementId>
      <pf:movementStatus>APPLIED</pf:movementStatus>
      <pf:thresholdBreachFlag>false</pf:thresholdBreachFlag>
    </pf:UpdatePreFundingPositionResponse>
  </soap:Body>
</soap:Envelope>`
  },
  {
    ref: "WS-05",
    name: "SubmitNetSettlementInstruction",
    provider: "Settlement Orchestration + Audit & Reconciliation",
    consumer: "Bank of Ghana RTGS, CBN RTGS, Afreximbank",
    bpmnFlow: "GH/NG/FX net instruction and results, settlement reports",
    isoMessage: "pacs.009, camt.053",
    protocol: "SOAP 1.2 / Dual-Control XML-DSig / MTLS",
    purpose: "Triggered at Day Cutoff by Settlement Orchestration. Computes multilateral net positions across all processed transactions and issues parallel settlement instructions to Bank of Ghana RTGS (GHS leg), Central Bank of Nigeria RTGS (NGN leg), and Afreximbank (hard-currency USD leg). Reconciles all three central bank confirmations before declaring the cycle settled.",
    inputs: [
      { field: "cycleId", type: "string(35)", req: "M", notes: "Pattern: PAPSS-CYCLE-YYYY-MM-DD" },
      { field: "settlementDate", type: "date", req: "M", notes: "Settlement value date" },
      { field: "rtgsSystemId", type: "enum BOG-RTGS/CBN-RTGS/AFREXIM", req: "M", notes: "Selects target RTGS leg" },
      { field: "cycleCurrency", type: "ISO 4217", req: "M", notes: "GHS, NGN, or USD" },
      { field: "participantPositions", type: "complex (minOccurs 2)", req: "M", notes: "Participant positions (Debits, Credits, Net)" },
      { field: "totalNetAmount", type: "decimal(18,2)", req: "M", notes: "MUST sum to 0.00 across cycle" },
      { field: "instructionTimestamp", type: "dateTime", req: "M", notes: "Dispatch timestamp" },
      { field: "authorisationSignature", type: "minOccurs 2 maxOccurs 2", req: "M", notes: "Dual-control digital signatures" }
    ],
    outputs: [
      { field: "cycleId", type: "string(35)", notes: "Cycle reference" },
      { field: "rtgsSystemId", type: "enum", notes: "Leg confirmed" },
      { field: "settlementStatus", type: "enum SETTLED/PARTIAL/EXCEPTION/PENDING", notes: "Drives Cycle Matched? gateway" },
      { field: "rtgsConfirmationRef", type: "string(35)", notes: "Central bank posting reference" },
      { field: "settledAmount", type: "decimal(18,2)", notes: "Total confirmed settled volume" },
      { field: "settledTimestamp", type: "dateTime (UTC)", notes: "Finality timestamp" }
    ],
    faults: [
      { fault: "SettlementMismatch", code: "RECON_BREAK", recovery: "Automatic Reconcile pass against ledger", escalation: "Cycle Pending; alert PAPSS admin & central banks" },
      { fault: "RTGSConfirmationFailure", code: "TECHNICAL", recovery: "Status re-query from ESB store", escalation: "Cycle held open; central bank ops notified" },
      { fault: "CycleAlreadySettled", code: "BUSINESS", recovery: "Return existing confirmation", escalation: "Duplicate cycle dispatch ignored" }
    ],
    sampleRequest: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               xmlns:stl="http://papss.org/schema/settlement/v1"
               xmlns:cmn="http://papss.org/schema/common/v1">
  <soap:Body>
    <stl:NetSettlementInstruction SchemaVersion="1.0">
      <stl:CycleId>PAPSS-CYCLE-2026-10-15</stl:CycleId>
      <stl:SettlementDate>2026-10-15</stl:SettlementDate>
      <stl:RtgsSystemId>BOG-RTGS</stl:RtgsSystemId>
      <stl:CycleCurrency>GHS</stl:CycleCurrency>
      <stl:ParticipantPositions>
        <stl:ParticipantPosition>
          <stl:ParticipantId>ECOCGHAC</stl:ParticipantId>
          <stl:ParticipantName>Ecobank Ghana Limited</stl:ParticipantName>
          <stl:ParticipantRole>DIRECT</stl:ParticipantRole>
          <stl:GrossDebits Ccy="GHS">4250000.00</stl:GrossDebits>
          <stl:GrossCredits Ccy="GHS">1180500.00</stl:GrossCredits>
          <stl:NetAmount Ccy="GHS">-3069500.00</stl:NetAmount>
          <stl:TransactionCount>1284</stl:TransactionCount>
        </stl:ParticipantPosition>
        <stl:ParticipantPosition>
          <stl:ParticipantId>GHCBGHAC</stl:ParticipantId>
          <stl:ParticipantName>Ghana Commercial Bank</stl:ParticipantName>
          <stl:ParticipantRole>DIRECT</stl:ParticipantRole>
          <stl:GrossDebits Ccy="GHS">920000.00</stl:GrossDebits>
          <stl:GrossCredits Ccy="GHS">2310000.00</stl:GrossCredits>
          <stl:NetAmount Ccy="GHS">1390000.00</stl:NetAmount>
          <stl:TransactionCount>655</stl:TransactionCount>
        </stl:ParticipantPosition>
        <stl:ParticipantPosition>
          <stl:ParticipantId>AFRXEGCX</stl:ParticipantId>
          <stl:ParticipantName>African Export-Import Bank</stl:ParticipantName>
          <stl:ParticipantRole>SETTLEMENT_AGENT</stl:ParticipantRole>
          <stl:GrossDebits Ccy="GHS">0.00</stl:GrossDebits>
          <stl:GrossCredits Ccy="GHS">1679500.00</stl:GrossCredits>
          <stl:NetAmount Ccy="GHS">1679500.00</stl:NetAmount>
          <stl:TransactionCount>0</stl:TransactionCount>
        </stl:ParticipantPosition>
      </stl:ParticipantPositions>
      <stl:TotalNetAmount Ccy="GHS">0.00</stl:TotalNetAmount>
      <stl:InstructionTimestamp>2026-10-15T17:30:04Z</stl:InstructionTimestamp>
      <stl:AuthorisedBy>K. Mensah, Settlement Operations</stl:AuthorisedBy>
      <stl:AuthorisedBy>A. Danquah, Settlement Operations</stl:AuthorisedBy>
    </stl:NetSettlementInstruction>
  </soap:Body>
</soap:Envelope>`,
    sampleResponse: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               xmlns:stl="http://papss.org/schema/settlement/v1">
  <soap:Body>
    <stl:SettlementConfirmation>
      <stl:CycleId>PAPSS-CYCLE-2026-10-15</stl:CycleId>
      <stl:RtgsSystemId>BOG-RTGS</stl:RtgsSystemId>
      <stl:SettlementStatus>SETTLED</stl:SettlementStatus>
      <stl:RtgsConfirmationRef>BOG-RTGS-CONF-20261015-88391</stl:RtgsConfirmationRef>
      <stl:SettledAmount Ccy="GHS">3069500.00</stl:SettledAmount>
      <stl:SettledTimestamp>2026-10-15T17:45:12Z</stl:SettledTimestamp>
    </stl:SettlementConfirmation>
  </soap:Body>
</soap:Envelope>`
  },
  {
    ref: "WS-06",
    name: "NotifyPaymentStatus",
    provider: "Error Handling & Notifications",
    consumer: "Originator Bank, Beneficiary Bank, Corporates",
    bpmnFlow: "Final payment result, Beneficiary credit notice, Customer result, Top-up request",
    isoMessage: "pacs.002, camt.054",
    protocol: "SOAP 1.2 (Banks) / REST Webhooks (Corporates) / SMTP",
    purpose: "Centralized outbound notification service handling all downstream status reporting. Pushes final clearing results (ACSC/RJCT), corporate credit notices, daily settlement reports, and automated Top-up requests when pre-funding falls below threshold. Consolidates retry logic, delivery tracking, and dead-letter queues.",
    inputs: [
      { field: "notificationType", type: "enum PAYMENT_RESULT/CREDIT_NOTICE/TOPUP_REQUEST", req: "M", notes: "Selects payload template" },
      { field: "paymentId", type: "UUID", req: "O", notes: "Payment-scoped notifications" },
      { field: "cycleId", type: "string(35)", req: "O", notes: "Present for settlement reports" },
      { field: "recipientId", type: "BIC or customer ID", req: "M", notes: "e.g. ECOCGHAC or ROFFI-GH" },
      { field: "recipientChannel", type: "enum SOAP / REST / EMAIL", req: "M", notes: "SOAP to banks, REST to corporates" },
      { field: "statusCode", type: "enum ACSC/RJCT/PDNG", req: "M", notes: "Standard status code" },
      { field: "reasonCode", type: "ExternalStatusReason1Code", req: "O", notes: "Present if rejected (e.g. AM04, AC01)" },
      { field: "confirmationReference", type: "string(35)", req: "O", notes: "Clearing or posting journal ref" },
      { field: "amount", type: "decimal(18,2) [Ccy]", req: "O", notes: "Transaction amount" },
      { field: "messageTimestamp", type: "dateTime", req: "M", notes: "Dispatch time" }
    ],
    outputs: [
      { field: "notificationId", type: "string(35)", notes: "Unique dispatch reference" },
      { field: "deliveryStatus", type: "enum DELIVERED / QUEUED / FAILED", notes: "QUEUED if recipient unreachable" },
      { field: "deliveryTimestamp", type: "dateTime (UTC)", notes: "Delivery acknowledgment time" },
      { field: "retryCount", type: "integer", notes: "Redelivery attempts from ESB store" }
    ],
    faults: [
      { fault: "RecipientUnavailable", code: "TECHNICAL", recovery: "ESB dead-letter queue with retry", escalation: "Operational alert logged in Audit trail" }
    ],
    sampleRequest: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               xmlns:not="http://papss.org/schema/notification/v1">
  <soap:Body>
    <not:NotifyPaymentStatusRequest>
      <not:notificationType>PAYMENT_RESULT</not:notificationType>
      <not:paymentId>8f3c1b2a-77d4-4e19-9a52-0b6c1d3e4f58</not:paymentId>
      <not:recipientId>ECOCGHAC</not:recipientId>
      <not:recipientChannel>SOAP</not:recipientChannel>
      <not:statusCode>ACSC</not:statusCode>
      <not:confirmationReference>PAPSS-2026-GH-0001234</not:confirmationReference>
      <not:amount Ccy="GHS">250000.00</not:amount>
      <not:messageTimestamp>2026-10-15T09:42:18Z</not:messageTimestamp>
    </not:NotifyPaymentStatusRequest>
  </soap:Body>
</soap:Envelope>`,
    sampleResponse: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               xmlns:not="http://papss.org/schema/notification/v1">
  <soap:Body>
    <not:NotifyPaymentStatusResponse>
      <not:notificationId>NOTIF-20261015-094218-001</not:notificationId>
      <not:deliveryStatus>DELIVERED</not:deliveryStatus>
      <not:deliveryTimestamp>2026-10-15T09:42:19Z</not:deliveryTimestamp>
      <not:retryCount>0</not:retryCount>
    </not:NotifyPaymentStatusResponse>
  </soap:Body>
</soap:Envelope>`
  }
];

export const FAULT_SCENARIOS = [
  {
    fault: "InvalidAccountDetails",
    code: "AC01 (AC04 if closed)",
    detectedBy: "Alt Bank adapter → Check Credit",
    recovery: "None — non-retryable",
    escalation: "Reject, release reserved funds, notify originator bank and customer (WS-06) → Set Rejected, Reject Payment",
    category: "BUSINESS"
  },
  {
    fault: "InsufficientPreFunding",
    code: "AM04",
    detectedBy: "Pre-Funding Management → Check Funds",
    recovery: "Payment held, not rejected; Request Top-up issued; the Funds Available conditional event retries the reserve once the RTGS credit lands",
    escalation: "Funding Timeout (PT30M) → Flag Exception, Open Case for the settlement administrator",
    category: "BUSINESS"
  },
  {
    fault: "FailedSanctionsCheck",
    code: "Compliance Hold",
    detectedBy: "Compliance & Sanctions Screening → Check Payment",
    recovery: "None — never auto-retried or auto-released",
    escalation: "Manual compliance review, regulator notification, release-or-reject decision logged in Audit & Reconciliation",
    category: "BUSINESS"
  },
  {
    fault: "DuplicatePaymentInstruction",
    code: "AM05",
    detectedBy: "API Gateway idempotency cache → Already Running",
    recovery: "Original acknowledgement replayed; no second debit posted",
    escalation: "None — logged only",
    category: "BUSINESS"
  },
  {
    fault: "BeneficiaryBankUnavailable",
    code: "TECHNICAL FAULT",
    detectedBy: "Message Broker/ESB → Wait Credit",
    recovery: "Three ESB redeliveries with exponential backoff (30 s, 2 min, 8 min), then GetCreditStatus rather than re-sending the credit",
    escalation: "Credit Timeout → Mark Pending, Flag Exception; beneficiary bank operations notified",
    category: "TECHNICAL"
  },
  {
    fault: "PAPSSValidationTimeout",
    code: "TECHNICAL FAULT",
    detectedBy: "Workflow Management → Recheck Due",
    recovery: "One re-invoke after the Recheck Due timer",
    escalation: "Flag Exception → Open Case; originator bank receives status PDNG",
    category: "TECHNICAL"
  },
  {
    fault: "RTGSConfirmationFailure",
    code: "TECHNICAL FAULT",
    detectedBy: "Settlement Orchestration → Check RTGS",
    recovery: "Status re-query; instruction redelivered from the ESB message store",
    escalation: "Set Exception; cycle held open; central bank operations and both participants notified",
    category: "TECHNICAL"
  },
  {
    fault: "SettlementMismatch",
    code: "RECON BREAK",
    detectedBy: "Audit & Reconciliation → Cycle Matched?",
    recovery: "Automatic Reconcile pass against the clearing ledger",
    escalation: "Cycle Pending; case raised to the PAPSS settlement administrator and both central banks",
    category: "RECONCILIATION"
  }
];
