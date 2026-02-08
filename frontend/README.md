# Frontend (Next.js + Wagmi + Viem)

**English**
This UI connects to `PlaygroundERC20` and lets you read token state and send transactions from a wallet.

What you can do
- Read name, symbol, decimals, total supply, owner, balance, allowance
- Transfer, approve, transferFrom
- Mint (owner only), burn, burnFrom
- Increase/decrease allowance

Setup (Git Bash)
1. `cd /d/dev/Solidity/solidity-erc20-playground_git/frontend`
2. `npm install`
3. Copy `frontend/.env.local.example` to `frontend/.env.local`
4. Set your contract address in `frontend/.env.local`
5. `npm run dev`

Environment
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: deployed contract address
- `NEXT_PUBLIC_CHAIN_ID`: chain id, default `31337` (Anvil)

Notes
- If the UI shows “Not set”, it means the contract address is missing or invalid.
- After editing `.env.local`, restart `npm run dev`.

---

**Русский**
Этот интерфейс подключается к `PlaygroundERC20` и позволяет читать состояние токена и отправлять транзакции.

Что доступно
- Чтение name, symbol, decimals, totalSupply, owner, balance, allowance
- Transfer, approve, transferFrom
- Mint (только владелец), burn, burnFrom
- Увеличение/уменьшение allowance

Запуск (Git Bash)
1. `cd /d/dev/Solidity/solidity-erc20-playground_git/frontend`
2. `npm install`
3. Скопируйте `frontend/.env.local.example` в `frontend/.env.local`
4. Укажите адрес контракта в `frontend/.env.local`
5. `npm run dev`

Переменные окружения
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: адрес контракта
- `NEXT_PUBLIC_CHAIN_ID`: id сети, по умолчанию `31337` (Anvil)

Примечания
- Если в UI написано “Не задан”, значит адрес контракта не указан или неверный.
- После изменения `.env.local` перезапустите `npm run dev`.
