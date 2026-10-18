const button = document.getElementById("generateLink");
const nameInput = document.getElementById("referrerName");
const result = document.getElementById("result");
const referralStatus = document.getElementById("referralStatus");
const serviceButton = document.getElementById("serviceButton");

const customerNameInput = document.getElementById("customerName");
const saveCustomerButton = document.getElementById("saveCustomer");
const customerResult = document.getElementById("customerResult");
const amountReceivedInput = document.getElementById("amountReceived");
const referralHistory = document.getElementById("referralHistory");
const totalCustomers = document.getElementById("totalCustomers");
const totalSales = document.getElementById("totalSales");
const totalCommission = document.getElementById("totalCommission");
const clearHistoryButton = document.getElementById("clearHistory");
const referrerSummary = document.getElementById("referrerSummary");
const myReferralDashboard = document.getElementById("myReferralDashboard");

const urlParams = new URLSearchParams(window.location.search);

let referralFromURL = urlParams.get("ref");

function formatReferrerCode(code) {
  if (
    code === null ||
    code === undefined ||
    (typeof code === "string" && code.trim() === "")
  ) {
    return "Not referred";
  }

  return typeof code === "string" ? code : "Unavailable";
}

function hasNonBlankReferralCode(code) {
  return typeof code === "string" && code.trim() !== "";
}

function isRecordObject(record) {
  return record !== null && typeof record === "object" && !Array.isArray(record);
}

