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
    uniswapPools: {
      "0.05": "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
      "0.3": "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8",
    },
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
    uniswapPools: {},
  },
};

let activeAsset = assets.ethereum;
let activeV3Asset = assets.ethereum;
let selectedMonths = 1;
let selectedV3FeeTier = 0.05;
let selectedHistoryDays = 30;
let v3HistoryPrices = [];

const $ = (selector) => document.querySelector(selector);

const inputs = {
  totalLiquidity: $("#totalLiquidity"),
  currentAssetPrice: $("#currentAssetPrice"),
  futureAssetPrice: $("#futureAssetPrice"),
  annualYieldPercent: $("#annualYieldPercent"),
  v3TotalLiquidity: $("#v3TotalLiquidity"),
  v3CurrentPrice: $("#v3CurrentPrice"),
  v3LowerPrice: $("#v3LowerPrice"),
  v3UpperPrice: $("#v3UpperPrice"),
  v3FuturePrice: $("#v3FuturePrice"),
  v3ActiveDays: $("#v3ActiveDays"),
  v3AnnualYieldPercent: $("#v3AnnualYieldPercent"),
  v3PoolVolume: $("#v3PoolVolume"),
  v3PoolActiveLiquidity: $("#v3PoolActiveLiquidity"),
};

const outputs = {
  positionHint: $("#positionHint"),
  splitHint: $("#splitHint"),
  poolExplanation: $("#poolExplanation"),
  priceStatus: $("#priceStatus"),
  currentPriceLabel: $("#currentPriceLabel"),
  futureHint: $("#futureHint"),
  futurePriceLabel: $("#futurePriceLabel"),
  usdcAllocation: $("#usdcAllocation"),
  assetAllocation: $("#assetAllocation"),
  assetAllocationLabel: $("#assetAllocationLabel"),
  assetAmountLabel: $("#assetAmountLabel"),
  initialAssetAmount: $("#initialAssetAmount"),
  periodFeePercent: $("#periodFeePercent"),
  depositSummary: $("#depositSummary"),
  holdSummary: $("#holdSummary"),
  impermanentLoss: $("#impermanentLoss"),
  holdImpermanentLoss: $("#holdImpermanentLoss"),
  lpTokenA: $("#lpTokenA"),
  lpTokenB: $("#lpTokenB"),
  lpTokenBLabel: $("#lpTokenBLabel"),
  lpValue: $("#lpValue"),
  feeValue: $("#feeValue"),
  lpValueWithFees: $("#lpValueWithFees"),
  holdTokenA: $("#holdTokenA"),
  holdTokenB: $("#holdTokenB"),
  holdTokenBLabel: $("#holdTokenBLabel"),
  holdValue: $("#holdValue"),
  holdFeeValue: $("#holdFeeValue"),
  holdValueWithFees: $("#holdValueWithFees"),
  differenceValue: $("#differenceValue"),
  resultSummary: $("#resultSummary"),
  v3PositionHint: $("#v3PositionHint"),
  v3PairLabel: $("#v3PairLabel"),
  v3FeeTierBadge: $("#v3FeeTierBadge"),
  v3CurrentPriceLabel: $("#v3CurrentPriceLabel"),
  v3FuturePriceLabel: $("#v3FuturePriceLabel"),
  v3RangeStatus: $("#v3RangeStatus"),
  v3StatusText: $("#v3StatusText"),
  v3StartComposition: $("#v3StartComposition"),
  v3DepositSummary: $("#v3DepositSummary"),
  v3ChartSummary: $("#v3ChartSummary"),
  v3ChartBadge: $("#v3ChartBadge"),
  v3RangeChart: $("#v3RangeChart"),
  v3HistoryChart: $("#v3HistoryChart"),
  v3HistoryMin: $("#v3HistoryMin"),
  v3HistoryMax: $("#v3HistoryMax"),
  v3HistoryAvg: $("#v3HistoryAvg"),
  v3UsdcShare: $("#v3UsdcShare"),
  v3AssetShare: $("#v3AssetShare"),
  v3UsdcShareText: $("#v3UsdcShareText"),
  v3AssetShareText: $("#v3AssetShareText"),
  v3HoldSummary: $("#v3HoldSummary"),
  v3ImpermanentLoss: $("#v3ImpermanentLoss"),
  v3DepositAssetSymbol: $("#v3DepositAssetSymbol"),
  v3DepositAssetLine: $("#v3DepositAssetLine"),
  v3DepositUsdcLine: $("#v3DepositUsdcLine"),
  v3FeeValue: $("#v3FeeValue"),
  v3LpUsdc: $("#v3LpUsdc"),
  v3LpAssetLabel: $("#v3LpAssetLabel"),
  v3LpAsset: $("#v3LpAsset"),
  v3LpValue: $("#v3LpValue"),
  v3HoldUsdc: $("#v3HoldUsdc"),
  v3HoldAssetLabel: $("#v3HoldAssetLabel"),
  v3HoldAsset: $("#v3HoldAsset"),
  v3HoldValue: $("#v3HoldValue"),
  v3DifferenceValue: $("#v3DifferenceValue"),
  v3DaysToCover: $("#v3DaysToCover"),
  v3ResultSummary: $("#v3ResultSummary"),
  v3CompareHoldValue: $("#v3CompareHoldValue"),
  v3CompareHoldAssetLabel: $("#v3CompareHoldAssetLabel"),
  v3CompareHoldAsset: $("#v3CompareHoldAsset"),
  v3CompareHoldUsdc: $("#v3CompareHoldUsdc"),
  v3CompareLpValue: $("#v3CompareLpValue"),
  v3CompareLpAssetLabel: $("#v3CompareLpAssetLabel"),
  v3CompareLpAsset: $("#v3CompareLpAsset"),
  v3CompareLpUsdc: $("#v3CompareLpUsdc"),
  v3CompareLpYield: $("#v3CompareLpYield"),
  v3CompareIlValue: $("#v3CompareIlValue"),
  v3CompareIlPercent: $("#v3CompareIlPercent"),
  v3ComparePnlValue: $("#v3ComparePnlValue"),
  v3ComparePnlPercent: $("#v3ComparePnlPercent"),
  v3NeededFees: $("#v3NeededFees"),
  v3NeededFeePercent: $("#v3NeededFeePercent"),
  v3RequiredApr: $("#v3RequiredApr"),
  v3FeeVerdict: $("#v3FeeVerdict"),
  v3PoolDataStatus: $("#v3PoolDataStatus"),
  v3PoolShare: $("#v3PoolShare"),
  v3PoolFeeEstimate: $("#v3PoolFeeEstimate"),
  v3PoolAprEstimate: $("#v3PoolAprEstimate"),
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
  const sign = value < 0 ? "-" : "";
  return `${sign}${Math.abs(value).toFixed(2)}%`;
}

