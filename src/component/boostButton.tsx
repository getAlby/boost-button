import { LightningAddress } from "alby-tools";
import React, { useState } from "react";
import { WebLNProvider } from '@webbtc/webln-types';

export type BoostButtonProps = {
  lnurl: string;
  expanded?: boolean;
}

export const BoostButton: React.FC<BoostButtonProps> = ({
  lnurl,
  expanded = false
}) => {
  const [webLNDisabled, setWebLNDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const [sats, setSats] = useState(0);
  const [sent, setSent] = useState(false);

  const [hold, setHold] = useState(false);
  const [timer, setTimer] = useState<number>();
  const [holdTimer, setHoldTimer] = useState<number>();

  const [expand, setExpand] = useState(expanded);
  const [satsClicked, setSatsClicked] = useState(0);

  const sendSatsToLnurl = async () => {
    setLoading(true);
    try {
      const webln: WebLNProvider | undefined = window.webln;
      if (!webln) {
        throw new Error("WebLN is missing");
      }
      await webln.enable();
      const result = await webln.lnurl(lnurl);
      if (result) {
        console.log(result);
        // Don't know how many sats are sent
        setSent(true);
      }
    } catch (e) {
      if (e instanceof Error) {
        if (e.message !== "Prompt was closed" && e.message !== "User rejected")
          setWebLNDisabled(true);
          console.error(e.message);
      }
    } finally {
      setLoading(false);
      setHold(false);
    }
  };

  const generateInvoice = async (satsClicked: number) => {
    setLoading(true);
    if (!satsClicked) return;
    const ln = new LightningAddress(lnurl);
    const invoice = await ln.generateInvoice({
      amount: (satsClicked * 1000).toString(),
    });
    if (!window.webln) {
    }
    try {
      const webln: WebLNProvider | undefined = window.webln;
      if (!webln) {
        throw new Error("WebLN is missing");
      }
      await webln.enable();
      const result = await webln.sendPayment(invoice.paymentRequest);
      if (result) {
        setSats(satsClicked);
        setSent(true);
      }
    } catch (e) {
      if (e instanceof Error) {
      setSatsClicked(0);
      console.error(e.message);
      if (e.message !== "Prompt was closed" && e.message !== "User rejected")
        setWebLNDisabled(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const timesClicked = satsClicked / 1000;

  return (
    <button
      className={`${
        !webLNDisabled && !satsClicked && !sent
          ? "ripple-shadow"
          : "normal-shadow"
      } ${!webLNDisabled ? "boost" : "disabled-boost"}`}
      onClick={() => {
        if (loading || webLNDisabled || sent || hold) return;
        if (timer) clearTimeout(timer);
        if (holdTimer) clearTimeout(holdTimer);
        setTimer(
          window.setTimeout(() => {
            generateInvoice(satsClicked + 1000);
          }, 1000)
        );
        setSatsClicked(satsClicked + 1000);
      }}
      onMouseDown={() => {
        if (loading || webLNDisabled || sent || hold || loading) return;
        setHoldTimer(
          window.setTimeout(() => {
            setHold(true);
            setSatsClicked(0);
            sendSatsToLnurl();
          }, 2000)
        );
      }}
      onMouseOver={() => !expand && setExpand(true)}
      onMouseEnter={() => setExpand(true)}
      onMouseLeave={() => setExpand(expanded)}
    >
      <style>
        {`
        button {
          border: none;
          background-color: #FFDE6E;
          border-radius: 24px;
          padding: 4px;
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        button:after { 
          content: "${
            webLNDisabled
              ? "Enable WebLN and refresh"
              : "Long press for custom boost"
          }";
          white-space: nowrap;
          font-family: Inter;
          position: absolute;
          top: -25px;
          left: calc(50% - 63px);
          width: 110px;
          font-size: 8px;
          padding: 4px 8px;
          border-radius: 12px;
          background-color: #404040;
          color: white;
          display: ${!satsClicked && expand && !sent && !hold ? "block" : "none"};
          opacity: ${!satsClicked && expand && !sent && !hold ? 1 : 0};
          transition: opacity 0.5s ease-out;
        }
        button div {
          box-sizing: content-box;
          font-family: Inter;
          font-size: 16px;
          color: #000000;
          transition: opacity 0.25s ease-out, width 0.25s ease-out, max-width 0.25s ease-out;
          white-space: nowrap;
          overflow: hidden;
          opacity: ${expand ? 1 : 0};
          padding: ${expand ? "0 15px 0 5px" : "0"};
          max-width: ${expand ? (!sent ? "80px" : "120px") : "0"};
        }
        .disabled-boost #lightning {
          opacity: 0.5;
        }

        .shake {
          animation: shake 2s;
          animation-iteration-count: infinite;
        }
        @keyframes shake {
          0% { transform: rotate(0deg); }
          2.5% { transform: rotate(-5deg); }
          5% { transform: rotate(-10deg); }
          10% { transform: rotate(0deg); }
          15% { transform: rotate(10deg); }
          17.5% { transform: rotate(5deg); }
          20%, 100% { transform:rotate(0deg); }
        }
        .ripple-shadow {
          animation: ripple 2s;
          animation-iteration-count: infinite;
        }
        .normal-shadow {
          box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.2);
        }
        @keyframes ripple {
          0% {
            box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.04),
                        0 0 0 8px rgba(0, 0, 0, 0.04),
                        0 0 0 12px rgba(0, 0, 0, 0.04),
                        0 0 0 16px rgba(0, 0, 0, 0.04),
                        0 0 10px 5px rgba(0, 0, 0, 0.2);
          }
          100% {
            box-shadow: 0 0 0 8px rgba(0, 0, 0, 0.04),
                        0 0 0 12px rgba(0, 0, 0, 0.04),
                        0 0 0 16px rgba(0, 0, 0, 0.04),
                        0 0 0 20px rgba(0, 0, 0, 0),
                        0 0 10px 5px rgba(0, 0, 0, 0.2);
          }
        }
        .boost:active #lightning {
          animation: ${!sent ? "pop 0.5s" : ""};
          animation-iteration-count: infinite;
        }
        @keyframes pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        #loading {
          animation: rotate 1s steps(6, end) infinite;
        }
        @keyframes rotate {
          to {
            transform: rotate(360deg);
          }
        }`}
      </style>
      {loading ? (
        <svg id="loading" width="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.507 4.908C15.0044 5.22631 16.3626 6.01043 17.387 7.148" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M17.388 16.851C16.3636 17.9886 15.0054 18.7727 13.508 19.091M10.493 19.092C8.9956 18.7737 7.6374 17.9896 6.61299 16.852M5.10499 14.24C4.63203 12.7841 4.63203 11.2159 5.10499 9.75999M6.61199 7.149C7.6364 6.01142 8.9946 5.2273 10.492 4.909M18.895 9.75999C19.368 11.2159 19.368 12.7841 18.895 14.24" stroke="black" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg
          id="lightning"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="black"
          width="40px"
          className={`${
            !webLNDisabled && !satsClicked && !sent ? "shake" : ""
          }`}
        >
          <defs>
            <linearGradient
              x1="50%"
              x2="50%"
              y1="0%"
              y2="100%"
              id="left-to-right"
            >
              <stop
                offset={satsClicked ? 1 - (timesClicked % 5) / 4 : 1}
                stopColor="#fff"
              />
              <stop
                offset={satsClicked ? 1 - (timesClicked % 5) / 4 : 1}
                stopColor="#ff9900"
              />
            </linearGradient>
          </defs>
          <path
            fill="url(#left-to-right)"
            d="M18.496 10.709l-8.636 8.88c-.24.246-.638-.039-.482-.345l3.074-6.066a.3.3 0 00-.268-.436H5.718a.3.3 0 01-.214-.51l8.01-8.115c.232-.235.618.023.489.328L11.706 9.86a.3.3 0 00.28.417l6.291-.078a.3.3 0 01.22.509z"
          />
        </svg>
      )}
      <div>
        {!webLNDisabled
          ? !sent
            ? satsClicked
              ? `${satsClicked} sats`
              : `Boost`
            : `${sats} sats sent`
          : `No WebLN`}
      </div>
    </button>
  );
}
