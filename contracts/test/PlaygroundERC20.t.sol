// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/PlaygroundERC20.sol";

contract PlaygroundERC20Test is Test {
    PlaygroundERC20 private token;

    address private alice = address(0xA11CE);
    address private bob = address(0xB0B);
    address private spender = address(0x5A5E7D);

    string private constant TOKEN_NAME = "Playground Token";
    string private constant TOKEN_SYMBOL = "PLAY";
    uint8 private constant TOKEN_DECIMALS = 18;
    uint256 private constant INITIAL_SUPPLY = 1_000_000 * 10 ** 18;

    function setUp() public {
        token = new PlaygroundERC20(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, INITIAL_SUPPLY);
    }

    function testMetadata() public {
        assertEq(token.name(), TOKEN_NAME);
        assertEq(token.symbol(), TOKEN_SYMBOL);
        assertEq(token.decimals(), TOKEN_DECIMALS);
    }

    function testInitialSupplyMintedToOwner() public {
        assertEq(token.totalSupply(), INITIAL_SUPPLY);
        assertEq(token.balanceOf(address(this)), INITIAL_SUPPLY);
    }

    function testTransferMovesBalanceAndEmits() public {
        uint256 amount = 5 * 10 ** 18;

        vm.expectEmit(true, true, false, true);
        emit PlaygroundERC20.Transfer(address(this), alice, amount);

        bool success = token.transfer(alice, amount);
        assertTrue(success);
        assertEq(token.balanceOf(address(this)), INITIAL_SUPPLY - amount);
        assertEq(token.balanceOf(alice), amount);
    }

    function testTransferToZeroAddressReverts() public {
        vm.expectRevert("ERC20: transfer to the zero address");
        token.transfer(address(0), 1);
    }

    function testTransferExceedsBalanceReverts() public {
        vm.prank(alice);
        vm.expectRevert("ERC20: transfer amount exceeds balance");
        token.transfer(bob, 1);
    }

    function testApproveSetsAllowanceAndEmits() public {
        uint256 amount = 123 * 10 ** 18;

        vm.expectEmit(true, true, false, true);
        emit PlaygroundERC20.Approval(address(this), spender, amount);

        bool success = token.approve(spender, amount);
        assertTrue(success);
        assertEq(token.allowance(address(this), spender), amount);
    }

    function testApproveToZeroAddressReverts() public {
        vm.expectRevert("ERC20: approve to the zero address");
        token.approve(address(0), 1);
    }

    function testAllowanceOverwrite() public {
        assertTrue(token.approve(spender, 100));
        assertEq(token.allowance(address(this), spender), 100);

        assertTrue(token.approve(spender, 25));
        assertEq(token.allowance(address(this), spender), 25);
    }

    function testTransferFromSpendsAllowance() public {
        uint256 amount = 250 * 10 ** 18;

        assertTrue(token.approve(spender, amount));

        vm.prank(spender);
        bool success = token.transferFrom(address(this), bob, amount);
        assertTrue(success);

        assertEq(token.allowance(address(this), spender), 0);
        assertEq(token.balanceOf(bob), amount);
        assertEq(token.balanceOf(address(this)), INITIAL_SUPPLY - amount);
    }

    function testTransferFromInsufficientAllowanceReverts() public {
        assertTrue(token.approve(spender, 10));

        vm.prank(spender);
        vm.expectRevert("ERC20: insufficient allowance");
        token.transferFrom(address(this), bob, 11);
    }

    function testTransferFromExceedsBalanceReverts() public {
        vm.prank(alice);
        assertTrue(token.approve(spender, 50));

        vm.prank(spender);
        vm.expectRevert("ERC20: transfer amount exceeds balance");
        token.transferFrom(alice, bob, 50);
    }

    function testIncreaseAllowanceUpdatesAndEmits() public {
        uint256 addedValue = 15 * 10 ** 18;

        vm.expectEmit(true, true, false, true);
        emit PlaygroundERC20.Approval(address(this), spender, addedValue);

        bool success = token.increaseAllowance(spender, addedValue);
        assertTrue(success);
        assertEq(token.allowance(address(this), spender), addedValue);
    }

    function testDecreaseAllowanceUpdatesAndEmits() public {
        assertTrue(token.approve(spender, 20 * 10 ** 18));
        uint256 newAllowance = 5 * 10 ** 18;

        vm.expectEmit(true, true, false, true);
        emit PlaygroundERC20.Approval(address(this), spender, newAllowance);

        bool success = token.decreaseAllowance(spender, 15 * 10 ** 18);
        assertTrue(success);
        assertEq(token.allowance(address(this), spender), newAllowance);
    }

    function testDecreaseAllowanceBelowZeroReverts() public {
        assertTrue(token.approve(spender, 10));
        vm.expectRevert("ERC20: decreased allowance below zero");
        token.decreaseAllowance(spender, 11);
    }

    function testBurnDecreasesSupplyAndBalance() public {
        uint256 amount = 100 * 10 ** 18;
        uint256 supplyBefore = token.totalSupply();

        vm.expectEmit(true, true, false, true);
        emit PlaygroundERC20.Transfer(address(this), address(0), amount);

        bool success = token.burn(amount);
        assertTrue(success);
        assertEq(token.totalSupply(), supplyBefore - amount);
        assertEq(token.balanceOf(address(this)), INITIAL_SUPPLY - amount);
    }

    function testBurnExceedsBalanceReverts() public {
        assertTrue(token.transfer(alice, 10));
        vm.prank(alice);
        vm.expectRevert("ERC20: burn amount exceeds balance");
        token.burn(11);
    }

    function testBurnFromSpendsAllowance() public {
        uint256 amount = 50 * 10 ** 18;
        uint256 supplyBefore = token.totalSupply();

        assertTrue(token.approve(spender, amount));

        vm.expectEmit(true, true, false, true);
        emit PlaygroundERC20.Transfer(address(this), address(0), amount);

        vm.prank(spender);
        bool success = token.burnFrom(address(this), amount);
        assertTrue(success);
        assertEq(token.allowance(address(this), spender), 0);
        assertEq(token.totalSupply(), supplyBefore - amount);
        assertEq(token.balanceOf(address(this)), INITIAL_SUPPLY - amount);
    }

    function testBurnFromInsufficientAllowanceReverts() public {
        assertTrue(token.approve(spender, 9));

        vm.prank(spender);
        vm.expectRevert("ERC20: insufficient allowance");
        token.burnFrom(address(this), 10);
    }

    function testBurnFromExceedsBalanceReverts() public {
        assertTrue(token.transfer(alice, 10));
        vm.prank(alice);
        assertTrue(token.approve(spender, 20));

        vm.prank(spender);
        vm.expectRevert("ERC20: burn amount exceeds balance");
        token.burnFrom(alice, 11);
    }

    function testMintOnlyOwnerRevertsForNonOwner() public {
        vm.prank(alice);
        vm.expectRevert("Owner: caller is not the owner");
        token.mint(alice, 1);
    }

    function testMintIncreasesSupplyAndBalance() public {
        uint256 amount = 777 * 10 ** 18;
        uint256 supplyBefore = token.totalSupply();

        vm.expectEmit(true, true, false, true);
        emit PlaygroundERC20.Transfer(address(0), bob, amount);

        bool success = token.mint(bob, amount);
        assertTrue(success);
        assertEq(token.totalSupply(), supplyBefore + amount);
        assertEq(token.balanceOf(bob), amount);
    }

    function testMintToZeroAddressReverts() public {
        vm.expectRevert("ERC20: mint to the zero address");
        token.mint(address(0), 1);
    }
}
