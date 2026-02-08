"use client";

import { useMemo, useState, useEffect, type FormEvent } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract
} from "wagmi";
import { formatUnits, isAddress, parseUnits, zeroAddress } from "viem";
import { playgroundErc20Abi } from "@/lib/erc20Abi";
import { chains } from "@/config/wagmi";

type ActionKind =
  | "transfer"
  | "approve"
  | "transferFrom"
  | "mint"
  | "burn"
  | "burnFrom"
  | "increaseAllowance"
  | "decreaseAllowance";

type Language = "en" | "ru";

const DEFAULT_CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";
const DEFAULT_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 31337);

const ACTION_META: Record<
  Language,
  Record<ActionKind, { title: string; description: string; button: string }>
> = {
  en: {
    transfer: {
      title: "Transfer",
      description: "Send tokens from your wallet to another address.",
      button: "Send tokens"
    },
    approve: {
      title: "Approve",
      description: "Grant a spender allowance to use your tokens.",
      button: "Approve spender"
    },
    transferFrom: {
      title: "Transfer From",
      description: "Move tokens from an owner using your allowance.",
      button: "Transfer using allowance"
    },
    mint: {
      title: "Mint",
      description: "Owner-only: mint new tokens to any address.",
      button: "Mint tokens"
    },
    burn: {
      title: "Burn",
      description: "Destroy tokens from your wallet and reduce supply.",
      button: "Burn tokens"
    },
    burnFrom: {
      title: "Burn From",
      description: "Burn tokens from an owner using your allowance.",
      button: "Burn using allowance"
    },
    increaseAllowance: {
      title: "Increase Allowance",
      description: "Add more allowance without resetting it.",
      button: "Increase allowance"
    },
    decreaseAllowance: {
      title: "Decrease Allowance",
      description: "Reduce allowance safely without resetting it.",
      button: "Decrease allowance"
    }
  },
  ru: {
    transfer: {
      title: "Перевод",
      description: "Отправьте токены со своего кошелька на другой адрес.",
      button: "Отправить токены"
    },
    approve: {
      title: "Одобрение",
      description: "Разрешите spender использовать ваши токены.",
      button: "Одобрить spender"
    },
    transferFrom: {
      title: "Transfer From",
      description: "Переместите токены со счета владельца, используя allowance.",
      button: "Перевести по allowance"
    },
    mint: {
      title: "Mint",
      description: "Только владелец: выпуск новых токенов на любой адрес.",
      button: "Выпустить токены"
    },
    burn: {
      title: "Burn",
      description: "Уничтожьте токены со своего кошелька и уменьшите supply.",
      button: "Сжечь токены"
    },
    burnFrom: {
      title: "Burn From",
      description: "Сожгите токены владельца, используя allowance.",
      button: "Сжечь по allowance"
    },
    increaseAllowance: {
      title: "Increase Allowance",
      description: "Увеличьте allowance, не сбрасывая его.",
      button: "Увеличить allowance"
    },
    decreaseAllowance: {
      title: "Decrease Allowance",
      description: "Уменьшите allowance безопасно, без сброса.",
      button: "Уменьшить allowance"
    }
  }
};

const COPY: Record<
  Language,
  {
    eyebrow: string;
    title: string;
    lead: (tokenName: string) => string;
    walletLabel: (label: string) => string;
    disconnect: string;
    connect: (name: string) => string;
    languageLabel: string;
    noInjected: string;
    connectFailed: (message: string) => string;
    contractSnapshot: string;
    activeContract: string;
    overrideAddress: string;
    supportedNetworks: string;
    defaultChainId: string;
    readPanel: string;
    token: string;
    totalSupply: string;
    decimals: string;
    owner: string;
    yourBalance: string;
    allowanceSpender: string;
    allowanceHint: string;
    actionConsole: string;
    actionLabel: string;
    fromAddress: string;
    toAddress: string;
    spenderAddress: string;
    amountLabel: (symbol: string) => string;
    processing: string;
    provideContract: string;
    pendingTx: string;
    confirmedTx: string;
    whyTitle: string;
    whyBullets: string[];
    techNotes: string;
    stack: string;
    stackDescription: string;
    contract: string;
    contractDescription: string;
    chainHint: string;
    loadingWallet: string;
    notConnected: string;
    notSet: string;
    na: string;
    errorNoContract: string;
    errorNoWallet: string;
    errorAmount: string;
    errorAddresses: string;
    errorTx: string;
  }