function setTone(element, value) {
  if (!element) return;
  element.classList.toggle("negative", value < 0);
  element.classList.toggle("positive", value > 0);
}

function assetValueLine(amount, symbol, price) {
  return `${tokenAmount.format(amount)} ${symbol} = ${currency.format(amount * price)}`;
}

function usdcValueLine(amount) {
  return `${tokenAmount.format(amount)} USDC = ${currency.format(amount)}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function priceUrl(asset) {
  return `https://api.coingecko.com/api/v3/simple/price?ids=${asset.id}&vs_currencies=usd&include_last_updated_at=true`;
}

function historyUrl(asset, days) {
  return `https://api.coingecko.com/api/v3/coins/${asset.id}/market_chart?vs_currency=usd&days=${days}`;
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
    `Когда цена ${symbol} растет, пул V2 автоматически продает часть ${symbol} в USDC, чтобы сохранить баланс 50/50. Поэтому в LP-позиции становится меньше ${symbol} и больше USDC, чем было бы при обычном HODL.`;
  outputs.currentPriceLabel.textContent = `${symbol} сейчас, $`;
  outputs.futureHint.textContent = `Для первого примера поставьте цену ${symbol} в 2 раза выше стартовой.`;
  outputs.futurePriceLabel.textContent = `${symbol} потом, $`;
  outputs.assetAllocationLabel.textContent = `Токен B (${symbol})`;
  outputs.assetAmountLabel.textContent = `Количество ${symbol} в позиции`;
  outputs.lpTokenBLabel.textContent = `Токен B (${symbol})`;
  outputs.holdTokenBLabel.textContent = `Токен B (${symbol})`;
}

