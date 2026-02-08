# solidity-erc20-playground

**English**
This repository is a compact ERC-20 playground: a Solidity token with full tests (Foundry) and a clean demo UI (Next.js + Wagmi + Viem). It focuses on core token mechanics and a simple end-to-end flow: deploy → connect wallet → interact.

Key features
- ERC-20 core functions (transfer, approve, transferFrom, allowances)
- Owner minting and user burning
- Detailed Foundry tests
- Frontend to read/write token state

Project structure
- `contracts/` Solidity contracts and Foundry tests
- `frontend/` Next.js UI
- `shared/` common artifacts (ABI/addresses if you want to sync them)

Prerequisites
- Foundry (`forge`, `anvil`)
- Node.js + npm

Quick start (local)
1. Start a local chain in Git Bash:
```bash
anvil
```
2. Deploy the token from `contracts/`:
```bash
cd /d/dev/Solidity/solidity-erc20-playground_git/contracts
forge create src/PlaygroundERC20.sol:PlaygroundERC20 \
  --rpc-url http://127.0.0.1:8545 \
  --private-key <PRIVATE_KEY_FROM_ANVIL> \
  --constructor-args "Playground Token" "PLAY" 18 1000000000000000000000000 \
  --broadcast
```
3. Set the address in `frontend/.env.local`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=31337
```
4. Run the UI:
```bash
cd /d/dev/Solidity/solidity-erc20-playground_git/frontend
npm install
npm run dev
```

---

**Русский**
Этот репозиторий — компактная песочница ERC-20: Solidity‑токен с полноценными тестами (Foundry) и аккуратным UI (Next.js + Wagmi + Viem). Цель — показать базовую механику токенов и полный цикл: деплой → подключение кошелька → взаимодействие.

Ключевые возможности
- Базовые функции ERC‑20 (transfer, approve, transferFrom, allowances)
- Минт от владельца и burn от пользователя
- Подробные тесты Foundry
- Фронтенд для чтения и записи состояния

Структура проекта
- `contracts/` Solidity‑контракты и тесты Foundry
- `frontend/` интерфейс Next.js
- `shared/` общие артефакты (ABI/адреса, если нужно синхронизировать)

Требования
- Foundry (`forge`, `anvil`)
- Node.js + npm

Быстрый запуск (локально)
1. Запустите локальную сеть в Git Bash:
```bash
anvil
```
2. Задеплойте токен из `contracts/`:
```bash
cd /d/dev/Solidity/solidity-erc20-playground_git/contracts
forge create src/PlaygroundERC20.sol:PlaygroundERC20 \
  --rpc-url http://127.0.0.1:8545 \
  --private-key <PRIVATE_KEY_FROM_ANVIL> \
  --constructor-args "Playground Token" "PLAY" 18 1000000000000000000000000 \
  --broadcast
```
3. Укажите адрес в `frontend/.env.local`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=31337
```
4. Запустите UI:
```bash
cd /d/dev/Solidity/solidity-erc20-playground_git/frontend
npm install
npm run dev
```
