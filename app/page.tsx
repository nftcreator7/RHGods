"use client";

import { useState, useEffect } from "react";
import { BrowserProvider, Contract, parseEther } from "ethers";

const CONTRACT_ADDRESS = "0xdF1122f3dC6BA4cc541A0b3EE3345dba7f227cB5";
const CORRECT_CHAIN_ID = BigInt(46630);
const MAX_SUPPLY = 3333;

const ABI = [
  "function mint(uint256 quantity) payable",
  "function totalMinted() view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
];

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [minted, setMinted] = useState(0);
  const [mintedImages, setMintedImages] = useState<string[]>([]);

  const checkNetwork = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const network = await provider.getNetwork();
      setWrongNetwork(network.chainId !== CORRECT_CHAIN_ID);
    } catch {
      setWrongNetwork(true);
    }
  };

  const fetchMinted = async () => {
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const contract = new Contract(CONTRACT_ADDRESS, ABI, provider);
      const total = await contract.totalMinted();
      setMinted(Number(total));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkNetwork();
    fetchMinted();
    if ((window as any).ethereum) {
      (window as any).ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("지갑을 설치해주세요");
      return;
    }

    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      await checkNetwork();
      await fetchMinted();
      setStatus("Wallet connected");
    } catch (err: any) {
      setStatus("Connection failed: " + err.message);
    }
  };

  const handleMint = async () => {
    if (!account || wrongNetwork) return;

    setLoading(true);
    setStatus("Minting...");
    setMintedImages([]);

    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

      const before = Number(await contract.totalMinted());

      const tx = await contract.mint(quantity, {
        value: parseEther((0.0005 * quantity).toFixed(4)),
      });

      setStatus("Transaction sent... waiting for confirmation");
      await tx.wait();

      const after = Number(await contract.totalMinted());
      setMinted(after);
      setStatus("Mint Successful!");

      // 민트된 토큰 이미지 불러오기
      const images: string[] = [];
      for (let id = before + 1; id <= after; id++) {
        try {
          const uri = await contract.tokenURI(id);
          const json = JSON.parse(atob(uri.split(",")[1]));
          images.push(json.image);
        } catch (e) {
          console.error(e);
        }
      }
      setMintedImages(images);
    } catch (err: any) {
      setStatus("Error: " + (err.reason || err.message).slice(0, 100));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ textAlign: "center", padding: "40px 20px", maxWidth: "520px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>RHGods</h1>
      <p style={{ color: "#888", marginBottom: "12px" }}>Fully On-Chain on Robinhood Chain</p>
      <p style={{ color: "#aaa", marginBottom: "30px", fontSize: "14px" }}>
        {minted} / {MAX_SUPPLY} minted
      </p>

      {wrongNetwork && (
        <div style={{ 
          background: "#7f1d1d", 
          color: "#fecaca", 
          padding: "12px", 
          borderRadius: "8px", 
          marginBottom: "20px",
          fontSize: "14px"
        }}>
          Wrong network. Please switch to Robinhood Chain Testnet.
        </div>
      )}

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
            disabled={loading || wrongNetwork}
            style={{
              background: loading || wrongNetwork ? "#555" : "#E3E5E4",
              color: "#000",
              padding: "14px 28px",
              fontSize: "16px",
              borderRadius: "8px",
              border: "none",
              cursor: loading || wrongNetwork ? "not-allowed" : "pointer",
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

          {mintedImages.length > 0 && (
            <div style={{ marginTop: "30px" }}>
              <p style={{ marginBottom: "12px", color: "#aaa" }}>Your new RHGods:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
                {mintedImages.map((img, i) => (
                  <img 
                    key={i} 
                    src={img} 
                    alt={`RHGod ${i}
