## Contracts (Foundry)

This folder contains the ERC-20 contract and its tests.

Core files
- `contracts/src/PlaygroundERC20.sol`
- `contracts/test/PlaygroundERC20.t.sol`

Build
```bash
forge build
```

Test
```bash
forge test
```

Format
```bash
forge fmt
```

Run a local chain
```bash
anvil
```

Deploy (local Anvil)
```bash
forge create src/PlaygroundERC20.sol:PlaygroundERC20 \
  --rpc-url http://127.0.0.1:8545 \
  --private-key <PRIVATE_KEY_FROM_ANVIL> \
  --constructor-args "Playground Token" "PLAY" 18 1000000000000000000000000 \
  --broadcast
```

Notes
- `--broadcast` sends a real transaction. Without it, Forge runs a dry-run only.
- The initial supply above is `1,000,000 * 10^18`.

<details>
<summary>Русский</summary>

В этой папке лежит ERC‑20 контракт и тесты.

Основные файлы
- `contracts/src/PlaygroundERC20.sol`
- `contracts/test/PlaygroundERC20.t.sol`

Сборка
```bash
forge build
```

Тесты
```bash
forge test
```

Форматирование
```bash
forge fmt
```

Локальная сеть
```bash
anvil
```

Деплой (локальный Anvil)
```bash
forge create src/PlaygroundERC20.sol:PlaygroundERC20 \
  --rpc-url http://127.0.0.1:8545 \
  --private-key <PRIVATE_KEY_FROM_ANVIL> \
  --constructor-args "Playground Token" "PLAY" 18 1000000000000000000000000 \
  --broadcast
```

Примечания
- `--broadcast` отправляет реальную транзакцию. Без него Forge делает только dry‑run.
- Начальное предложение в примере: `1,000,000 * 10^18`.
</details>
