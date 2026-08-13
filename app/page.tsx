"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseEther } from "viem";
import { useState } from "react";

// 나중에 컨트랙트 주소와 ABI를 넣을 예정
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;

const ABI = [
  {
    name: "mint",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "quantity", type: "uint256" }],
    outputs: [],
  },
  {
    name: "MAX_SUPPLY",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

export default function Home() {
  const { isConnected } = useAccount();
  const [quantity, setQuantity] = useState(1);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleMint = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: "mint",
      args: [BigInt(quantity)],
      value: parseEther((0.0005 * quantity).toString()),
    });
  };

  return (
    <main style={{ textAlign: "center", padding: "40px 20px", maxWidth: "500px" }}>
      <h1 style={{ marginBottom: "10px", fontSize: "32px" }}>RHGods</h1>
      <p style={{ marginBottom: "30px", color: "#888" }}>Fully On-Chain on Robinhood Chain</p>

      <div style={{ marginBottom: "30px" }}>
        <ConnectButton />
      </div>

      {isConnected && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <label>Quantity: </label>
            <input
              type="number"
              min="1"
              max="10"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              style={{ width: "80px", marginLeft: "10px" }}
            />
          </div>

          <button
            onClick={handleMint}
            disabled={isPending || isConfirming}
            style={{
              background: isPending || isConfirming ? "#555" : "#E3E5E4",
              color: "#000",
              width: "100%",
              maxWidth: "300px",
            }}
          >
            {isPending || isConfirming ? "Minting..." : `Mint ${quantity} for ${(0.0005 * quantity).toFixed(4)} ETH`}
          </button>

          {isSuccess && (
            <p style={{ marginTop: "20px", color: "#4ade80" }}>
              Mint Successful!
            </p>
          )}

          {error && (
            <p style={{ marginTop: "20px", color: "#f87171" }}>
              Error: {error.message.slice(0, 100)}
            </p>
          )}
        </div>
      )}
    </main>
  );
}
