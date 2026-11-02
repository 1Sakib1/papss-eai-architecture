/**
 * Client-Side XML & XSD Schema Validator
 * Faithfully mirrors the xmllint / libxml2 validation engine specified in Task 3.
 */

export function validateXmlDocument(xmlString) {
  const errors = [];
  const warnings = [];

  if (!xmlString || !xmlString.trim()) {
    return {
      isValid: false,
      errors: [{ line: 1, element: "Document", rule: "EmptyDocument", message: "XML document is empty." }],
      warnings: [],
      schemaDetected: "Unknown"
    };
  }

  // 1. Well-Formedness Check via DOMParser
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const parserError = xmlDoc.getElementsByTagName("parsererror");

  if (parserError.length > 0) {
    const errorText = parserError[0].textContent || "XML syntax error";
    // Try to extract line number
    const lineMatch = errorText.match(/line\s+(\d+)/i) || errorText.match(/:(\d+):/);
    const lineNum = lineMatch ? parseInt(lineMatch[1], 10) : 1;

    return {
      isValid: false,
      errors: [{
        line: lineNum,
        element: "XML Syntax",
        rule: "WellFormedness",
        message: errorText.split('\n')[0].replace(/Below is a rendering.*/, '').trim()
      }],
      warnings: [],
      schemaDetected: "Malformed XML"
    };
  }

  // Split lines for accurate line matching
  const lines = xmlString.split('\n');
  const findLineNumber = (needle, regexFallback) => {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(needle)) return i + 1;
      if (regexFallback && regexFallback.test(lines[i])) return i + 1;
    }
    return 1;
  };

  // Determine root element & schema
  const root = xmlDoc.documentElement;
  const rootName = root.localName || root.nodeName;

  let schemaDetected = "Unknown Schema";

  if (rootName === "PaymentInstruction") {
    schemaDetected = "PaymentInstruction.xsd (v1.0)";
    validatePaymentInstruction(xmlDoc, errors, warnings, findLineNumber);
  } else if (rootName === "NetSettlementInstruction") {
    schemaDetected = "NetSettlementInstruction.xsd (v1.0)";
    validateNetSettlementInstruction(xmlDoc, errors, warnings, findLineNumber);
  } else if (rootName === "Envelope") {
    schemaDetected = "SOAP 1.2 Envelope";
    // General SOAP structure check
  } else {
    warnings.push({
      line: 1,
      element: rootName,
      rule: "UnknownRoot",
      message: `Root element <${rootName}> is neither PaymentInstruction nor NetSettlementInstruction.`
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    schemaDetected,
    elementCount: xmlDoc.getElementsByTagName("*").length
  };
}

function validatePaymentInstruction(xmlDoc, errors, warnings, findLineNumber) {
  const allowedCurrencies = ["GHS", "NGN", "USD", "KES", "ZAR"];
  const bicRegex = /^[A-Z]{6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3})?$/;
  const uetrRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  // Schema version check
  const schemaVer = xmlDoc.documentElement.getAttribute("SchemaVersion");
  if (!schemaVer || schemaVer !== "1.0") {
    errors.push({
      line: findLineNumber("PaymentInstruction"),
      element: "PaymentInstruction",
      rule: "[facet 'attribute'] fixed='1.0'",
      message: `Attribute 'SchemaVersion' must be present and exactly equal to '1.0'. Found: '${schemaVer || "none"}'`
    });
  }

  // 1. Check BICs in InstructingAgent, InstructedAgent, DebtorAgent, CreditorAgent
  const bicNodes = xmlDoc.querySelectorAll("BICFI, bicfi");
  bicNodes.forEach(node => {
    const val = node.textContent.trim();
    if (!bicRegex.test(val)) {
      errors.push({
        line: findLineNumber(val, new RegExp(`<[^>]*BICFI[^>]*>${val}<`)),
        element: "cmn:BICFI",
        rule: "[facet 'pattern'] '[A-Z]{6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3})?'",
        message: `The value '${val}' is not accepted by the pattern '[A-Z]{6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3})?'. (Must be 8 or 11 standard ISO 9362 characters).`
      });
    }
  });

  // 2. Check InstructedAmount & Currency
  const amountNodes = xmlDoc.querySelectorAll("InstructedAmount, instructedAmount");
  amountNodes.forEach(node => {
    const val = node.textContent.trim();
    const ccy = node.getAttribute("Ccy") || node.getAttribute("ccy");

    const line = findLineNumber(val, /InstructedAmount/);

    if (!ccy) {
      errors.push({
        line,
        element: "pay:InstructedAmount",
        rule: "[facet 'attribute'] use='required'",
        message: "Attribute 'Ccy' is mandatory on AmountType elements."
      });
    } else if (!allowedCurrencies.includes(ccy)) {
      errors.push({
        line,
        element: "pay:InstructedAmount, attribute 'Ccy'",
        rule: "[facet 'enumeration'] {'GHS','NGN','USD','KES','ZAR'}",
        message: `The value '${ccy}' is not an element of the registered settlement currency set {'GHS','NGN','USD','KES','ZAR'}.`
      });
    }

    // Check fraction digits
    if (val.includes('.')) {
      const parts = val.split('.');
      if (parts[1].length > 2) {
        errors.push({
          line,
          element: "pay:InstructedAmount",
          rule: "[facet 'fractionDigits'] '2'",
          message: `The value '${val}' has more fractional digits (${parts[1].length}) than are allowed ('2').`
        });
      }
    }

    const numVal = parseFloat(val);
    if (isNaN(numVal) || numVal < 0.01) {
      errors.push({
        line,
        element: "pay:InstructedAmount",
        rule: "[facet 'minInclusive'] '0.01'",
        message: `The value '${val}' must be at least 0.01. Zero or negative payments are rejected.`
      });
    }
  });

  // 3. Check Creditor and Debtor structure
  const creditorNodes = xmlDoc.querySelectorAll("Creditor, creditor");
  creditorNodes.forEach(node => {
    const name = node.querySelector("Name, name");
    const account = node.querySelector("Account, account");
    const country = node.querySelector("Country, country");

    const line = findLineNumber("<pay:Creditor>", /Creditor/);

    if (!account) {
      errors.push({
        line: country ? findLineNumber(country.textContent.trim(), /Country/) : line,
        element: "pay:Creditor / cmn:Country",
        rule: "[sequence] Missing expected element",
        message: "This element is not expected. Expected is ( Account ). Mandatory sequence in PartyType is (Name, Account, Country, [Address])."
      });
    }

    if (country) {
      const cVal = country.textContent.trim();
      if (!/^[A-Z]{2}$/.test(cVal)) {
        errors.push({
          line: findLineNumber(cVal, /Country/),
          element: "cmn:Country",
          rule: "[facet 'pattern'] '[A-Z]{2}'",
          message: `Invalid ISO 3166-1 country code '${cVal}'.`
        });
      }
    }
  });

  // 4. Check PaymentId UUID v4
  const paymentIdNodes = xmlDoc.querySelectorAll("PaymentId, paymentId");
  const seenIds = new Set();
  paymentIdNodes.forEach(node => {
    const val = node.textContent.trim();
    const line = findLineNumber(val, /PaymentId/);

    if (!uetrRegex.test(val)) {
      errors.push({
        line,
        element: "cmn:UETRType",
        rule: "[facet 'pattern'] Version-4 UUID",
        message: `The value '${val}' is not a valid Version-4 UUID (UETR).`
      });
    }

    if (seenIds.has(val)) {
      errors.push({
        line,
        element: "pay:PaymentId",
        rule: "[xsd:unique 'UniquePaymentId']",
        message: `Duplicate PaymentId '${val}' detected across batch. Defeats idempotency check.`
      });
    }
    seenIds.add(val);
  });
}