function calculate() {
  const totalLiquidity = toPositiveNumber(inputs.totalLiquidity);
  const currentAssetPrice = toPositiveNumber(inputs.currentAssetPrice);
  const futureAssetPrice = toPositiveNumber(inputs.futureAssetPrice);
  const annualYieldPercent = Math.max(0, Number(inputs.annualYieldPercent.value.replace(",", ".")) || 0);
  const feesPercent = annualYieldPercent * (selectedMonths / 12);

  if (!totalLiquidity || !currentAssetPrice || !futureAssetPrice) return;

  const initialUsdcAmount = totalLiquidity / 2;
  const initialAssetAmount = (totalLiquidity / 2) / currentAssetPrice;
  const product = initialUsdcAmount * initialAssetAmount;
  const lpUsdcAmount = Math.sqrt(product * futureAssetPrice);
  const lpAssetAmount = Math.sqrt(product / futureAssetPrice);
  const lpValue = lpUsdcAmount + lpAssetAmount * futureAssetPrice;
  const holdValue = initialUsdcAmount + initialAssetAmount * futureAssetPrice;
  const lossPercent = holdValue ? ((holdValue - lpValue) / holdValue) * 100 : 0;
  const feeValue = totalLiquidity * (feesPercent / 100);
  const lpValueWithFees = lpValue + feeValue;
  const differenceWithFees = lpValueWithFees - holdValue;

  outputs.usdcAllocation.textContent = currency.format(totalLiquidity / 2);
  outputs.assetAllocation.textContent = currency.format(totalLiquidity / 2);
  outputs.initialAssetAmount.textContent = `${tokenAmount.format(initialAssetAmount)} ${activeAsset.symbol}`;
  if (outputs.periodFeePercent) outputs.periodFeePercent.textContent = `${feesPercent.toFixed(2)}%`;
  outputs.depositSummary.textContent =
    `Если ${currency.format(initialUsdcAmount)} в USDC и ${currency.format(totalLiquidity / 2)} в ${activeAsset.symbol} были предоставлены в качестве ликвидности.`;
  outputs.holdSummary.textContent =
    `Если эти же активы просто держать: ${currency.format(initialUsdcAmount)} в USDC и ${tokenAmount.format(initialAssetAmount)} ${activeAsset.symbol}.`;
  outputs.impermanentLoss.textContent = formatPercent(lossPercent);
  outputs.holdImpermanentLoss.textContent = "0.00%";
  outputs.lpTokenA.textContent = usdcValueLine(lpUsdcAmount);
  outputs.lpTokenB.textContent = assetValueLine(lpAssetAmount, activeAsset.symbol, futureAssetPrice);
  outputs.lpValue.textContent = currency.format(lpValue);
  outputs.feeValue.textContent = currency.format(feeValue);
  outputs.lpValueWithFees.textContent = currency.format(lpValueWithFees);
  outputs.holdTokenA.textContent = usdcValueLine(initialUsdcAmount);
  outputs.holdTokenB.textContent = assetValueLine(initialAssetAmount, activeAsset.symbol, futureAssetPrice);
  outputs.holdValue.textContent = currency.format(holdValue);
  outputs.holdFeeValue.textContent = currency.format(0);
  outputs.holdValueWithFees.textContent = currency.format(holdValue);
  outputs.differenceValue.textContent = currency.format(differenceWithFees);
  outputs.resultSummary.textContent =
    `При изменении цены ${activeAsset.symbol} с ${currency.format(currentAssetPrice)} до ${currency.format(futureAssetPrice)} LP-позиция без комиссий стала бы ${currency.format(lpValue)}, а HODL — ${currency.format(holdValue)}. Разница с учетом выбранных комиссий: ${currency.format(differenceWithFees)}.`;

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

function statusExplanation(status, symbol) {
  if (status === "Выше диапазона") {
    return `Цена выше верхней границы: позиция почти полностью превратилась в USDC. Вы больше не участвуете в росте ${symbol}, пока цена не вернется в диапазон.`;
  }
  if (status === "Ниже диапазона") {
    return `Цена ниже нижней границы: позиция почти полностью превратилась в ${symbol}. Комиссии не копятся, пока цена не вернется в диапазон.`;
  }
  return "Цена внутри диапазона: позиция активна, постепенно меняет состав и может собирать комиссии.";
}

function renderV3Chart({ currentPrice, lowerPrice, upperPrice, futurePrice, status, usdcValue, assetValue }) {
  const values = [currentPrice, lowerPrice, upperPrice, futurePrice];
  const min = Math.min(...values) * 0.94;
  const max = Math.max(...values) * 1.06;
  const scale = (price) => 80 + ((price - min) / (max - min)) * 740;
  const currentX = scale(currentPrice);
  const futureX = scale(futurePrice);
  const lowerX = scale(lowerPrice);
  const upperX = scale(upperPrice);
  const usdcShare = usdcValue + assetValue ? (usdcValue / (usdcValue + assetValue)) * 100 : 0;
  const assetShare = 100 - usdcShare;

  outputs.v3ChartBadge.textContent = status;
  outputs.v3ChartSummary.textContent =
    `Диапазон ${currency.format(lowerPrice)} — ${currency.format(upperPrice)}. Сейчас ${currency.format(currentPrice)}, сценарий ${currency.format(futurePrice)}.`;
  outputs.v3UsdcShare.style.width = `${usdcShare.toFixed(2)}%`;
  outputs.v3AssetShare.style.width = `${assetShare.toFixed(2)}%`;
  outputs.v3UsdcShareText.textContent = `USDC: ${usdcShare.toFixed(1)}%`;
  outputs.v3AssetShareText.textContent = `${activeV3Asset.symbol}: ${assetShare.toFixed(1)}%`;

  outputs.v3RangeChart.innerHTML = `
    <rect x="60" y="56" width="780" height="190" rx="18" class="range-fill"></rect>
    <line x1="80" y1="246" x2="820" y2="246" class="axis"></line>
    <rect x="${lowerX}" y="82" width="${Math.max(4, upperX - lowerX)}" height="132" rx="12" class="range-band"></rect>
    <line x1="${lowerX}" y1="72" x2="${lowerX}" y2="246" class="boundary-line"></line>
    <line x1="${upperX}" y1="72" x2="${upperX}" y2="246" class="boundary-line"></line>
    <line x1="${currentX}" y1="54" x2="${currentX}" y2="246" class="current-line"></line>
    <line x1="${futureX}" y1="54" x2="${futureX}" y2="246" class="future-line"></line>
    <circle cx="${futureX}" cy="120" r="9" fill="#8fe3b1"></circle>
    <text x="${lowerX}" y="270" text-anchor="middle">${currency.format(lowerPrice)}</text>
    <text x="${upperX}" y="270" text-anchor="middle">${currency.format(upperPrice)}</text>
    <text x="${currentX}" y="36" text-anchor="middle">сейчас</text>
    <text x="${futureX}" y="36" text-anchor="middle">потом</text>
    <text x="450" y="155" text-anchor="middle">${status}</text>
  `;
}

function renderV3HistoryChart(prices, lowerPrice, upperPrice, currentPrice, futurePrice) {
  if (!prices.length) {
    outputs.v3HistoryMin.textContent = "MIN —";
    outputs.v3HistoryMax.textContent = "MAX —";
    outputs.v3HistoryAvg.textContent = "AVG —";
    outputs.v3HistoryChart.innerHTML = `<text x="450" y="165" text-anchor="middle">История цены не загрузилась. Расчет работает вручную.</text>`;
    return;
  }

  const series = prices.slice(-selectedHistoryDays);
  const minSeries = Math.min(...series);
  const maxSeries = Math.max(...series);
  const avgSeries = series.reduce((sum, price) => sum + price, 0) / series.length;
  const min = Math.min(minSeries, lowerPrice, currentPrice, futurePrice) * 0.96;
  const max = Math.max(maxSeries, upperPrice, currentPrice, futurePrice) * 1.04;
  const x = (index) => 60 + (index / Math.max(1, series.length - 1)) * 780;
  const y = (price) => 260 - ((price - min) / (max - min)) * 210;
  const points = series.map((price, index) => `${x(index)},${y(price)}`).join(" ");
  const areaPoints = `60,260 ${points} 840,260`;
  const lowerY = y(lowerPrice);
  const upperY = y(upperPrice);
  const currentY = y(currentPrice);
  const futureY = y(futurePrice);

  outputs.v3HistoryMin.textContent = `MIN ${currency.format(minSeries)}`;
  outputs.v3HistoryMax.textContent = `MAX ${currency.format(maxSeries)}`;
  outputs.v3HistoryAvg.textContent = `AVG ${currency.format(avgSeries)}`;
  outputs.v3HistoryChart.innerHTML = `
    <rect x="60" y="${Math.min(lowerY, upperY)}" width="780" height="${Math.abs(lowerY - upperY)}" class="range-band"></rect>
    <polygon class="history-area" points="${areaPoints}"></polygon>
    <polyline class="history-line" points="${points}"></polyline>
    <line x1="60" y1="${currentY}" x2="840" y2="${currentY}" class="current-line"></line>
    <line x1="60" y1="${futureY}" x2="840" y2="${futureY}" class="future-line"></line>
    <line x1="60" y1="260" x2="840" y2="260" class="axis"></line>
    <text x="76" y="${currentY - 8}">сейчас ${currency.format(currentPrice)}</text>
    <text x="76" y="${futureY - 8}">сценарий ${currency.format(futurePrice)}</text>
  `;
}

async function loadV3History(days) {
  try {
    const response = await fetch(historyUrl(activeV3Asset, days), { cache: "no-store" });
    if (!response.ok) throw new Error("History request failed");
    const data = await response.json();
    v3HistoryPrices = Array.isArray(data.prices) ? data.prices.map((item) => item[1]).filter(Boolean) : [];
  } catch (error) {
    v3HistoryPrices = [];
  } finally {
    calculateV3();
  }
}

function calculateV3() {
  const totalLiquidity = toPositiveNumber(inputs.v3TotalLiquidity);
  const currentPrice = toPositiveNumber(inputs.v3CurrentPrice);
  const lowerPrice = toPositiveNumber(inputs.v3LowerPrice);
  const upperPrice = toPositiveNumber(inputs.v3UpperPrice);
  const futurePrice = toPositiveNumber(inputs.v3FuturePrice);
  const activeDays = Math.max(0, Number(inputs.v3ActiveDays.value.replace(",", ".")) || 0);
  const annualYieldPercent = Math.max(0, Number(inputs.v3AnnualYieldPercent.value.replace(",", ".")) || 0);
  const poolVolume = Math.max(0, Number(inputs.v3PoolVolume.value.replace(",", ".")) || 0);
  const poolActiveLiquidity = Math.max(0, Number(inputs.v3PoolActiveLiquidity.value.replace(",", ".")) || 0);

  if (!totalLiquidity || !currentPrice || !lowerPrice || !upperPrice || !futurePrice) return;

  if (lowerPrice >= upperPrice) {
    outputs.v3RangeStatus.textContent = "Проверьте диапазон";
    outputs.v3StatusText.textContent = "Нижняя граница должна быть меньше верхней.";
    outputs.v3ResultSummary.textContent = "Исправьте диапазон, чтобы расчет стал корректным.";
    outputs.v3ChartBadge.textContent = "Ошибка диапазона";
    return;
  }

  const unitStart = getV3Amounts(1, currentPrice, lowerPrice, upperPrice);
  const unitValue = unitStart.usdc + unitStart.asset * currentPrice;

  if (!unitValue) {
    outputs.v3RangeStatus.textContent = "Старт вне диапазона";
    outputs.v3StatusText.textContent = "Для учебного расчета поставьте текущую цену внутри диапазона.";
    outputs.v3ResultSummary.textContent = "Стартовая цена должна быть внутри выбранного диапазона.";
    outputs.v3ChartBadge.textContent = "Старт вне диапазона";
    return;
  }

  const liquidity = totalLiquidity / unitValue;
  const start = getV3Amounts(liquidity, currentPrice, lowerPrice, upperPrice);
  const future = getV3Amounts(liquidity, futurePrice, lowerPrice, upperPrice);
  const lpValueBeforeFees = future.usdc + future.asset * futurePrice;
  const holdValue = start.usdc + start.asset * futurePrice;
  const neededFees = Math.max(0, holdValue - lpValueBeforeFees);
  const neededFeePercent = totalLiquidity ? (neededFees / totalLiquidity) * 100 : 0;
  const requiredApr = activeDays > 0 ? (neededFees / totalLiquidity) * (365 / activeDays) * 100 : 0;
  const feeValue = totalLiquidity * (annualYieldPercent / 100) * (activeDays / 365);
  const lpValue = lpValueBeforeFees + feeValue;
  const differenceBeforeFees = lpValueBeforeFees - holdValue;
  const difference = lpValue - holdValue;
  const lossPercent = holdValue ? ((holdValue - lpValueBeforeFees) / holdValue) * 100 : 0;
  const dailyFeeValue = annualYieldPercent ? totalLiquidity * (annualYieldPercent / 100) / 365 : 0;
  const daysToCover = dailyFeeValue > 0 && neededFees > 0 ? Math.ceil(neededFees / dailyFeeValue) : 0;
  const poolShare = poolActiveLiquidity > 0 ? totalLiquidity / (poolActiveLiquidity + totalLiquidity) : 0;
  const poolFeeEstimate = poolVolume > 0 && poolShare > 0 ? (selectedV3FeeTier / 100) * poolVolume * poolShare : 0;
  const poolAprEstimate =
    poolFeeEstimate > 0 && totalLiquidity > 0 && activeDays > 0
      ? (poolFeeEstimate / totalLiquidity) * (365 / activeDays) * 100
      : 0;

  outputs.v3RangeStatus.textContent = future.status;
  outputs.v3StatusText.textContent = statusExplanation(future.status, activeV3Asset.symbol);
  outputs.v3FeeTierBadge.textContent = `${selectedV3FeeTier}%`;
  outputs.v3DepositAssetSymbol.textContent = activeV3Asset.symbol;
  outputs.v3DepositAssetLine.textContent = assetValueLine(start.asset, activeV3Asset.symbol, currentPrice);
  outputs.v3DepositUsdcLine.textContent = usdcValueLine(start.usdc);
  outputs.v3StartComposition.textContent =
    `На входе в V3/V4: ${usdcValueLine(start.usdc)} и ${assetValueLine(start.asset, activeV3Asset.symbol, currentPrice)}.`;
  outputs.v3DepositSummary.textContent =
    `Будущий состав V3/V4: ${usdcValueLine(future.usdc)} и ${assetValueLine(future.asset, activeV3Asset.symbol, futurePrice)}.`;
  outputs.v3HoldSummary.textContent =
    `HODL сохраняет стартовые активы: ${usdcValueLine(start.usdc)} и ${tokenAmount.format(start.asset)} ${activeV3Asset.symbol}.`;
  outputs.v3ImpermanentLoss.textContent = formatPercent(lossPercent);
  outputs.v3FeeValue.textContent = currency.format(feeValue);
  outputs.v3LpUsdc.textContent = usdcValueLine(future.usdc);
  outputs.v3LpAsset.textContent = assetValueLine(future.asset, activeV3Asset.symbol, futurePrice);
  outputs.v3LpValue.textContent = currency.format(lpValue);
  outputs.v3HoldUsdc.textContent = usdcValueLine(start.usdc);
  outputs.v3HoldAsset.textContent = assetValueLine(start.asset, activeV3Asset.symbol, futurePrice);
  outputs.v3HoldValue.textContent = currency.format(holdValue);
  outputs.v3DifferenceValue.textContent = currency.format(difference);
  outputs.v3CompareHoldValue.textContent = currency.format(holdValue);
  outputs.v3CompareHoldAssetLabel.textContent = activeV3Asset.symbol;
  outputs.v3CompareHoldAsset.textContent = assetValueLine(start.asset, activeV3Asset.symbol, futurePrice);
  outputs.v3CompareHoldUsdc.textContent = usdcValueLine(start.usdc);
  outputs.v3CompareLpValue.textContent = currency.format(lpValue);
  outputs.v3CompareLpAssetLabel.textContent = activeV3Asset.symbol;
  outputs.v3CompareLpAsset.textContent = assetValueLine(future.asset, activeV3Asset.symbol, futurePrice);
  outputs.v3CompareLpUsdc.textContent = usdcValueLine(future.usdc);
  outputs.v3CompareLpYield.textContent = currency.format(feeValue);
  outputs.v3CompareIlValue.textContent = currency.format(differenceBeforeFees);
  outputs.v3CompareIlPercent.textContent = formatPercent(lossPercent);
  outputs.v3ComparePnlValue.textContent = currency.format(difference);
  outputs.v3ComparePnlPercent.textContent = holdValue ? formatPercent((difference / holdValue) * 100) : "0.00%";
  outputs.v3NeededFees.textContent = currency.format(neededFees);
  outputs.v3NeededFeePercent.textContent = `${neededFeePercent.toFixed(2)}%`;
  outputs.v3RequiredApr.textContent = activeDays > 0 ? `${requiredApr.toFixed(2)}%` : "—";
  outputs.v3PoolShare.textContent = `${(poolShare * 100).toFixed(4)}%`;
  outputs.v3PoolFeeEstimate.textContent = currency.format(poolFeeEstimate);
  outputs.v3PoolAprEstimate.textContent = `${poolAprEstimate.toFixed(2)}%`;
  outputs.v3PoolDataStatus.textContent =
    poolFeeEstimate > 0
      ? `По Poolfish-логике при объеме ${currency.format(poolVolume)} и активной ликвидности в диапазоне ${currency.format(poolActiveLiquidity)} расчетная комиссия вашей позиции за ${activeDays || "выбранный срок"} дней: ${currency.format(poolFeeEstimate)}. Это упрощенная справочная оценка, а не гарантия доходности.`
      : "Упрощенная формула: комиссии ≈ fee tier × объем торгов × ваша позиция / (активная ликвидность в диапазоне + ваша позиция). Если объем и активная ликвидность равны нулю, расчет комиссий остается ручным через APR выше.";
  outputs.v3FeeVerdict.textContent =
    neededFees === 0
      ? "В этом сценарии V3/V4 до комиссий не хуже HODL. Любые комиссии будут плюсом."
      : `Чтобы V3/V4 сравнялся с HODL, нужно заработать ${currency.format(neededFees)} комиссий за ${activeDays || "выбранный срок"} дней. При вашем прогнозе комиссий итог: ${currency.format(difference)} против HODL.`;
  outputs.v3DaysToCover.textContent =
    daysToCover > 0 ? `${daysToCover} дн.` : neededFees === 0 ? "Комиссии не нужны" : "Укажите APR комиссий";
  outputs.v3ResultSummary.textContent =
    `Без комиссий V3/V4: ${currency.format(lpValueBeforeFees)}, HODL: ${currency.format(holdValue)}. Нужно комиссий для безубыточности: ${currency.format(neededFees)}. Итог с вашим прогнозом комиссий: ${currency.format(lpValue)}.`;

  renderV3Chart({
    currentPrice,
    lowerPrice,
    upperPrice,
    futurePrice,
    status: future.status,
    usdcValue: future.usdc,
    assetValue: future.asset * futurePrice,
  });
  renderV3HistoryChart(v3HistoryPrices, lowerPrice, upperPrice, currentPrice, futurePrice);

  setTone(outputs.v3DifferenceValue, difference);
  setTone(outputs.v3CompareIlValue, differenceBeforeFees);
  setTone(outputs.v3CompareIlPercent, -lossPercent);
  setTone(outputs.v3ComparePnlValue, difference);
  setTone(outputs.v3ComparePnlPercent, difference);
  setTone(outputs.v3NeededFees, -neededFees);
  setTone(outputs.v3FeeVerdict, difference);
}

async function loadAssetPrice() {
  const asset = activeAsset;
  outputs.priceStatus.textContent = `Пробую загрузить текущую цену ${asset.symbol}...`;

  try {
    const response = await fetch(priceUrl(asset), { cache: "no-store" });
    if (!response.ok) throw new Error("Price request failed");
    const data = await response.json();
    const price = data?.[asset.id]?.usd;
    if (!price || asset !== activeAsset) return;
    const updatedAt = data[asset.id].last_updated_at ? formatDate(data[asset.id].last_updated_at) : "сейчас";
    outputs.priceStatus.textContent =
      `Подсказка: на ${updatedAt} цена ${asset.name} была ${currency.format(price)}. Первый расчет лучше начать с округленных цифр.`;
  } catch (error) {
    outputs.priceStatus.textContent =
      `Не удалось загрузить цену ${asset.name}. Можно ввести текущую цену вручную.`;
  } finally {
    calculate();
  }
}

function selectAsset(assetId) {
  activeAsset = assets[assetId];
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
  document.querySelectorAll(".v2-view").forEach((element) => element.classList.toggle("hidden", isV3));
  document.querySelectorAll(".v3-view").forEach((element) => element.classList.toggle("hidden", !isV3));
  if (isV3) calculateV3();
}

function updateV3AssetText() {
  const { symbol, pool } = activeV3Asset;
  outputs.v3PositionHint.textContent = "Стартовая цена должна быть внутри диапазона, иначе позиция уже на входе будет в одном токене.";
  outputs.v3PairLabel.textContent = pool.replace("/", " / ");
  outputs.v3DepositAssetSymbol.textContent = symbol;
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
  loadV3History(selectedHistoryDays);
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

document.querySelectorAll(".fee-tier-button").forEach((button) => {
  button.addEventListener("click", () => {
    selectedV3FeeTier = Number(button.dataset.feeTier);
    document.querySelectorAll(".fee-tier-button").forEach((item) => item.classList.toggle("active", item === button));
    calculateV3();
  });
});

document.querySelectorAll(".history-button").forEach((button) => {
  button.addEventListener("click", () => {
    selectedHistoryDays = Number(button.dataset.days);
    document.querySelectorAll(".history-button").forEach((item) => item.classList.toggle("active", item === button));
    loadV3History(selectedHistoryDays);
  });
});

document.querySelectorAll(".duration-button").forEach((button) => {
  button.addEventListener("click", () => {
    selectedMonths = Number(button.dataset.months);
    document.querySelectorAll(".duration-button").forEach((item) => item.classList.toggle("active", item === button));
    calculate();
  });
});

[
  inputs.totalLiquidity,
  inputs.currentAssetPrice,
  inputs.futureAssetPrice,
  inputs.annualYieldPercent,
].forEach((input) => input.addEventListener("input", calculate));

[
  inputs.v3TotalLiquidity,
  inputs.v3CurrentPrice,
  inputs.v3LowerPrice,
  inputs.v3UpperPrice,
  inputs.v3FuturePrice,
  inputs.v3ActiveDays,
  inputs.v3AnnualYieldPercent,
  inputs.v3PoolVolume,
  inputs.v3PoolActiveLiquidity,
].forEach((input) => input.addEventListener("input", calculateV3));

updateAssetText();
updateV3AssetText();
calculate();
calculateV3();
loadAssetPrice();
loadV3History(selectedHistoryDays);
