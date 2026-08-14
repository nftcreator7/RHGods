"use client";

import { useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { injected } from "wagmi/connectors";
import { parseEther } from "viem";
import { useState } from "react";

// 나중에 Testnet에 배포한 컨트랙트 주소로 바꿀 예정
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;

const ABI = [
  {
    name: "mint",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "quantity", type: "uint256" }],
    outputs: [],
  },
] as const;

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
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
    <main style={{ textAlign: "center", padding: "40px 20px", maxWidth: "480px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>RHGods</h1>
      <p style={{ color: "#888", marginBottom: "40px" }}>Fully On-Chain on Robinhood Chain</p>

      {!isConnected ? (
        <button
          onClick={() => connect({ connector: injected() })}
          style={{
            background: "#E3E5E4",
            color: "#000",
            padding: "14px 28px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Connect Wallet
        </button>
      ) : (
        <div>
          <p style={{ marginBottom: "20px", fontSize: "14px", color: "#aaa" }}>
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ marginRight: "10px" }}>Quantity</label>
            <input
              type="number"
              min={1}
              max={10}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              style={{
                width: "70px",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #333",
                background: "#1a1a1a",
                color: "#fff",
                textAlign: "center",
              }}
            />
          </div>

          <button
            onClick={handleMint}
            disabled={isPending || isConfirming}
            style={{
              background: isPending || isConfirming ? "#555" : "#E3E5E4",
              color: "#000",
              padding: "14px 28px",
              fontSize: "16px",
              borderRadius: "8px",
              border: "none",
              cursor: isPending || isConfirming ? "not-allowed" : "pointer",
              fontWeight: "600",
              width: "100%",
              maxWidth: "280px",
            }}
          >
            {isPending || isConfirming
              ? "Minting..."
              : `Mint ${quantity} for ${(0.0005 * quantity).toFixed(4)} ETH`}
          </button>

          <button
            onClick={() => disconnect()}
            style={{
              marginTop: "16px",
              background: "transparent",
              color: "#888",
              border: "1px solid #333",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Disconnect
          </button>

          {isSuccess && (
            <p style={{ marginTop: "24px", color: "#4ade80" }}>
              Mint Successful!
            </p>
          )}

          {error && (
            <p style={{ marginTop: "24px", color: "#f87171", fontSize: "14px" }}>
              {error.message.slice(0, 120)}
            </p>
          )}
        </div>
      )}
    </main>
  );
}
