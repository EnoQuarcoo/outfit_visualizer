import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./SharePage.css";

const SharePage = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('ref');
  const campaignId = import.meta.env.VITE_VIRLO_CAMPAIGN_ID;
  const [leaderboard, setLeaderboard] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchLeaderboard() {
      const response = await fetch(
        `https://virlo-production.up.railway.app/campaigns/${campaignId}/leaderboard`,
      );
      const data = await response.json();
      setLeaderboard(data.leaderboard);
    }
    fetchLeaderboard();
  }, []);

  const referralUrl = `https://abrima.fit/?ref=${code}`;

  function handleCopy() {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="share-page">
      {/* ── Referral link section ─────────────────────────────────────────── */}
      <section className="share-hero">
        <div className="section-label">Your referral link</div>
        <h1 className="share-title">The more you share, the sooner you&apos;re in.</h1>
        <p className="share-subtitle">
           Share with your friends to get early access.
        </p>
        <div className="referral-row">
          <span className="referral-url">{referralUrl}</span>
          <button
            className={`copy-btn${copied ? " copied" : ""}`}
            onClick={handleCopy}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </section>

      {/* ── Leaderboard section ───────────────────────────────────────────── */}
      <section className="leaderboard-section">
        <h2 className="leaderboard-title">Leaderboard</h2>
        <ol className="leaderboard-list">
          {leaderboard.map((person, index) => {
            const isCurrentUser = person.referral_code === code;
            return (
              <li
                key={index + 1}
                className={`leaderboard-row${isCurrentUser ? " leaderboard-row--me" : ""}`}
              >
                <span className="leaderboard-rank">{index + 1}</span>
                <span className="leaderboard-name">{person.name}</span>
                {isCurrentUser && (
                  <span className="leaderboard-you">You</span>
                )}
                <span className="leaderboard-count">
                  {person.referral_count}{" "}
                  {person.referral_count === 1 ? "referral" : "referrals"}
                </span>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
};

export default SharePage;
