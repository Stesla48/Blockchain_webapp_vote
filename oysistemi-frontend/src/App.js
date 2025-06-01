import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import VotingABI from "./abi/VotingABI.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [candidate1Votes, setCandidate1Votes] = useState("0");
  const [candidate2Votes, setCandidate2Votes] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [electionActive, setElectionActive] = useState(true);

  // Toplam oy sayısı
  const totalVotes =
    parseInt(candidate1Votes) + parseInt(candidate2Votes);

  // Bar genişliği ve yüzde hesaplayan fonksiyon
  const getBarWidth = (vote, total) => {
    if (total === 0) return "0%";
    return `${((vote / total) * 100).toFixed(1)}%`;
  };

  // Metamask bağla
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const [selectedAccount] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(selectedAccount);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS,
          VotingABI,
          signer
        );
        setContract(contractInstance);
      } else {
        toast.error("Metamask yüklü değil.");
      }
    } catch (err) {
      toast.error("Cüzdan bağlantısı başarısız.");
    }
  };

  // Sözleşmeden verileri yükle
  const loadData = async () => {
    if (contract) {
      try {
        const c1 = await contract.candidate1Votes();
        const c2 = await contract.candidate2Votes();
        const isActive = await contract.isActive();
        setCandidate1Votes(c1.toString());
        setCandidate2Votes(c2.toString());
        setElectionActive(isActive);
      } catch (error) {
        toast.error("Veriler yüklenemedi.");
      }
    }
  };

  useEffect(() => {
    if (contract) {
      loadData();
    }
    // eslint-disable-next-line
  }, [contract, account]);

  // Oy ver
  const handleVote = async (candidate) => {
    if (!contract) return;
    setIsLoading(true);
    try {
      const tx = await contract.vote(candidate);
      await tx.wait();
      toast.success("Oyunuz başarıyla kaydedildi!");
      await loadData();
    } catch (error) {
      const message =
        error?.reason ||
        error?.error?.message ||
        "İşlem başarısız veya reddedildi.";
      toast.error(message);
    }
    setIsLoading(false);
  };

  // Seçimi sonlandır
  const endElection = async () => {
    if (!contract) return;
    setIsLoading(true);
    try {
      const tx = await contract.endVoting();
      await tx.wait();
      toast.success("Seçim başarıyla sonlandırıldı.");
      await loadData();
    } catch (error) {
      const message =
        error?.reason ||
        error?.error?.message ||
        "İşlem başarısız veya reddedildi.";
      toast.error(message);
    }
    setIsLoading(false);
  };

  return (
    <div className="app-container">
      <h1 className="main-title">Hangi Selim daha iyi?</h1>
      <div className="address-bar">
        <span>
          <strong>Adres:</strong>{" "}
          {account ? account : "Cüzdan bağlı değil"}
        </span>
      </div>

      {!electionActive && (
        <div className="info-banner">
          Seçim sona erdi. Oy vermek için geç kaldınız başka sefere!
        </div>
      )}

      {!account ? (
        <button className="connect-btn" onClick={connectWallet}>
          Cüzdanı Bağla
        </button>
      ) : (
        <>
          <div className="candidates-wrapper">
            {/* Aday 1 */}
            <div className="candidate-card">
              <div className="circle-photo">
                <img src="assets/Şişman ve çirkin Selim.png" alt="Aday 1" />
              </div>
              <h2 className="candidate-title">Şişman ve çirkin Selim(Aday 1)</h2>
              <div className="vote-count">Oy: {candidate1Votes}</div>
              <button
                className="vote-btn"
                onClick={() => handleVote(1)}
                disabled={isLoading}
              >
                Oy Ver
              </button>
            </div>
            {/* Aday 2 */}
            <div className="candidate-card">
              <div className="circle-photo">
                <img src="assets/Zayıf ve yakışıklı Selim.png" alt="Aday 2" />
              </div>
              <h2 className="candidate-title">Zayıf ve yakışıklı Selim(Aday 2)</h2>
              <div className="vote-count">Oy: {candidate2Votes}</div>
              <button
                className="vote-btn"
                onClick={() => handleVote(2)}
                disabled={isLoading}
              >
                Oy Ver
              </button>
            </div>
          </div>

          <div className="results-section">
            <button
              className="show-results-btn"
              onClick={() => setShowResults(!showResults)}
            >
              Sonuçları Göster
            </button>

            {showResults && (
              <div className="bar-chart-area">
                <h2>Sonuçlar:</h2>
                <div className="bar-chart">
                  <div className="bar-row">
                    <span className="bar-label">Aday 1</span>
                    <div className="bar-outer">
                      <div
                        className="bar aday1"
                        style={{
                          width: getBarWidth(
                            parseInt(candidate1Votes),
                            totalVotes
                          ),
                        }}
                      ></div>
                    </div>
                    <span className="bar-votes">
                      {candidate1Votes} oy (
                      {getBarWidth(parseInt(candidate1Votes), totalVotes)})
                    </span>
                  </div>
                  <div className="bar-row">
                    <span className="bar-label">Aday 2</span>
                    <div className="bar-outer">
                      <div
                        className="bar aday2"
                        style={{
                          width: getBarWidth(
                            parseInt(candidate2Votes),
                            totalVotes
                          ),
                        }}
                      ></div>
                    </div>
                    <span className="bar-votes">
                      {candidate2Votes} oy (
                      {getBarWidth(parseInt(candidate2Votes), totalVotes)})
                    </span>
                  </div>
                </div>
                <p>Aday 1 Oy: {candidate1Votes}</p>
                <p>Aday 2 Oy: {candidate2Votes}</p>
                <p>Toplam Oy: {totalVotes}</p>
              </div>
            )}
          </div>

          <button
            className="end-btn"
            onClick={endElection}
            disabled={isLoading}
          >
            Seçimi Sonlandır
          </button>
        </>
      )}

      {isLoading && <div className="loading-spinner"></div>}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
