export const MAPPINGS = [
  {
    sourceField: "TXN_REF",
    sourceType: "char(16)",
    sourceDesc: "Ecobank proprietary core transaction reference generated at branch or mobile terminal",
    isoElement: "CdtTrfTxInf / PmtId / EndToEndId",
    wsField: "paymentId / endToEndId",
    rule: "Adapter generates UUID v4 UETR as canonical paymentId and stores the pairing with TXN_REF in the local bank database, so the bank can still trace by its internal reference.",
    targetField: "ORIG_TXN_REF",
    targetType: "varchar(35)",
    targetDesc: "Alt Bank incoming reference journal table"
  },
  {
    sourceField: "SND_BRANCH + SND_ACCT",
    sourceType: "char(4) + char(10)",
    sourceDesc: "Ecobank branch code (e.g. 0124) concatenated with 10-digit customer account",
    isoElement: "Dbtr / Acct / Id / Othr / Id",
    wsField: "originatorAccount",
    rule: "Concatenate branch and account number; left-pad with zeros to 14 digits standard format (e.g. 0124558877001).",
    targetField: "SENDER_ACCT",
    targetType: "varchar(34)",
    targetDesc: "Stored in Alt Bank ledger remittance note"
  },
  {
    sourceField: "SND_NAME",
    sourceType: "char(35)",
    sourceDesc: "Ecobank ordering party customer name",
    isoElement: "Dbtr / Nm",
    wsField: "originatorName",
    rule: "Pad or truncate to the 140-character ISO 20022 limit; strip non-Latin characters and invalid punctuation.",
    targetField: "ORDERING_CUSTOMER",
    targetType: "varchar(140)",
    targetDesc: "Screened against Alt Bank AML watchlists"
  },
  {
    sourceField: "BEN_BANK",
    sourceType: "char(6)",
    sourceDesc: "Nigerian local clearing sort code (e.g. 035123)",
    isoElement: "CdtrAgt / FinInstnId / BICFI",
    wsField: "beneficiaryBankId",
    rule: "Look up the local sort code in the PAPSS participant BIC register (maps 035123 → ALTBNGLA). Fails mapping if BIC is unassigned.",
    targetField: "RECEIVER_BIC",
    targetType: "char(11)",
    targetDesc: "Alt Bank internal router identity"
  },
  {
    sourceField: "AMT + CCY",
    sourceType: "packed decimal + char(3)",
    sourceDesc: "Raw currency amount e.g. 250000.00 and currency code 'GHS'",
    isoElement: "IntrBkSttlmAmt [@Ccy]",
    wsField: "instructedAmount",
    rule: "Convert to decimal(18,2); validate currency is in registered PAPSS settlement currency list (GHS, NGN, USD, KES, ZAR).",
    targetField: "CREDIT_AMT + CREDIT_CCY",
    targetType: "decimal(18,2) + char(3)",
    targetDesc: "Calculated in NGN via guaranteed PAPSS FX rate (24.871500) = 6,217,875.00 NGN"
  },
  {
    sourceField: "VAL_DT",
    sourceType: "char(8) YYYYMMDD",
    sourceDesc: "Ecobank core system posting value date",
    isoElement: "IntrBkSttlmDt",
    wsField: "requestedExecutionDate",
    rule: "Reformat string YYYYMMDD to ISO xsd:date format (YYYY-MM-DD). Resolves date ambiguities between Ghana and Nigeria.",
    targetField: "POST_DATE",
    targetType: "date",
    targetDesc: "Alt Bank general ledger effective posting date"
  },
  {
    sourceField: "PURP",
    sourceType: "char(2)",
    sourceDesc: "Internal 2-letter classification code (e.g. 'GD')",
    isoElement: "Purp / Cd",
    wsField: "purposeCode",
    rule: "Lookup table to ExternalPurpose1Code: GD → GDDS (Goods trade), SV → SERV (Services), SA → SALS (Salary).",
    targetField: "CBN_PURPOSE_CAT",
    targetType: "varchar(10)",
    targetDesc: "Central Bank of Nigeria statutory reporting tag"
  },
  {
    sourceField: "CHG_IND",
    sourceType: "char(1)",
    sourceDesc: "Charge bearer indicator: 'D' (Debtor), 'C' (Creditor), 'S' (Shared)",
    isoElement: "ChrgBr",
    wsField: "chargeBearer",
    rule: "Map D → DEBT, C → CRED, S → SHAR according to ISO 20022 ChargeBearerType enumeration.",
    targetField: "FEE_ALLOCATION",
    targetType: "varchar(4)",
    targetDesc: "Controls fee deduction from credit amount"
  }
];

export const CANONICAL_COMPARISON = {
  title: "The Canonical Data Model Advantage: O(N) vs O(N²)",
  description: "Connecting financial institutions point-to-point requires pairwise translators. Routing messages through a central EAI Hub using a Canonical ISO 20022 Model requires only one adapter per institution.",
  formulaPointToPoint: "N × (N - 1)",
  formulaCanonical: "N",
  exampleData: [
    { participants: 2, pointToPoint: 2, canonical: 2, savings: "0%" },
    { participants: 4, pointToPoint: 12, canonical: 4, savings: "66.7%" },
    { participants: 6, pointToPoint: 30, canonical: 6, savings: "80.0%" },
    { participants: 10, pointToPoint: 90, canonical: 10, savings: "88.9%" },
    { participants: 25, pointToPoint: 600, canonical: 25, savings: "95.8%" },
    { participants: 54, pointToPoint: 2862, canonical: 54, savings: "98.1%" }
  ]
};
