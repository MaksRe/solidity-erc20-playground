// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title PlaygroundERC20
/// @notice A basic ERC-20 implementation with owner-controlled minting.
contract PlaygroundERC20 {
    /// @notice Emitted when tokens are transferred, including minting and burning.
    event Transfer(address indexed from, address indexed to, uint256 value);

    /// @notice Emitted when an allowance is set by `owner` for `spender`.
    event Approval(address indexed owner, address indexed spender, uint256 value);

    string private _name;
    string private _symbol;
    uint8 private _decimals;

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    /// @notice Address allowed to mint new tokens.
    address public owner;

    /// @notice Restricts a function to the current owner.
    modifier onlyOwner() {
        require(msg.sender == owner, "Owner: caller is not the owner");
        _;
    }

    /// @notice Creates a new token with optional initial supply.
    /// @param name_ Token name.
    /// @param symbol_ Token symbol.
    /// @param decimals_ Number of decimals used for display.
    /// @param initialSupply_ Amount of tokens minted to the deployer.
    constructor(string memory name_, string memory symbol_, uint8 decimals_, uint256 initialSupply_) {
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
        owner = msg.sender;

        if (initialSupply_ > 0) {
            _mint(msg.sender, initialSupply_);
        }
    }

    /// @notice Returns the token name.
    function name() external view returns (string memory) {
        return _name;
    }

    /// @notice Returns the token symbol.
    function symbol() external view returns (string memory) {
        return _symbol;
    }

    /// @notice Returns the number of decimals used for display.
    function decimals() external view returns (uint8) {
        return _decimals;
    }

    /// @notice Returns the total token supply.
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    /// @notice Returns the token balance of a specific account.
    /// @param account Address to query.
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    /// @notice Returns the remaining allowance that `spender` can use from `owner_`.
    /// @param owner_ Token holder who approved the allowance.
    /// @param spender Address allowed to spend.
    function allowance(address owner_, address spender) external view returns (uint256) {
        return _allowances[owner_][spender];
    }

    /// @notice Transfers tokens from the caller to `to`.
    /// @param to Recipient address.
    /// @param amount Amount of tokens to transfer.
    /// @return True if the transfer succeeds.
    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    /// @notice Approves `spender` to spend `amount` on behalf of the caller.
    /// @param spender Address allowed to spend.
    /// @param amount Allowance amount.
    /// @return True if the approval succeeds.
    function approve(address spender, uint256 amount) external returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    /// @notice Transfers tokens from `from` to `to` using the caller's allowance.
    /// @param from Token owner address.
    /// @param to Recipient address.
    /// @param amount Amount of tokens to transfer.
    /// @return True if the transfer succeeds.
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        require(currentAllowance >= amount, "ERC20: insufficient allowance");

        unchecked {
            _approve(from, msg.sender, currentAllowance - amount);
        }
        _transfer(from, to, amount);
        return true;
    }

    /// @notice Increases the allowance granted to `spender` by the caller.
    /// @param spender Address allowed to spend.
    /// @param addedValue Amount added to the current allowance.
    /// @return True if the allowance update succeeds.
    function increaseAllowance(address spender, uint256 addedValue) external returns (bool) {
        uint256 currentAllowance = _allowances[msg.sender][spender];
        _approve(msg.sender, spender, currentAllowance + addedValue);
        return true;
    }

    /// @notice Decreases the allowance granted to `spender` by the caller.
    /// @param spender Address allowed to spend.
    /// @param subtractedValue Amount subtracted from the current allowance.
    /// @return True if the allowance update succeeds.
    function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool) {
        uint256 currentAllowance = _allowances[msg.sender][spender];
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked {
            _approve(msg.sender, spender, currentAllowance - subtractedValue);
        }
        return true;
    }

    /// @notice Burns tokens from the caller, reducing total supply.
    /// @param amount Amount of tokens to burn.
    /// @return True if burning succeeds.
    function burn(uint256 amount) external returns (bool) {
        _burn(msg.sender, amount);
        return true;
    }

    /// @notice Burns tokens from `from` using the caller's allowance.
    /// @param from Token owner address.
    /// @param amount Amount of tokens to burn.
    /// @return True if burning succeeds.
    function burnFrom(address from, uint256 amount) external returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        require(currentAllowance >= amount, "ERC20: insufficient allowance");

        unchecked {
            _approve(from, msg.sender, currentAllowance - amount);
        }
        _burn(from, amount);
        return true;
    }

    /// @notice Mints new tokens to `to`. Only callable by the owner.
    /// @param to Recipient of newly minted tokens.
    /// @param amount Amount of tokens to mint.
    /// @return True if minting succeeds.
    function mint(address to, uint256 amount) external onlyOwner returns (bool) {
        _mint(to, amount);
        return true;
    }

    /// @notice Moves tokens between two addresses.
    /// @param from Address sending tokens.
    /// @param to Address receiving tokens.
    /// @param amount Amount of tokens to move.
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");

        unchecked {
            _balances[from] = fromBalance - amount;
        }
        _balances[to] += amount;

        emit Transfer(from, to, amount);
    }

    /// @notice Sets an allowance from `owner_` to `spender`.
    /// @param owner_ Address that owns the tokens.
    /// @param spender Address allowed to spend the tokens.
    /// @param amount Allowance amount.
    function _approve(address owner_, address spender, uint256 amount) internal {
        require(owner_ != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner_][spender] = amount;
        emit Approval(owner_, spender, amount);
    }

    /// @notice Creates new tokens and assigns them to `to`.
    /// @param to Recipient of the newly minted tokens.
    /// @param amount Amount of tokens to mint.
    function _mint(address to, uint256 amount) internal {
        require(to != address(0), "ERC20: mint to the zero address");

        _totalSupply += amount;
        _balances[to] += amount;

        emit Transfer(address(0), to, amount);
    }

    /// @notice Destroys tokens from `from`, reducing total supply.
    /// @param from Address whose tokens are burned.
    /// @param amount Amount of tokens to burn.
    function _burn(address from, uint256 amount) internal {
        require(from != address(0), "ERC20: burn from the zero address");

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: burn amount exceeds balance");

        unchecked {
            _balances[from] = fromBalance - amount;
        }
        _totalSupply -= amount;

        emit Transfer(from, address(0), amount);
    }
}
