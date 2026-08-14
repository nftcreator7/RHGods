"use client";

import { useState, useEffect } from "react";
import { BrowserProvider, Contract, parseEther } from "ethers";

const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // 나중에 실제 주소로 변경

const ABI = [
  "function mint(uint256 quantity) payable",
];

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("지갑을 설치해주세요 (MetaMask 또는 Coinbase Wallet)");
      return;
    }

    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      setStatus("Wallet connected");
    } catch (err: any) {
      setStatus("Connection failed: " + err.message);
    }
  };

  const handleMint = async () => {
    if (!account) return;

    setLoading(true);
    setStatus("Minting...");

    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.mint(quantity, {
        value: parseEther((0.0005 * quantity).toString()),
      });

      setStatus("Transaction sent... waiting for confirmation");
      await tx.wait();
      setStatus("Mint Successful!");
    } catch (err: any) {
      setStatus("Error: " + (err.reason || err.message).slice(0, 100));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ textAlign: "center", padding: "40px 20px", maxWidth: "480px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>RHGods</h1>
      <p style={{ color: "#888", marginBottom: "40px" }}>Fully On-Chain on Robinhood Chain</p>

      {!account ? (
        <button
          onClick={connectWallet}
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
            {account.slice(0, 6)}...{account.slice(-4)}
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
            disabled={loading}
            style={{
              background: loading ? "#555" : "#E3E5E4",
              color: "#000",
              padding: "14px 28px",
              fontSize: "16px",
              borderRadius: "8px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "600",
              width: "100%",
              maxWidth: "280px",
            }}
          >
            {loading ? "Minting..." : `Mint ${quantity} for ${(0.0005 * quantity).toFixed(4)} ETH`}
          </button>

          {status && (
            <p style={{ marginTop: "24px", color: status.includes("Successful") ? "#4ade80" : "#aaa" }}>
              {status}
            </p>
          )}
        </div>
      )}
    </main>
  );
}
