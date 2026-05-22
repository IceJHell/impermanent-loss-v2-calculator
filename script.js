const assets = {
  ethereum: {
    id: "ethereum",
    tab: "Эфир",
    name: "эфира",
    symbol: "ETH",
    pool: "ETH/USDC",
    defaultPrice: 2000,
  },
  bitcoin: {
    id: "bitcoin",
    tab: "Bitcoin",
    name: "биткоина",
    symbol: "BTC",
    pool: "BTC/USDC",
    defaultPrice: 100000,
  },
};

let activeAsset = assets.ethereum;
let futurePriceWasEdited = false;
let selectedMonths = 1;

const inputs = {
  totalLiquidity: document.querySelector("#totalLiquidity"),
  currentAssetPrice: document.querySelector("#currentAssetPrice"),
  futureAssetPrice: document.querySelector("#futureAssetPrice"),
  annualYieldPercent: document.querySelector("#annualYieldPercent"),
};

const outputs = {
  positionHint: document.querySelector("#positionHint"),
  splitHint: document.querySelector("#splitHint"),
  poolExplanation: document.querySelector("#poolExplanation"),
  priceStatus: document.querySelector("#priceStatus"),
  currentPriceTitle: document.querySelector("#currentPriceTitle"),
  currentPriceLabel: document.querySelector("#currentPriceLabel"),
  futureHint: document.querySelector("#futureHint"),
  futurePriceLabel: document.querySelector("#futurePriceLabel"),
  usdcAllocation: document.querySelector("#usdcAllocation"),
  assetAllocation: document.querySelector("#assetAllocation"),
  assetAllocationLabel: document.querySelector("#assetAllocationLabel"),
  assetAmountLabel: document.querySelector("#assetAmountLabel"),
  initialAssetAmount: document.querySelector("#initialAssetAmount"),
  periodFeePercent: document.querySelector("#periodFeePercent"),
  depositSummary: document.querySelector("#depositSummary"),
  holdSummary: document.querySelector("#holdSummary"),
  impermanentLoss: document.querySelector("#impermanentLoss"),
  holdImpermanentLoss: document.querySelector("#holdImpermanentLoss"),
  lpTokenA: document.querySelector("#lpTokenA"),
  lpTokenB: document.querySelector("#lpTokenB"),
  lpTokenBLabel: document.querySelector("#lpTokenBLabel"),
  lpValue: document.querySelector("#lpValue"),
  feeValue: document.querySelector("#feeValue"),
  lpValueWithFees: document.querySelector("#lpValueWithFees"),
  holdTokenA: document.querySelector("#holdTokenA"),
  holdTokenB: document.querySelector("#holdTokenB"),
  holdTokenBLabel: document.querySelector("#holdTokenBLabel"),
  holdValue: document.querySelector("#holdValue"),
  holdFeeValue: document.querySelector("#holdFeeValue"),
  holdValueWithFees: document.querySelector("#holdValueWithFees"),
  differenceValue: document.querySelector("#differenceValue"),
  resultSummary: document.querySelector("#resultSummary"),
  exampleIntro: document.querySelector("#exampleIntro"),
  exampleMove: document.querySelector("#exampleMove"),
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const tokenAmount = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 8,
});

