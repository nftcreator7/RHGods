onClick={() => {
  if (typeof window !== "undefined" && window.ethereum) {
    connect({ connector: (window as any).ethereum });
  } else {
    alert("Please install a wallet");
  }
}}
