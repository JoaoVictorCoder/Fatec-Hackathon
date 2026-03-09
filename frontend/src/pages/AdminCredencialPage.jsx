import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAdminCredentialById, updateAdminCredential } from "../api/platformApi";
import AdminCredencialView from "../components/AdminCredencialView";
import { t } from "../locales";

export default function AdminCredencialPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  async function reload() {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminCredentialById(id);
      setData(response);
    } catch (loadError) {
      setError(loadError.message || t("credentialPage.fallbackNotFound"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, [id]);

  return (
    <AdminCredencialView
      data={data}
      loading={loading}
      saving={saving}
      error={error}
      onSave={async (payload) => {
        setSaving(true);
        setError("");
        try {
          const updated = await updateAdminCredential(id, payload);
          setData(updated);
        } catch (saveError) {
          setError(saveError.message || t("credentialPage.fallbackSaveError"));
        } finally {
          setSaving(false);
        }
      }}
    />
  );
}