function toPositiveNumber(input) {
  const value = Number(input.value.replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function formatPercent(value) {
  return `${Math.abs(value).toFixed(2)}%`;
}

function setTone(element, value) {
  element.classList.toggle("negative", value < 0);
  element.classList.toggle("positive", value > 0);
}

function priceUrl(asset) {
  return `https://api.coingecko.com/api/v3/simple/price?ids=${asset.id}&vs_currencies=usd&include_last_updated_at=true`;
}

function formatDate(timestamp) {
  return new Date(timestamp * 1000).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function updateAssetText() {
  const { symbol, pool, name } = activeAsset;

  outputs.positionHint.textContent = `Например, вы вносите $1000 в пул ${pool}.`;
  outputs.splitHint.textContent = `Половина остается в USDC, половина покупает ${symbol} по выбранной цене.`;
  outputs.poolExplanation.textContent =
    `Когда цена ${symbol} растет, пул V2 автоматически продает часть ${symbol} в USDC, чтобы сохранить баланс 50/50. Поэтому в LP-позиции становится меньше ${symbol} и больше USDC, чем было бы при обычном холде.`;
  outputs.currentPriceTitle.textContent = `Текущая цена ${symbol}`;
  outputs.currentPriceLabel.textContent = `${symbol} сейчас, $`;
  outputs.futureHint.textContent = `Для первого примера поставьте цену ${symbol} в 2 раза выше стартовой.`;
  outputs.futurePriceLabel.textContent = `${symbol} потом, $`;
  outputs.assetAllocationLabel.textContent = `Токен B (${symbol})`;
  outputs.assetAmountLabel.textContent = `Количество ${symbol} в позиции`;
  outputs.lpTokenBLabel.textContent = `Токен B (${symbol})`;
  outputs.holdTokenBLabel.textContent = `Токен B (${symbol})`;
  outputs.exampleIntro.textContent =
    `Если было $1000: $500 остается в USDC, а $500 переводится в ${symbol} по выбранной цене.`;
  outputs.exampleMove.textContent =
    `При росте ${name} в 2 раза HODL стоит $1500, а позиция LP V2 стоит $1414.21.`;
}

function calculate() {
  const totalLiquidity = toPositiveNumber(inputs.totalLiquidity);
  const currentAssetPrice = toPositiveNumber(inputs.currentAssetPrice);
  const futureAssetPrice = toPositiveNumber(inputs.futureAssetPrice);
  const annualYieldPercent = Math.max(
    0,
    Number(inputs.annualYieldPercent.value.replace(",", ".")) || 0
  );
  const feesPercent = annualYieldPercent * (selectedMonths / 12);

  if (!totalLiquidity || !currentAssetPrice || !futureAssetPrice) {
    return;
  }

  const usdcValue = totalLiquidity / 2;
  const assetValue = totalLiquidity / 2;
  const initialUsdcAmount = usdcValue;
  const initialAssetAmount = assetValue / currentAssetPrice;
  const product = initialUsdcAmount * initialAssetAmount;

  const lpUsdcAmount = Math.sqrt(product * futureAssetPrice);
  const lpAssetAmount = Math.sqrt(product / futureAssetPrice);
  const lpValue = lpUsdcAmount + lpAssetAmount * futureAssetPrice;
  const holdValue = initialUsdcAmount + initialAssetAmount * futureAssetPrice;
  const lossPercent = holdValue ? ((holdValue - lpValue) / holdValue) * 100 : 0;
  const feeValue = totalLiquidity * (feesPercent / 100);
  const lpValueWithFees = lpValue + feeValue;
  const differenceWithFees = lpValueWithFees - holdValue;

  outputs.usdcAllocation.textContent = currency.format(usdcValue);
  outputs.assetAllocation.textContent = currency.format(assetValue);
  outputs.initialAssetAmount.textContent = `${tokenAmount.format(initialAssetAmount)} ${activeAsset.symbol}`;
  outputs.periodFeePercent.textContent = `${feesPercent.toFixed(2)}%`;

  outputs.depositSummary.textContent =
    `Если ${currency.format(usdcValue)} в USDC и ${currency.format(assetValue)} в ${activeAsset.symbol} были предоставлены в качестве ликвидности`;
  outputs.holdSummary.textContent =
    `Если ${currency.format(usdcValue)} в USDC и ${currency.format(assetValue)} в ${activeAsset.symbol} просто холдить`;

  outputs.impermanentLoss.textContent = formatPercent(lossPercent);
  outputs.holdImpermanentLoss.textContent = "0.00%";
  outputs.lpTokenA.textContent = `${tokenAmount.format(lpUsdcAmount)} USDC = ${currency.format(lpUsdcAmount)}`;
  outputs.lpTokenB.textContent =
    `${tokenAmount.format(lpAssetAmount)} ${activeAsset.symbol} = ${currency.format(lpAssetAmount * futureAssetPrice)}`;
  outputs.lpValue.textContent = currency.format(lpValue);
  outputs.feeValue.textContent = currency.format(feeValue);
  outputs.lpValueWithFees.textContent = currency.format(lpValueWithFees);
  outputs.holdTokenA.textContent = `${tokenAmount.format(initialUsdcAmount)} USDC = ${currency.format(initialUsdcAmount)}`;
  outputs.holdTokenB.textContent =
    `${tokenAmount.format(initialAssetAmount)} ${activeAsset.symbol} = ${currency.format(initialAssetAmount * futureAssetPrice)}`;
  outputs.holdValue.textContent = currency.format(holdValue);
  outputs.holdFeeValue.textContent = currency.format(0);
  outputs.holdValueWithFees.textContent = currency.format(holdValue);
  outputs.differenceValue.textContent = currency.format(differenceWithFees);
  outputs.resultSummary.textContent =
    `При изменении цены ${activeAsset.symbol} с ${currency.format(currentAssetPrice)} до ${currency.format(futureAssetPrice)} LP-позиция стала бы ${currency.format(lpValue)}, а HODL — ${currency.format(holdValue)}. Разница: ${currency.format(lpValue - holdValue)} до учета комиссий и ${currency.format(differenceWithFees)} с учетом выбранных комиссий.`;

  setTone(outputs.differenceValue, differenceWithFees);
  setTone(outputs.lpValueWithFees, differenceWithFees);
}

async function loadAssetPrice() {
  const asset = activeAsset;
  outputs.priceStatus.textContent = `Пробую загрузить текущую цену ${asset.symbol}...`;

  try {
    const response = await fetch(priceUrl(asset), { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Price request failed");
    }

    const data = await response.json();
    const price = data?.[asset.id]?.usd;
    if (!price) {
      throw new Error("Asset price is missing");
    }

    if (asset !== activeAsset) {
      return;
    }

    const updatedAt = data[asset.id].last_updated_at
      ? formatDate(data[asset.id].last_updated_at)
      : "сейчас";

    outputs.priceStatus.textContent =
      `Подсказка: на ${updatedAt} цена ${asset.name} была ${currency.format(price)}. Первый расчет лучше начать с округленных цифр для более наглядного понимания.`;
  } catch (error) {
    outputs.priceStatus.textContent =
      `Не удалось загрузить цену ${asset.name}. Можно ввести текущую цену вручную.`;
  } finally {
    calculate();
  }
}

function selectAsset(assetId) {
  activeAsset = assets[assetId];
  futurePriceWasEdited = false;

  document.querySelectorAll(".asset-tab").forEach((tab) => {
    const isActive = tab.dataset.asset === assetId;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  inputs.currentAssetPrice.value = activeAsset.defaultPrice;
  inputs.futureAssetPrice.value = activeAsset.defaultPrice * 2;
  updateAssetText();
  calculate();
  loadAssetPrice();
}

document.querySelectorAll(".asset-tab").forEach((tab) => {
  tab.addEventListener("click", () => selectAsset(tab.dataset.asset));
});

inputs.futureAssetPrice.addEventListener("input", () => {
  futurePriceWasEdited = true;
  calculate();
});

[inputs.totalLiquidity, inputs.currentAssetPrice, inputs.annualYieldPercent].forEach((input) => {
  input.addEventListener("input", calculate);
});

document.querySelectorAll(".duration-button").forEach((button) => {
  button.addEventListener("click", () => {
    selectedMonths = Number(button.dataset.months);

    document.querySelectorAll(".duration-button").forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    calculate();
  });
});

updateAssetText();
calculate();
loadAssetPrice();
