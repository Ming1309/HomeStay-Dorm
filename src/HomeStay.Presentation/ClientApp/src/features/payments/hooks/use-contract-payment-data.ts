import { useEffect, useState, useCallback } from "react";
import {
  fetchContractPaymentQueue,
  fetchContractPaymentDetail,
  submitContractPayment,
  type HopDongChoThanhToanItem,
  type ChiTietThanhToanItem,
  type CollectPaymentRequest,
  type CollectPaymentResponse,
} from "../services/contract-payment-service";

export function useContractPaymentQueue() {
  const [items, setItems] = useState<HopDongChoThanhToanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetchContractPaymentQueue(controller.signal)
      .then(setItems)
      .catch((err: unknown) => {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const cleanup = refresh();
    return cleanup;
  }, [refresh]);

  return { items, loading, error, refresh };
}

export function useContractPaymentDetail(maHD: string | null) {
  const [detail, setDetail] = useState<ChiTietThanhToanItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!maHD) {
      setDetail(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetchContractPaymentDetail(maHD, controller.signal)
      .then(setDetail)
      .catch((err: unknown) => {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [maHD]);

  return { detail, loading, error };
}

export function useSubmitContractPayment() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (data: CollectPaymentRequest): Promise<CollectPaymentResponse | null> => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitContractPayment(data);
      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Lỗi không xác định";
      setError(message);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { submit, submitting, error };
}