> = {
  en: {
    eyebrow: "ERC-20 Playground",
    title: "Token UX that makes sense at a glance.",
    lead: (tokenName) =>
      `A clean test UI for ${tokenName} built with Next.js, Wagmi, and Viem.`,
    walletLabel: (label) => `Wallet ${label}`,
    disconnect: "Disconnect",
    connect: (name) => `Connect ${name}`,
    languageLabel: "Language",
    noInjected:
      "No injected wallet detected. Install MetaMask or enable your browser wallet extension.",
    connectFailed: (message) => `Wallet connection failed: ${message}`,
    contractSnapshot: "Contract Snapshot",
    activeContract: "Active contract",
    overrideAddress: "Override address (optional)",
    supportedNetworks: "Supported networks",
    defaultChainId: "Default chain id",
    readPanel: "Read Panel",
    token: "Token",
    totalSupply: "Total supply",
    decimals: "Decimals",
    owner: "Owner",
    yourBalance: "Your balance",
    allowanceSpender: "Allowance (spender)",
    allowanceHint: "Allowance updates when you enter a spender address below.",
    actionConsole: "Action Console",
    actionLabel: "Action",
    fromAddress: "From address",
    toAddress: "To address",
    spenderAddress: "Spender address",
    amountLabel: (symbol) => `Amount (${symbol})`,
    processing: "Processing...",
    provideContract: "Provide a valid contract address to enable actions.",
    pendingTx: "Pending transaction",
    confirmedTx: "Confirmed transaction",
    whyTitle: "Why this demo works",
    whyBullets: [
      "Clear separation of read and write flows.",
      "All ERC-20 actions are reachable in a single console.",
      "Visual hierarchy highlights the core contract data.",
      "Wallet connection is front and center, not hidden."
    ],
    techNotes: "Tech Notes",
    stack: "Stack",
    stackDescription: "Next.js App Router + Wagmi + Viem + React Query",
    contract: "Contract",
    contractDescription: "PlaygroundERC20 with mint, burn, and allowance helpers.",
    chainHint: "If the wallet is on a different chain, switch to Anvil or Sepolia.",
    loadingWallet: "Loading wallet…",
    notConnected: "Not connected",
    notSet: "Not set",
    na: "N/A",
    errorNoContract: "Set a valid contract address first.",
    errorNoWallet: "Connect your wallet to send transactions.",
    errorAmount: "Enter a valid amount (use decimals if needed).",
    errorAddresses: "Fill in all required addresses for this action.",
    errorTx: "Transaction failed. Try again."
  },
  ru: {
    eyebrow: "Песочница ERC-20",
    title: "Понятный с первого взгляда интерфейс токена.",
    lead: (tokenName) =>
      `Тестовый интерфейс для ${tokenName} на Next.js, Wagmi и Viem.`,
    walletLabel: (label) => `Кошелек ${label}`,
    disconnect: "Отключить",
    connect: (name) => `Подключить ${name}`,
    languageLabel: "Язык",
    noInjected:
      "Injected-кошелек не найден. Установите MetaMask или включите расширение кошелька в браузере.",
    connectFailed: (message) => `Не удалось подключить кошелек: ${message}`,
    contractSnapshot: "Сводка контракта",
    activeContract: "Активный контракт",
    overrideAddress: "Переопределить адрес (необязательно)",
    supportedNetworks: "Поддерживаемые сети",
    defaultChainId: "Chain ID по умолчанию",
    readPanel: "Панель чтения",
    token: "Токен",
    totalSupply: "Общее предложение",
    decimals: "Дробность",
    owner: "Владелец",
    yourBalance: "Ваш баланс",
    allowanceSpender: "Разрешение (spender)",
    allowanceHint: "Лимит обновляется, когда вы вводите адрес spender ниже.",
    actionConsole: "Консоль действий",
    actionLabel: "Действие",
    fromAddress: "Адрес отправителя",
    toAddress: "Адрес получателя",
    spenderAddress: "Адрес spender",
    amountLabel: (symbol) => `Сумма (${symbol})`,
    processing: "В обработке...",
    provideContract: "Укажите корректный адрес контракта, чтобы включить действия.",
    pendingTx: "Ожидается транзакция",
    confirmedTx: "Транзакция подтверждена",
    whyTitle: "Почему эта демка работает",
    whyBullets: [
      "Четко разделены чтение и запись.",
      "Все действия ERC-20 доступны в одной консоли.",
      "Визуальная иерархия подчеркивает ключевые данные контракта.",
      "Подключение кошелька на виду, а не спрятано."
    ],
    techNotes: "Технические детали",
    stack: "Стек",
    stackDescription: "Next.js App Router + Wagmi + Viem + React Query",
    contract: "Контракт",
    contractDescription: "PlaygroundERC20 с mint, burn и helper-функциями для allowance.",
    chainHint: "Если кошелек в другой сети, переключитесь на Anvil или Sepolia.",
    loadingWallet: "Загрузка кошелька…",
    notConnected: "Не подключен",
    notSet: "Не задан",
    na: "Н/Д",
    errorNoContract: "Сначала укажите корректный адрес контракта.",
    errorNoWallet: "Подключите кошелек, чтобы отправлять транзакции.",
    errorAmount: "Введите корректную сумму (можно с десятичной частью).",
    errorAddresses: "Заполните все обязательные адреса для этого действия.",
    errorTx: "Транзакция не прошла. Попробуйте еще раз."
  }
};

