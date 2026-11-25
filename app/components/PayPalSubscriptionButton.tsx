"use client";

import Script from "next/script";
import { useCallback, useRef, useState } from "react";

const PAYPAL_CLIENT_ID = "BAAzkOZ5ztLDwqV1tjSqkCv_ffHcg95JjUvB6ZSlXdxgEqIMoJLAId_YUrbRnPXCR6qFOhlm7kXDWKfOTs";
const PAYPAL_PLAN_ID = "P-00X34804KH482102MNMDUEZY";
const PAYPAL_SCRIPT_URL = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;

interface PayPalSubscriptionActions {
  subscription: {
    create: (details: { plan_id: string; quantity: number }) => Promise<string>;
  };
}

interface PayPalApprovalData {
  subscriptionID: string;
}

interface PayPalButtonOptions {
  style: {
    shape: "rect";
    color: "gold";
    layout: "vertical";
    label: "paypal";
  };
  createSubscription: (data: unknown, actions: PayPalSubscriptionActions) => Promise<string>;
  onApprove: (data: PayPalApprovalData) => void;
  onError: (error: unknown) => void;
}

interface PayPalSdk {
  Buttons: (options: PayPalButtonOptions) => {
    render: (container: HTMLElement) => Promise<void>;
  };
}

declare global {
  interface Window {
    paypal?: PayPalSdk;
  }
}

export default function PayPalSubscriptionButton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const reportButtonError = useCallback((cause: unknown) => {
    console.error("PayPal subscription button failed.", cause);
    renderedRef.current = false;
    setError("Unable to display PayPal. Please reload the page and try again.");
  }, []);

  const handleReady = useCallback(() => {
    const container = containerRef.current;
    if (!container || renderedRef.current) return;

    const paypal = window.paypal;
    if (!paypal) {
      reportButtonError(new Error("PayPal SDK loaded without exposing its Buttons API."));
      return;
    }

    renderedRef.current = true;
    try {
      void paypal.Buttons({
        style: {
          shape: "rect",
          color: "gold",
          layout: "vertical",
          label: "paypal",
        },
        createSubscription: (_data, actions) =>
          actions.subscription.create({
            plan_id: PAYPAL_PLAN_ID,
            quantity: 1,
          }),
        onApprove: (data) => window.alert(data.subscriptionID),
        onError: reportButtonError,
      }).render(container).catch(reportButtonError);
    } catch (cause) {
      reportButtonError(cause);
    }
  }, [reportButtonError]);

  return (
    <>
      <Script
        id="paypal-subscription-sdk"
        src={PAYPAL_SCRIPT_URL}
        strategy="afterInteractive"
        data-sdk-integration-source="button-factory"
        onReady={handleReady}
        onError={(event) => {
          console.error("PayPal SDK failed to load.", event);
          setError("PayPal could not be loaded. Please reload the page and try again.");
        }}
      />
      <div className="paypal-subscription-widget">
        <div id="paypal-button-container-P-00X34804KH482102MNMDUEZY" ref={containerRef} />
        {error && <p className="paypal-subscription-error" role="alert">{error}</p>}
      </div>
    </>
  );
}