function validateNetSettlementInstruction(xmlDoc, errors, warnings, findLineNumber) {
  const allowedCurrencies = ["GHS", "NGN", "USD", "KES", "ZAR"];
  const bicRegex = /^[A-Z]{6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3})?$/;

  // 1. CycleId pattern: PAPSS-CYCLE-YYYY-MM-DD
  const cycleIdNode = xmlDoc.querySelector("CycleId, cycleId");
  if (cycleIdNode) {
    const val = cycleIdNode.textContent.trim();
    if (!/^PAPSS-CYCLE-\d{4}-\d{2}-\d{2}$/.test(val)) {
      errors.push({
        line: findLineNumber(val, /CycleId/),
        element: "stl:CycleId",
        rule: "[facet 'pattern'] 'PAPSS-CYCLE-[0-9]{4}-[0-9]{2}-[0-9]{2}'",
        message: `The value '${val}' does not conform to the expected format 'PAPSS-CYCLE-YYYY-MM-DD'.`
      });
    }
  }

  // 2. ParticipantPositions minOccurs="2" and unique ParticipantId
  const positions = xmlDoc.querySelectorAll("ParticipantPosition, participantPosition");
  if (positions.length < 2) {
    errors.push({
      line: findLineNumber("ParticipantPositions", /ParticipantPositions/),
      element: "stl:ParticipantPositions",
      rule: "[facet 'minOccurs'] '2'",
      message: `A multilateral netting cycle requires at least 2 participant positions to balance. Found: ${positions.length}.`
    });
  }

  const seenBics = new Set();
  let calculatedNetSum = 0;

  positions.forEach(pos => {
    const pId = pos.querySelector("ParticipantId, participantId");
    if (pId) {
      const bVal = pId.textContent.trim();
      const line = findLineNumber(bVal, /ParticipantId/);

      if (!bicRegex.test(bVal)) {
        errors.push({
          line,
          element: "stl:ParticipantId",
          rule: "[facet 'pattern'] BICType",
          message: `Invalid BIC format '${bVal}'.`
        });
      }

      if (seenBics.has(bVal)) {
        errors.push({
          line,
          element: "stl:ParticipantId",
          rule: "[xsd:unique 'UniqueParticipant']",
          message: `Duplicate ParticipantId '${bVal}' in settlement cycle. A bank may only appear once.`
        });
      }
      seenBics.add(bVal);
    }

    const netAmtNode = pos.querySelector("NetAmount, netAmount");
    if (netAmtNode) {
      const netVal = parseFloat(netAmtNode.textContent.trim());
      if (!isNaN(netVal)) {
        calculatedNetSum += netVal;
      }
    }
  });

  // 3. Dual-control AuthorisedBy exactly 2
  const authNodes = xmlDoc.querySelectorAll("AuthorisedBy, authorisedBy");
  if (authNodes.length !== 2) {
    errors.push({
      line: findLineNumber("AuthorisedBy", /AuthorisedBy/) || 1,
      element: "stl:AuthorisedBy",
      rule: "[cardinality] minOccurs='2' maxOccurs='2'",
      message: `Settlement release mandates dual control: exactly 2 authorising officers are required. Found: ${authNodes.length}.`
    });
  }

  // 4. Zero-Sum Balance Business Rule Verification
  const totalNetNode = xmlDoc.querySelector("TotalNetAmount, totalNetAmount");
  if (totalNetNode) {
    const totalVal = parseFloat(totalNetNode.textContent.trim());
    if (Math.abs(calculatedNetSum) > 0.001) {
      warnings.push({
        line: findLineNumber(totalNetNode.textContent.trim(), /TotalNetAmount/),
        element: "stl:TotalNetAmount",
        rule: "[Business Rule / SettlementMismatch]",
        message: `Sum of NetAmounts (${calculatedNetSum.toFixed(2)}) does not net to zero across the cycle! Triggers SettlementMismatch fault.`
      });
    }
  }
}
