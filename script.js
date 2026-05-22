const assets = {
  ethereum: {
    id: "ethereum",
    tab: "Эфир",
    name: "эфира",
    symbol: "ETH",
    pool: "ETH/USDC",
    defaultPrice: 2000,
    defaultLower: 1500,
    defaultUpper: 3000,
  },
  bitcoin: {
    id: "bitcoin",
    tab: "Bitcoin",
    name: "биткоина",
    symbol: "BTC",
    pool: "BTC/USDC",
    defaultPrice: 100000,
    defaultLower: 75000,
    defaultUpper: 150000,
  },
};

let activeAsset = assets.ethereum;
let activeV3Asset = assets.ethereum;
let futurePriceWasEdited = false;
let selectedMonths = 1;

const inputs = {
  totalLiquidity: document.querySelector("#totalLiquidity"),
  currentAssetPrice: document.querySelector("#currentAssetPrice"),
  futureAssetPrice: document.querySelector("#futureAssetPrice"),
  annualYieldPercent: document.querySelector("#annualYieldPercent"),
  v3TotalLiquidity: document.querySelector("#v3TotalLiquidity"),
  v3CurrentPrice: document.querySelector("#v3CurrentPrice"),
  v3LowerPrice: document.querySelector("#v3LowerPrice"),
  v3UpperPrice: document.querySelector("#v3UpperPrice"),
  v3FuturePrice: document.querySelector("#v3FuturePrice"),
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
  v3PositionHint: document.querySelector("#v3PositionHint"),
  v3CurrentPriceLabel: document.querySelector("#v3CurrentPriceLabel"),
  v3FuturePriceLabel: document.querySelector("#v3FuturePriceLabel"),
  v3RangeStatus: document.querySelector("#v3RangeStatus"),
  v3DepositSummary: document.querySelector("#v3DepositSummary"),
  v3HoldSummary: document.querySelector("#v3HoldSummary"),
  v3ImpermanentLoss: document.querySelector("#v3ImpermanentLoss"),
  v3LpUsdc: document.querySelector("#v3LpUsdc"),
  v3LpAssetLabel: document.querySelector("#v3LpAssetLabel"),
  v3LpAsset: document.querySelector("#v3LpAsset"),
  v3LpValue: document.querySelector("#v3LpValue"),
  v3HoldUsdc: document.querySelector("#v3HoldUsdc"),
  v3HoldAssetLabel: document.querySelector("#v3HoldAssetLabel"),
  v3HoldAsset: document.querySelector("#v3HoldAsset"),
  v3HoldValue: document.querySelector("#v3HoldValue"),
  v3DifferenceValue: document.querySelector("#v3DifferenceValue"),
  v3ResultSummary: document.querySelector("#v3ResultSummary"),
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

function assetValueLine(amount, symbol, price) {
  return `${tokenAmount.format(amount)} ${symbol} = ${currency.format(amount * price)}`;
}

function usdcValueLine(amount) {
  return `${tokenAmount.format(amount)} USDC = ${currency.format(amount)}`;
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

function getV3Amounts(liquidity, price, lowerPrice, upperPrice) {
  const sqrtPrice = Math.sqrt(price);
  const sqrtLower = Math.sqrt(lowerPrice);
  const sqrtUpper = Math.sqrt(upperPrice);

  if (price <= lowerPrice) {
    return {
      usdc: 0,
      asset: liquidity * ((sqrtUpper - sqrtLower) / (sqrtLower * sqrtUpper)),
      status: "Ниже диапазона",
    };
  }

  if (price >= upperPrice) {
    return {
      usdc: liquidity * (sqrtUpper - sqrtLower),
      asset: 0,
      status: "Выше диапазона",
    };
  }

  return {
    usdc: liquidity * (sqrtPrice - sqrtLower),
    asset: liquidity * ((sqrtUpper - sqrtPrice) / (sqrtPrice * sqrtUpper)),
    status: "Внутри диапазона",
  };
}

function calculateV3() {
  const totalLiquidity = toPositiveNumber(inputs.v3TotalLiquidity);
  const currentPrice = toPositiveNumber(inputs.v3CurrentPrice);
  const lowerPrice = toPositiveNumber(inputs.v3LowerPrice);
  const upperPrice = toPositiveNumber(inputs.v3UpperPrice);
  const futurePrice = toPositiveNumber(inputs.v3FuturePrice);

  if (!totalLiquidity || !currentPrice || !lowerPrice || !upperPrice || !futurePrice) {
    return;
  }

  if (lowerPrice >= upperPrice) {
    outputs.v3RangeStatus.textContent = "Проверьте диапазон";
    outputs.v3ResultSummary.textContent = "Нижняя граница должна быть меньше верхней.";
    return;
  }

  const unitStart = getV3Amounts(1, currentPrice, lowerPrice, upperPrice);
  const unitValue = unitStart.usdc + unitStart.asset * currentPrice;

  if (!unitValue) {
    outputs.v3RangeStatus.textContent = "Цена вне диапазона";
    outputs.v3ResultSummary.textContent =
      "Для первого расчета поставьте стартовую цену внутри выбранного диапазона.";
    return;
  }

  const liquidity = totalLiquidity / unitValue;
  const start = getV3Amounts(liquidity, currentPrice, lowerPrice, upperPrice);
  const future = getV3Amounts(liquidity, futurePrice, lowerPrice, upperPrice);
  const lpValue = future.usdc + future.asset * futurePrice;
  const holdValue = start.usdc + start.asset * futurePrice;
  const difference = lpValue - holdValue;
  const lossPercent = holdValue ? ((holdValue - lpValue) / holdValue) * 100 : 0;

  outputs.v3RangeStatus.textContent = future.status;
  outputs.v3DepositSummary.textContent =
    `Стартовая V3/V4 позиция: ${usdcValueLine(start.usdc)} и ${assetValueLine(start.asset, activeV3Asset.symbol, currentPrice)}`;
  outputs.v3HoldSummary.textContent =
    `Если эти же активы просто холдить после входа в диапазон.`;
  outputs.v3ImpermanentLoss.textContent = formatPercent(lossPercent);
  outputs.v3LpUsdc.textContent = usdcValueLine(future.usdc);
  outputs.v3LpAsset.textContent = assetValueLine(future.asset, activeV3Asset.symbol, futurePrice);
  outputs.v3LpValue.textContent = currency.format(lpValue);
  outputs.v3HoldUsdc.textContent = usdcValueLine(start.usdc);
  outputs.v3HoldAsset.textContent = assetValueLine(start.asset, activeV3Asset.symbol, futurePrice);
  outputs.v3HoldValue.textContent = currency.format(holdValue);
  outputs.v3DifferenceValue.textContent = currency.format(difference);
  outputs.v3ResultSummary.textContent =
    `При изменении цены ${activeV3Asset.symbol} с ${currency.format(currentPrice)} до ${currency.format(futurePrice)} концентрированная позиция стала бы ${currency.format(lpValue)}, а HODL стартовых активов — ${currency.format(holdValue)}. Разница: ${currency.format(difference)}.`;

  setTone(outputs.v3DifferenceValue, difference);
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

function selectProtocol(protocol) {
  const isV3 = protocol === "v3";

  document.querySelectorAll(".protocol-tab").forEach((tab) => {
    const isActive = tab.dataset.protocol === protocol;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  document.querySelectorAll(".v2-view").forEach((element) => {
    element.classList.toggle("hidden", isV3);
  });

  document.querySelectorAll(".v3-view").forEach((element) => {
    element.classList.toggle("hidden", !isV3);
  });

  if (isV3) {
    calculateV3();
  }
}

function updateV3AssetText() {
  const { symbol, pool } = activeV3Asset;
  outputs.v3PositionHint.textContent = `Например, вы вносите $1000 в позицию ${pool} V3/V4.`;
  outputs.v3CurrentPriceLabel.textContent = `${symbol} сейчас, $`;
  outputs.v3FuturePriceLabel.textContent = `${symbol} потом, $`;
  outputs.v3LpAssetLabel.textContent = `Токен B (${symbol})`;
  outputs.v3HoldAssetLabel.textContent = `Токен B (${symbol})`;
}

function selectV3Asset(assetId) {
  activeV3Asset = assets[assetId];

  document.querySelectorAll(".v3-asset-tab").forEach((tab) => {
    const isActive = tab.dataset.asset === assetId;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  inputs.v3CurrentPrice.value = activeV3Asset.defaultPrice;
  inputs.v3LowerPrice.value = activeV3Asset.defaultLower;
  inputs.v3UpperPrice.value = activeV3Asset.defaultUpper;
  inputs.v3FuturePrice.value = activeV3Asset.defaultPrice * 2;
  updateV3AssetText();
  calculateV3();
}

document.querySelectorAll(".asset-tab").forEach((tab) => {
  tab.addEventListener("click", () => selectAsset(tab.dataset.asset));
});

document.querySelectorAll(".protocol-tab").forEach((tab) => {
  tab.addEventListener("click", () => selectProtocol(tab.dataset.protocol));
});

document.querySelectorAll(".v3-asset-tab").forEach((tab) => {
  tab.addEventListener("click", () => selectV3Asset(tab.dataset.asset));
});

inputs.futureAssetPrice.addEventListener("input", () => {
  futurePriceWasEdited = true;
  calculate();
});

[inputs.totalLiquidity, inputs.currentAssetPrice, inputs.annualYieldPercent].forEach((input) => {
  input.addEventListener("input", calculate);
});

[
  inputs.v3TotalLiquidity,
  inputs.v3CurrentPrice,
  inputs.v3LowerPrice,
  inputs.v3UpperPrice,
  inputs.v3FuturePrice,
].forEach((input) => {
  input.addEventListener("input", calculateV3);
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
updateV3AssetText();
calculate();
calculateV3();
loadAssetPrice();
