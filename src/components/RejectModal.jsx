import React, { useState, useEffect } from "react";
import { Modal, TextArea, Button, Toast } from "antd-mobile";
import { updateTaskStatus } from "../services/taskList.service";

export const RejectModal = ({ isOpen, onClose, linearId, onRefresh }) => {
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRejectReason("");
      setRejectLoading(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setRejectReason("");
    setRejectLoading(false);
    onClose();
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      Toast.show({
        icon: "fail",
        content: "Rədd səbəbi mütləq qeyd edilməlidir",
      });
      return;
    }

    setRejectLoading(true);
    try {
      await updateTaskStatus({
        linear_id: linearId,
        status: "reject",
        reason: rejectReason.trim(),
      });
      Toast.show({
        icon: "success",
        content: "Tapşırıq rədd edildi",
      });
      handleClose();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error handling reject:", err);
      Toast.show({
        icon: "fail",
        content: err.response?.data?.message || "Xəta baş verdi",
      });
    } finally {
      setRejectLoading(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      onClose={!rejectLoading ? handleClose : undefined}
      closeOnMaskClick={!rejectLoading}
      title={<div style={{ fontWeight: 600, fontSize: 18 }}>İmtina səbəbi</div>}
      content={
        <div style={{ padding: "0 10px" }}>
          <TextArea
            placeholder="Buraya yazın..."
            value={rejectReason}
            onChange={(val) => setRejectReason(val)}
            disabled={rejectLoading}
            autoSize={{ minRows: 4, maxRows: 6 }}
            style={{
              backgroundColor: "var(--input-bg)",
              color: "var(--input-text)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "8px",
              fontSize: "14px",
              '--color': 'var(--input-text)'
            }}
          />
        </div>
      }
      actions={[
        {
          key: "cancel",
          text: "Ləğv et",
          disabled: rejectLoading,
          onClick: handleClose,
          style: { color: "var(--muted-text)" }
        },
        {
          key: "submit",
          text: rejectLoading ? "Göndərilir..." : "Təsdiq et",
          disabled: rejectLoading || !rejectReason.trim(),
          primary: true,
          onClick: handleRejectSubmit,
          style: {
            color: (rejectLoading || !rejectReason.trim()) ? "var(--muted-text)" : "#fff",
            backgroundColor: (rejectLoading || !rejectReason.trim()) ? "var(--border)" : "var(--primary-color)",
            fontWeight: 600
          }
        },
      ]}
    />
  );
};
