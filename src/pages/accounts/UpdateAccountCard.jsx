import React, { useEffect, useState } from "react";
import { Card, Form, Input, Button, Selector, Toast } from "antd-mobile";
import { EditSOutline } from "antd-mobile-icons";
import { getPartners, updateAccount } from "../../services/user.service";
import { getCurrentUser } from "../../services/auth.services";

export default function UpdateAccountCard({ account, themeStyles, onUpdateSuccess }) {
  const [partners, setPartners] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    let mounted = true;
    getCurrentUser().then((res) => {
      if (!mounted) return;
      const userRole = res?.data?.role || res?.role || "superadmin";
      setRole(userRole);

      if (userRole === "superadmin") {
        getPartners()
          .then((pRes) => {
            if (!mounted) return;
            const list = pRes?.data || [];
            setPartners(Array.isArray(list) ? list : []);
          })
          .catch((err) => console.error("Failed to load partners:", err));
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (account) {
      form.setFieldsValue({
        name: account.name || "",
        lastname: account.lastname || "",
        email: account.email || "",
        phone: account.phone || "",
        status: account.status !== undefined ? [account.status] : [1],
        partnerpin: account.partnerpin !== undefined ? [account.partnerpin] : [],
      });
    }
  }, [account, form]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const payload = {
        account: account.account || account.id,
        name: values.name,
        lastname: values.lastname,
        email: values.email,
        phone: values.phone,
        status: values.status?.[0],
        partnerpin: values.partnerpin?.[0],
      };

      await updateAccount(payload);
      Toast.show({
        icon: "success",
        content: "Məlumatlar yeniləndi",
      });
      if (onUpdateSuccess) {
        onUpdateSuccess();
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        icon: "fail",
        content: "Xəta baş verdi",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      style={{
        borderRadius: "16px",
        background: themeStyles?.cardBg || "#fff",
        border: `1px solid ${themeStyles?.border || "transparent"}`,
        boxShadow: themeStyles?.isDark ? "none" : "0 4px 16px rgba(0,0,0,0.04)",
      }}
      bodyStyle={{ padding: "16px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "16px",
          fontWeight: "700",
          marginBottom: "16px",
          color: themeStyles?.cardText,
        }}
      >
        <EditSOutline color="#1890ff" /> Məlumatları Yenilə
      </div>

      <Form
        form={form}
        onFinish={onFinish}
        layout="horizontal"
        footer={
          <Button
            block
            type="submit"
            color="primary"
            loading={loading}
            style={{ borderRadius: "8px" }}
          >
            Yadda Saxla
          </Button>
        }
      >
        <Form.Item name="name" label="Ad">
          <Input placeholder="Ad daxil edin" />
        </Form.Item>
        <Form.Item name="lastname" label="Soyad">
          <Input placeholder="Soyad daxil edin" />
        </Form.Item>
        <Form.Item
          name="email"
          label="E-poçt"
          rules={[{ type: "email", message: "Düzgün e-poçt daxil edin" }]}
        >
          <Input placeholder="E-poçt daxil edin" />
        </Form.Item>
        <Form.Item name="phone" label="Telefon">
          <Input placeholder="Telefon daxil edin" />
        </Form.Item>

        {role === "superadmin" && (
          <>
            <Form.Item name="status" label="Status">
              <Selector
                columns={2}
                options={[
                  { label: "Aktiv", value: 1 },
                  { label: "Deaktiv", value: 0 },
                ]}
              />
            </Form.Item>
            {partners.length > 0 && (
              <Form.Item name="partnerpin" label="Tərəfdaş">
                <Selector
                  columns={1}
                  options={partners.map((p) => ({
                    label: `${p.name} (${p.partnerPin})`,
                    value: p.partnerPin,
                  }))}
                />
              </Form.Item>
            )}
          </>
        )}
      </Form>
    </Card>
  );
}
