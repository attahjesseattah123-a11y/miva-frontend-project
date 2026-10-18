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
  return code === null ||
    code === undefined ||
    (typeof code === "string" && code.trim() === "")
    ? "Not referred"
    : code;
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
      referralStatus.textContent =
        "You were referred by: " + savedReferralCode + ".";
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

      referralStatus.textContent =
        "You were referred by: " + referralCode + ".";

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

if (referralFromURL !== null) {
  referralStatus.textContent = "You were referred by: " + referralFromURL + ".";

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

  const hasReferralCode =
    typeof referralFromURL === "string" && referralFromURL.trim() !== "";
  const commission = hasReferralCode ? amountReceived * 0.1 : 0;

  const customerRecord = {
    customerName: customerName,
    referrerCode: referralFromURL,
    amountReceived: amountReceived,
    commission: commission,
  };

  const existingCustomers =
    JSON.parse(localStorage.getItem("customerRecords")) || [];

  existingCustomers.push(customerRecord);

  localStorage.setItem("customerRecords", JSON.stringify(existingCustomers));

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
  const customers = JSON.parse(localStorage.getItem("customerRecords")) || [];

  referralHistory.innerHTML = "";
  totalCustomers.textContent = customers.length;

  let salesTotal = 0;

  customers.forEach(function (customer) {
    salesTotal += customer.amountReceived;
  });

  totalSales.textContent = salesTotal.toLocaleString();

  let commissionTotal = 0;

  customers.forEach(function (customer) {
    commissionTotal += customer.commission;
  });

  totalCommission.textContent = commissionTotal.toLocaleString();

  customers.forEach(function (customer) {
    const record = document.createElement("p");

    record.textContent =
      "Customer: " +
      customer.customerName +
      " | Referred by: " +
      formatReferrerCode(customer.referrerCode) +
      " | Amount: ₦" +
      customer.amountReceived.toLocaleString() +
      " | Commission: ₦" +
      customer.commission.toLocaleString();

    referralHistory.appendChild(record);
  });
}

displayReferralHistory();

clearHistoryButton.addEventListener("click", function () {
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
  const customers = JSON.parse(localStorage.getItem("customerRecords")) || [];

  referrerSummary.innerHTML = "";

  const referrers = {};

  customers.forEach(function (customer) {
    const code = formatReferrerCode(customer.referrerCode);

    if (!referrers[code]) {
      referrers[code] = {
        customers: 0,
        sales: 0,
        commission: 0,
      };
    }

    referrers[code].customers += 1;
    referrers[code].sales += customer.amountReceived;
    referrers[code].commission += customer.commission;
  });

  Object.keys(referrers).forEach(function (code) {
    const record = document.createElement("p");

    record.textContent =
      code +
      " | Customers: " +
      referrers[code].customers +
      " | Sales: ₦" +
      referrers[code].sales.toLocaleString() +
      " | Commission: ₦" +
      referrers[code].commission.toLocaleString();

    referrerSummary.appendChild(record);
  });
}

displayReferrerSummary();
function displayMyReferralDashboard() {
  const customers = JSON.parse(localStorage.getItem("customerRecords")) || [];

  const myCode = referralFromURL;

  if (!myCode) {
    const dashboardValues = [
      ["Referral Code", "—"],
      ["Customers Referred", "0"],
      ["Total Sales", "₦0"],
      ["Total Commission", "₦0"],
    ];

    myReferralDashboard.replaceChildren();
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

    return;
  }

  const myCustomers = customers.filter(function (customer) {
    return customer.referrerCode === myCode;
  });

  let mySales = 0;
  let myCommission = 0;

  myCustomers.forEach(function (customer) {
    mySales += customer.amountReceived;
    myCommission += customer.commission;
  });
  const dashboardValues = [
    ["Referral Code", myCode],
    ["Customers Referred", String(myCustomers.length)],
    ["Total Sales", "₦" + mySales.toLocaleString()],
    ["Total Commission", "₦" + myCommission.toLocaleString()],
  ];

  myReferralDashboard.replaceChildren();
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

  return;
}

displayMyReferralDashboard();

result.addEventListener("click", function (event) {
  if (event.target.id === "copyReferralLink") {
    const link = event.target.dataset.link;

    navigator.clipboard.writeText(link);

    event.target.textContent = "Copied!";

    setTimeout(function () {
      event.target.textContent = "Copy Link";
    }, 2000);
  }
});