export default function Page() {
  const [addressOverride, setAddressOverride] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [isMounted, setIsMounted] = useState(false);
  const [action, setAction] = useState<ActionKind>("transfer");
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [spender, setSpender] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [txError, setTxError] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const {
    connectors,
    connect,
    isPending: isConnecting,
    isError: isConnectError,
    error: connectError
  } = useConnect();
  const { disconnect } = useDisconnect();
  const [hasInjectedProvider, setHasInjectedProvider] = useState(true);

  const t = COPY[language];
  const actionMeta = ACTION_META[language];

  const contractAddress = useMemo(() => {
    if (isAddress(addressOverride)) {
      return addressOverride;
    }
    if (isAddress(DEFAULT_CONTRACT)) {
      return DEFAULT_CONTRACT;
    }
    return undefined;
  }, [addressOverride]);

  const readEnabled = Boolean(contractAddress);
  const readAddress = contractAddress ?? zeroAddress;

  const { data: nameData } = useReadContract({
    address: readAddress,
    abi: playgroundErc20Abi,
    functionName: "name",
    query: { enabled: readEnabled }
  });

  const { data: symbolData } = useReadContract({
    address: readAddress,
    abi: playgroundErc20Abi,
    functionName: "symbol",
    query: { enabled: readEnabled }
  });

  const { data: decimalsData } = useReadContract({
    address: readAddress,
    abi: playgroundErc20Abi,
    functionName: "decimals",
    query: { enabled: readEnabled }
  });

  const {
    data: totalSupplyData,
    refetch: refetchTotalSupply
  } = useReadContract({
    address: readAddress,
    abi: playgroundErc20Abi,
    functionName: "totalSupply",
    query: { enabled: readEnabled }
  });

  const { data: ownerData } = useReadContract({
    address: readAddress,
    abi: playgroundErc20Abi,
    functionName: "owner",
    query: { enabled: readEnabled }
  });

  const {
    data: balanceData,
    refetch: refetchBalance
  } = useReadContract({
    address: readAddress,
    abi: playgroundErc20Abi,
    functionName: "balanceOf",
    args: [address ?? zeroAddress],
    query: { enabled: readEnabled && Boolean(address) }
  });

  const spenderAddress = isAddress(spender) ? spender : undefined;

  const {
    data: allowanceData,
    refetch: refetchAllowance
  } = useReadContract({
    address: readAddress,
    abi: playgroundErc20Abi,
    functionName: "allowance",
    args: [address ?? zeroAddress, spenderAddress ?? zeroAddress],
    query: { enabled: readEnabled && Boolean(address) && Boolean(spenderAddress) }
  });

  const decimals = typeof decimalsData === "bigint" ? Number(decimalsData) : 18;
  const tokenName = typeof nameData === "string" ? nameData : "ERC-20";
  const tokenSymbol = typeof symbolData === "string" ? symbolData : "TOKEN";

  const formatAmount = (value?: bigint) =>
    typeof value === "bigint" ? formatUnits(value, decimals) : t.na;

  const { mutateAsync, isPending: isWriting } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
      query: { enabled: Boolean(txHash) }
    });

  useEffect(() => {
    if (isConfirmed) {
      refetchTotalSupply();
      refetchBalance();
      refetchAllowance();
    }
  }, [isConfirmed, refetchTotalSupply, refetchBalance, refetchAllowance]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const browserLanguage = navigator.language.toLowerCase();
      if (browserLanguage.startsWith("ru")) {
        setLanguage("ru");
      }
    }
  }, []);

  useEffect(() => {
    const hasProvider =
      typeof window !== "undefined" &&
      typeof (window as Window & { ethereum?: unknown }).ethereum !== "undefined";
    setHasInjectedProvider(hasProvider);
  }, []);

  useEffect(() => {
    setTxError(null);
  }, [language]);

  const needsTo = ["transfer", "transferFrom", "mint"].includes(action);
  const needsFrom = ["transferFrom", "burnFrom"].includes(action);
  const needsSpender = ["approve", "increaseAllowance", "decreaseAllowance"].includes(
    action
  );
  const needsAmount = true;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTxError(null);

    if (!contractAddress) {
      setTxError(t.errorNoContract);
      return;
    }

    if (!isConnected) {
      setTxError(t.errorNoWallet);
      return;
    }

    const parsedAmount = (() => {
      if (!amount) return null;
      try {
        return parseUnits(amount, decimals);
      } catch {
        return null;
      }
    })();

    if (parsedAmount === null) {
      setTxError(t.errorAmount);
      return;
    }

    const toAddress = isAddress(to) ? to : undefined;
    const fromAddress = isAddress(from) ? from : undefined;
    const spenderAddr = isAddress(spender) ? spender : undefined;

    try {
      const config = (() => {
        switch (action) {
          case "transfer":
            if (!toAddress) return null;
            return { functionName: "transfer", args: [toAddress, parsedAmount] as const };
          case "approve":
            if (!spenderAddr) return null;
            return { functionName: "approve", args: [spenderAddr, parsedAmount] as const };
          case "transferFrom":
            if (!fromAddress || !toAddress) return null;
            return {
              functionName: "transferFrom",
              args: [fromAddress, toAddress, parsedAmount] as const
            };
          case "mint":
            if (!toAddress) return null;
            return { functionName: "mint", args: [toAddress, parsedAmount] as const };
          case "burn":
            return { functionName: "burn", args: [parsedAmount] as const };
          case "burnFrom":
            if (!fromAddress) return null;
            return { functionName: "burnFrom", args: [fromAddress, parsedAmount] as const };
          case "increaseAllowance":
            if (!spenderAddr) return null;
            return {
              functionName: "increaseAllowance",
              args: [spenderAddr, parsedAmount] as const
            };
          case "decreaseAllowance":
            if (!spenderAddr) return null;
            return {
              functionName: "decreaseAllowance",
              args: [spenderAddr, parsedAmount] as const
            };
        }
      })();

      if (!config) {
        setTxError(t.errorAddresses);
        return;
      }

      const hash = await mutateAsync({
        address: contractAddress,
        abi: playgroundErc20Abi,
        functionName: config.functionName,
        args: config.args
      });

      setTxHash(hash);
      setAmount("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t.errorTx;
      setTxError(message);
    }
  };

  const walletLabel = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : t.notConnected;

  const contractLabel = contractAddress
    ? `${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}`
    : t.notSet;

  const chainLabels = chains.map((chain) => `${chain.name} (${chain.id})`);
  const connectErrorMessage =
    isConnectError && connectError ? t.connectFailed(connectError.message) : null;

  return (
    <main className="page">
      <header className="hero">
        <div>
          <div className="hero-top">
            <span className="eyebrow">{t.eyebrow}</span>
            <div className="lang-toggle">
              <span className="lang-label">{t.languageLabel}</span>
              <button
                className={`button ghost lang-button ${language === "en" ? "active" : ""}`}
                onClick={() => setLanguage("en")}
                type="button"
              >
                EN
              </button>
              <button
                className={`button ghost lang-button ${language === "ru" ? "active" : ""}`}
                onClick={() => setLanguage("ru")}
                type="button"
              >
                RU
              </button>
            </div>
          </div>
          <h1 className="title">{t.title}</h1>
          <p className="lead">{t.lead(tokenName)}</p>
          <div className="hero-actions">
            {!isMounted ? (
              <span className="badge">{t.loadingWallet}</span>
            ) : isConnected ? (
              <>
                <span className="badge">{t.walletLabel(walletLabel)}</span>
                <button className="button ghost" onClick={() => disconnect()}>
                  {t.disconnect}
                </button>
              </>
            ) : (
              connectors.map((connector) => {
                const isConnectorReady =
                  (connector as { ready?: boolean }).ready ?? true;
                const isInjected = connector.id === "injected";
                const isBlocked = isInjected && !hasInjectedProvider;
                return (
                  <button
                    key={connector.id}
                    className="button primary"
                    onClick={() => connect({ connector })}
                    disabled={!isConnectorReady || isConnecting || isBlocked}
                  >
                    {t.connect(connector.name)}
                  </button>
                );
              })
            )}
          </div>
          {isMounted && !hasInjectedProvider && (
            <div className="status warn" style={{ marginTop: "14px" }}>
              {t.noInjected}
            </div>
          )}
          {isMounted && connectErrorMessage && (
            <div className="status warn" style={{ marginTop: "12px" }}>
              {connectErrorMessage}
            </div>
          )}
        </div>
        <div className="card">
          <p className="card-title">{t.contractSnapshot}</p>
          <div className="stack">
            <div>
              <div className="label">{t.activeContract}</div>
              <div>{contractLabel}</div>
            </div>
            <label>
              <span className="label">{t.overrideAddress}</span>
              <input
                className="input"
                value={addressOverride}
                onChange={(event) => setAddressOverride(event.target.value)}
                placeholder="0x..."
              />
            </label>
            <div>
              <div className="label">{t.supportedNetworks}</div>
              <div className="pill-row">
                {chainLabels.map((label) => (
                  <span key={label} className="badge">
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="note">
              {t.defaultChainId}: <strong>{DEFAULT_CHAIN_ID}</strong>
            </div>
          </div>
        </div>
      </header>

      <section className="grid">
        <div className="card">
          <p className="card-title">{t.readPanel}</p>
          <div className="stat">
            <span className="muted">{t.token}</span>
            <span>
              {tokenName} ({tokenSymbol})
            </span>
          </div>
          <div className="stat">
            <span className="muted">{t.totalSupply}</span>
            <span>
              {formatAmount(totalSupplyData)} {tokenSymbol}
            </span>
          </div>
          <div className="stat">
            <span className="muted">{t.decimals}</span>
            <span>{decimals}</span>
          </div>
          <div className="stat">
            <span className="muted">{t.owner}</span>
            <span className="stat-value address">{ownerData ?? t.na}</span>
          </div>
          <div className="stat">
            <span className="muted">{t.yourBalance}</span>
            <span>
              {formatAmount(balanceData)} {tokenSymbol}
            </span>
          </div>
          <div className="stat">
            <span className="muted">{t.allowanceSpender}</span>
            <span>
              {formatAmount(allowanceData)} {tokenSymbol}
            </span>
          </div>
          <div className="note">{t.allowanceHint}</div>
        </div>

        <div className="card">
          <p className="card-title">{t.actionConsole}</p>
          <div className="note">{actionMeta[action].description}</div>
          <div className="divider" />
          <form className="stack" onSubmit={handleSubmit}>
            <label>
              <span className="label">{t.actionLabel}</span>
              <select
                className="input"
                value={action}
                onChange={(event) => setAction(event.target.value as ActionKind)}
              >
                {Object.entries(actionMeta).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.title}
                  </option>
                ))}
              </select>
            </label>
            {needsFrom && (
              <label>
                <span className="label">{t.fromAddress}</span>
                <input
                  className="input"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  placeholder="0x..."
                />
              </label>
            )}
            {needsTo && (
              <label>
                <span className="label">{t.toAddress}</span>
                <input
                  className="input"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  placeholder="0x..."
                />
              </label>
            )}
            {needsSpender && (
              <label>
                <span className="label">{t.spenderAddress}</span>
                <input
                  className="input"
                  value={spender}
                  onChange={(event) => setSpender(event.target.value)}
                  placeholder="0x..."
                />
              </label>
            )}
            {needsAmount && (
              <label>
                <span className="label">{t.amountLabel(tokenSymbol)}</span>
                <input
                  className="input"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0.0"
                />
              </label>
            )}
            <button
              className="button primary"
              type="submit"
              disabled={!readEnabled || isWriting || isConfirming}
            >
              {isWriting || isConfirming
                ? t.processing
                : actionMeta[action].button}
            </button>
          </form>
          <div className="divider" />
          {!readEnabled && (
            <div className="status warn">
              {t.provideContract}
            </div>
          )}
          {txError && <div className="status warn">{txError}</div>}
          {txHash && (
            <div className={`status ${isConfirmed ? "ok" : ""}`}>
              {isConfirmed ? t.confirmedTx : t.pendingTx}:{" "}
              {txHash.slice(0, 10)}...{txHash.slice(-6)}
            </div>
          )}
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <p className="card-title">{t.whyTitle}</p>
          <ul className="stack">
            {t.whyBullets.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <p className="card-title">{t.techNotes}</p>
          <div className="stack">
            <div>
              <div className="label">{t.stack}</div>
              <div>{t.stackDescription}</div>
            </div>
            <div>
              <div className="label">{t.contract}</div>
              <div>{t.contractDescription}</div>
            </div>
            <div className="note">{t.chainHint}</div>
          </div>
        </div>
      </section>
    </main>
  );
}


