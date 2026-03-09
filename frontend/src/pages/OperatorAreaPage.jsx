import { useEffect, useState } from "react";
import { listOperatorHistory, runOperatorCheckInValidation } from "../api/platformApi";
import OperatorConsole from "../components/OperatorConsole";

export default function OperatorAreaPage({ operator }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listOperatorHistory()
      .then((data) => setHistory(data.items || []))
      .catch(() => setHistory([]));
  }, []);

  return (
    <OperatorConsole
      operator={operator}
      history={history}
      loading={loading}
      onValidate={async (payload) => {
        setLoading(true);
        try {
          const result = await runOperatorCheckInValidation(payload);
          const historyData = await listOperatorHistory();
          setHistory(historyData.items || []);
          return result;
        } finally {
          setLoading(false);
        }
      }}
    />
  );
}