function isValidStoredMoney(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function formatStoredMoney(value) {
  return isValidStoredMoney(value) ? value.toLocaleString() : "Unavailable";
}

function loadCustomerRecords() {
  try {
    const storedRecords = localStorage.getItem("customerRecords");

    if (storedRecords === null) {
      return { records: [], error: null };
    }

    const records = JSON.parse(storedRecords);

    if (!Array.isArray(records)) {
      return {
        records: [],
        error:
          "Saved referral records are not in the expected list format. No records were changed.",
      };
    }

    return { records: records, error: null };
  } catch (error) {
    return {
      records: [],
      error:
        "Saved referral records could not be loaded safely. No records were changed.",
    };
  }
}

function inspectCustomerRecords(records) {
  const issues = {
    invalidEntries: 0,
    missingNames: 0,
    invalidReferralCodes: 0,
    invalidAmounts: 0,
    invalidCommissions: 0,
  };

  records.forEach(function (record) {
    if (!isRecordObject(record)) {
      issues.invalidEntries += 1;
      return;
    }

    if (
      typeof record.customerName !== "string" ||
      record.customerName.trim() === ""
    ) {
      issues.missingNames += 1;
    }

    if (
      record.referrerCode !== null &&
      record.referrerCode !== undefined &&
      typeof record.referrerCode !== "string"
    ) {
      issues.invalidReferralCodes += 1;
    }

    if (!isValidStoredMoney(record.amountReceived)) {
      issues.invalidAmounts += 1;
    }

    if (!isValidStoredMoney(record.commission)) {
      issues.invalidCommissions += 1;
    }
  });

  return issues;
}

function hasCustomerRecordIssues(issues) {
  return Object.values(issues).some(function (count) {
    return count > 0;
  });
}

function getCustomerRecordNotice(state) {
  if (state.error) {
    return state.error;
  }

  const issues = inspectCustomerRecords(state.records);
  const messages = [];

  if (issues.invalidEntries > 0) {
    messages.push(
      issues.invalidEntries +
        (issues.invalidEntries === 1
          ? " malformed record entry could not be included in summaries."
          : " malformed record entries could not be included in summaries."),
    );
  }

  if (issues.missingNames > 0) {
    messages.push(
      issues.missingNames +
        " record(s) have no usable customer name; they are shown as Unknown customer.",
    );
  }

  if (issues.invalidReferralCodes > 0) {
    messages.push(
      issues.invalidReferralCodes +
        " record(s) have an invalid referral code; it is shown as Unavailable.",
    );
  }

  const invalidMoneyValues =
    issues.invalidAmounts + issues.invalidCommissions;

  if (invalidMoneyValues > 0) {
    messages.push(
      invalidMoneyValues +
        ' missing or invalid amount/commission value(s) are shown as "Unavailable" and excluded from totals.',
    );
  }

  return messages.join(" ");
}

function appendCustomerRecordNotice(container, state) {
  const notice = getCustomerRecordNotice(state);

  if (notice !== "") {
    const message = document.createElement("p");
    message.className = "data-integrity-notice";
    message.textContent = notice;
    container.appendChild(message);
  }
}

function getCustomerNameForDisplay(record) {
  return typeof record.customerName === "string" &&
    record.customerName.trim() !== ""
    ? record.customerName
    : "Unknown customer";
}

button.addEventListener("click", function () {
  const name = nameInput.value.trim();

  if (name === "") {
    result.textContent = "Please enter your name.";
  } else {
    const upperName = name.toUpperCase();
    const randomNumber = Math.floor(Math.random() * 100);
    const referralCode = upperName + randomNumber;

    const referralUrl = new URL("referrals.html", window.location.href);
    referralUrl.searchParams.set("ref", referralCode);
    const referralLink = referralUrl.toString();

    const savedReferralCode = localStorage.getItem("referralCode_" + upperName);

    localStorage.setItem(
      "currentReferralCode",
      savedReferralCode !== null ? savedReferralCode : referralCode,
    );

    if (savedReferralCode !== null) {
      const savedReferralUrl = new URL("referrals.html", window.location.href);
      savedReferralUrl.searchParams.set("ref", savedReferralCode);
      const savedReferralLink = savedReferralUrl.toString();

      const linkText = document.createTextNode("Your referral link is ");
      const referralAnchor = document.createElement("a");
      referralAnchor.href = savedReferralLink;
      referralAnchor.textContent = savedReferralLink;

      const copyButton = document.createElement("button");
      copyButton.id = "copyReferralLink";
      copyButton.dataset.link = savedReferralLink;
      copyButton.textContent = "Copy Link";

      result.replaceChildren(
        linkText,
        referralAnchor,
        document.createElement("br"),
        copyButton,
      );
    } else {
      localStorage.setItem("referralCode_" + upperName, referralCode);

      const linkText = document.createTextNode("Your referral link is ");
      const referralAnchor = document.createElement("a");
      referralAnchor.href = referralLink;
      referralAnchor.textContent = referralLink;

      const copyButton = document.createElement("button");
      copyButton.id = "copyReferralLink";
      copyButton.dataset.link = referralLink;
      copyButton.textContent = "Copy Link";

      result.replaceChildren(
        linkText,
        referralAnchor,
        document.createElement("br"),
        copyButton,
      );
    }
  }
});

console.log("Referral from URL:", referralFromURL);

if (hasNonBlankReferralCode(referralFromURL)) {
  referralStatus.textContent =
    "Referral code used to open this page: " +
    referralFromURL +
    ". This code has not been verified.";
} else {
  referralStatus.textContent =
    "No referral code was provided. This visit is not attributed to a referrer.";
}

if (referralFromURL !== null) {
  localStorage.setItem("customerReferrer", referralFromURL);
}

console.log(localStorage.getItem("customerReferrer"));

serviceButton.addEventListener("click", function () {
  window.location.href = "https://payhip.com/JessePhoneServices";
});

saveCustomerButton.addEventListener("click", function () {
  const customerName = customerNameInput.value.trim();

  const amountReceived = Number(amountReceivedInput.value);

  if (customerName === "") {
    customerResult.textContent = "Please enter the customer's name.";

    return;
  }

  if (!Number.isFinite(amountReceived) || amountReceived <= 0) {
    customerResult.textContent = "Please enter an amount greater than ₦0.";

    return;
  }

  const storedData = loadCustomerRecords();

  if (storedData.error) {
    customerResult.textContent = storedData.error;
    return;
  }

  const existingIssues = inspectCustomerRecords(storedData.records);

  if (hasCustomerRecordIssues(existingIssues)) {
    customerResult.textContent =
      "Some saved records have incomplete or invalid fields. No new record was saved, so the existing data was not rewritten.";
    return;
  }

  const hasReferralCode = hasNonBlankReferralCode(referralFromURL);
  const commission = hasReferralCode ? amountReceived * 0.1 : 0;

  const customerRecord = {
    customerName: customerName,
    referrerCode: referralFromURL,
    amountReceived: amountReceived,
    commission: commission,
  };

  const existingCustomers = storedData.records;
  existingCustomers.push(customerRecord);

  try {
    localStorage.setItem("customerRecords", JSON.stringify(existingCustomers));
  } catch (error) {
    customerResult.textContent =
      "The customer record could not be saved in this browser. Please try again later.";
    return;
  }

  customerResult.textContent =
    "Customer: " +
    customerName +
    " | Referred by: " +
    formatReferrerCode(referralFromURL) +
    " | Amount Received: ₦" +
    amountReceived.toLocaleString() +
    " | Commission: ₦" +
    commission.toLocaleString();
  displayReferralHistory();
  displayReferrerSummary();
  displayMyReferralDashboard();
});
function displayReferralHistory() {
  const storedData = loadCustomerRecords();

  referralHistory.innerHTML = "";
  if (storedData.error) {
    totalCustomers.textContent = "Unavailable";
    totalSales.textContent = "Unavailable";
    totalCommission.textContent = "Unavailable";
    appendCustomerRecordNotice(referralHistory, storedData);
    return;
  }

  const customers = storedData.records;
  let customerCount = 0;

  let salesTotal = 0;
  let commissionTotal = 0;

  customers.forEach(function (customer) {
    const record = document.createElement("p");

    if (!isRecordObject(customer)) {
      record.textContent =
        "Customer: Unavailable | Referred by: Unavailable | Amount: ₦Unavailable | Commission: ₦Unavailable";
      referralHistory.appendChild(record);
      return;
    }

    customerCount += 1;

    if (isValidStoredMoney(customer.amountReceived)) {
      salesTotal += customer.amountReceived;
    }

    if (isValidStoredMoney(customer.commission)) {
      commissionTotal += customer.commission;
    }

    record.textContent =
      "Customer: " +
      getCustomerNameForDisplay(customer) +
      " | Referred by: " +
      formatReferrerCode(customer.referrerCode) +
      " | Amount: ₦" +
      formatStoredMoney(customer.amountReceived) +
      " | Commission: ₦" +
      formatStoredMoney(customer.commission);

    referralHistory.appendChild(record);
  });

  totalCustomers.textContent = String(customerCount);
  totalSales.textContent = salesTotal.toLocaleString();
  totalCommission.textContent = commissionTotal.toLocaleString();
  appendCustomerRecordNotice(referralHistory, storedData);
}

displayReferralHistory();

clearHistoryButton.addEventListener("click", function () {
  const storedData = loadCustomerRecords();

  if (storedData.error) {
    customerResult.textContent =
      "Saved referral data could not be read safely, so it was not deleted.";
    return;
  }

  const confirmClear = confirm(
    "Are you sure you want to delete all referral records?",
  );

  if (confirmClear) {
    localStorage.removeItem("customerRecords");

    displayReferralHistory();
    displayReferrerSummary();
    displayMyReferralDashboard();
  }
});

function displayReferrerSummary() {
  const storedData = loadCustomerRecords();

  referrerSummary.innerHTML = "";

  if (storedData.error) {
    appendCustomerRecordNotice(referrerSummary, storedData);
    return;
  }

  const referrers = new Map();

  storedData.records.forEach(function (customer) {
    if (!isRecordObject(customer)) {
      return;
    }

    const code = formatReferrerCode(customer.referrerCode);
    let summary = referrers.get(code);

    if (!summary) {
      summary = {
        customers: 0,
        sales: 0,
        commission: 0,
      };
      referrers.set(code, summary);
    }

    summary.customers += 1;

    if (isValidStoredMoney(customer.amountReceived)) {
      summary.sales += customer.amountReceived;
    }

    if (isValidStoredMoney(customer.commission)) {
      summary.commission += customer.commission;
    }
  });

  referrers.forEach(function (summary, code) {
    const record = document.createElement("p");

    record.textContent =
      code +
      " | Customers: " +
      summary.customers +
      " | Sales: ₦" +
      summary.sales.toLocaleString() +
      " | Commission: ₦" +
      summary.commission.toLocaleString();

    referrerSummary.appendChild(record);
  });

  appendCustomerRecordNotice(referrerSummary, storedData);
}

displayReferrerSummary();
function displayMyReferralDashboard() {
  const storedData = loadCustomerRecords();

  myReferralDashboard.replaceChildren();

  if (storedData.error) {
    appendCustomerRecordNotice(myReferralDashboard, storedData);
    return;
  }

  const myCode = referralFromURL;
  const hasMyCode = hasNonBlankReferralCode(myCode);

  if (!hasMyCode) {
    const dashboardValues = [
      ["Referral Code", "Not referred"],
      ["Customers Referred", "0"],
      ["Total Sales", "₦0"],
      ["Total Commission", "₦0"],
    ];

    dashboardValues.forEach(function ([label, value]) {
      const card = document.createElement("div");
      card.className = "dashboard-card";

      const cardLabel = document.createElement("p");
      cardLabel.textContent = label;

      const cardValue = document.createElement("strong");
      cardValue.textContent = value;

      card.append(cardLabel, cardValue);
      myReferralDashboard.appendChild(card);
    });

    appendCustomerRecordNotice(myReferralDashboard, storedData);
    return;
  }

  const myCustomers = storedData.records.filter(function (customer) {
    return isRecordObject(customer) && customer.referrerCode === myCode;
  });

  let mySales = 0;
  let myCommission = 0;

  myCustomers.forEach(function (customer) {
    if (isValidStoredMoney(customer.amountReceived)) {
      mySales += customer.amountReceived;
    }

    if (isValidStoredMoney(customer.commission)) {
      myCommission += customer.commission;
    }
  });
  const dashboardValues = [
    ["Referral Code", myCode],
    ["Customers Referred", String(myCustomers.length)],
    ["Total Sales", "₦" + mySales.toLocaleString()],
    ["Total Commission", "₦" + myCommission.toLocaleString()],
  ];

  dashboardValues.forEach(function ([label, value]) {
    const card = document.createElement("div");
    card.className = "dashboard-card";

    const cardLabel = document.createElement("p");
    cardLabel.textContent = label;

    const cardValue = document.createElement("strong");
    cardValue.textContent = value;

    card.append(cardLabel, cardValue);
    myReferralDashboard.appendChild(card);
  });

  appendCustomerRecordNotice(myReferralDashboard, storedData);

  return;
}

displayMyReferralDashboard();

result.addEventListener("click", async function (event) {
  if (event.target.id === "copyReferralLink") {
    const link = event.target.dataset.link;
    const copyButton = event.target;

    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        throw new Error("Clipboard access is unavailable.");
      }

      await navigator.clipboard.writeText(link);
      copyButton.textContent = "Copied!";
    } catch (error) {
      copyButton.textContent =
        "Could not copy. Select the link above and copy it manually.";
    }

    setTimeout(function () {
      copyButton.textContent = "Copy Link";
    }, 3000);
  }
});
