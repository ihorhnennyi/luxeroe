// src/components/lead/ConsultSection.tsx
"use client";

import AnimatedCta from "@/components/hero/AnimatedCta";
import { Box, Container, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

type ModalState = { type: "ok" | "err"; text: string } | null;

export default function ConsultSection({
  title = "Потребуєте консультації?",
  subtitle = "Залиште свої контакти — ми зв’яжемося з вами найближчим часом.",
  submitUrl = "/api/lead",
}: {
  title?: string;
  subtitle?: string;
  submitUrl?: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+380");
  const [sending, setSending] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);

  const russet = "#B75C36";
  const closeModal = () => setModal(null);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeModal();
    document.addEventListener("keydown", onKey);
    const id = setTimeout(closeModal, 2500);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(id);
    };
  }, [modal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const valid =
      name.trim().length > 0 && /^\+?\d[\d\s-]{8,}$/.test(phone.trim());
    if (!valid) {
      setModal({
        type: "err",
        text: "Заповніть коректно поля та повторіть спробу.",
      });
      return;
    }

    try {
      setSending(true);
      const res = await fetch(submitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      setName("");
      setPhone("+380");
      setModal({ type: "ok", text: "Ми скоро з вами зв’яжемося." });
    } catch {
      setModal({ type: "err", text: "Сталася помилка. Спробуйте ще раз." });
    } finally {
      setSending(false);
    }
  };

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 5, md: 10 },
        background: "transparent",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
        <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ textAlign: "center" }}>
          <Typography
            component="h2"
            variant="h4"
            sx={{
              fontWeight: 1000,
              letterSpacing: -0.4,
              color: russet,
              fontSize: { xs: 22, sm: 26, md: 32 },
              lineHeight: { xs: 1.2, md: 1.15 },
            }}
          >
            {title}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mx: "auto",
              maxWidth: 560,
              fontSize: { xs: 14, sm: 15.5 },
            }}
          >
            {subtitle}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            autoComplete="off"
          >
            <Stack spacing={{ xs: 1.25, sm: 1.5 }}>
              <TextField
                label="Ваше ім’я"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                disabled={sending}
                size="medium"
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  autoCapitalize: "words",
                  autoCorrect: "off",
                  name: "name",
                }}
              />
              <TextField
                label="Телефон"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                fullWidth
                size="medium"
                inputMode="tel"
                placeholder="+380 00 000 00 00"
                helperText="У форматі +380…"
                disabled={sending}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  autoComplete: "tel",
                  name: "phone",
                  enterKeyHint: "send",
                }}
                FormHelperTextProps={{
                  sx: { mt: 0.25, fontSize: { xs: 11.5, sm: 12 } },
                }}
              />

              <AnimatedCta
                type="submit"
                anim="pulse"
                disabled={sending}
                sx={{
                  mt: 0.5,
                  borderRadius: 2,
                  px: { xs: 2.25, sm: 3 },
                  py: { xs: 1, sm: 1.3 },
                  width: "100%",
                  "@media (prefers-reduced-motion: reduce)": {
                    animation: "none !important",
                    "&::before,&::after": { animation: "none !important" },
                  },
                }}
              >
                Зателефонуйте мені
              </AnimatedCta>
            </Stack>
          </Box>
        </Stack>
      </Container>

      {modal && (
        <Box
          onClick={closeModal}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1300,
            display: "grid",
            placeItems: "center",
            backdropFilter: "blur(6px)",
            background: "rgba(0,0,0,.25)",
            // чтобы на маленьких экранах можно было прокрутить диалог
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-live="polite"
            sx={{
              mx: 2,
              my: { xs: 4, md: 6 },
              maxWidth: 520,
              width: "100%",
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              bgcolor: "#fff",
              textAlign: "center",
              boxShadow: "0 30px 70px rgba(0,0,0,.25)",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                mb: 0.75,
                fontSize: { xs: 16, sm: 18 },
              }}
            >
              {modal.type === "ok"
                ? "Дякуємо за заявку!"
                : "Перевірте ім’я та телефон"}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ fontSize: { xs: 13.5, sm: 14.5 } }}
            >
              {modal.text}
            </Typography>
            <Typography
              sx={{
                mt: 1.25,
                fontSize: 12,
                opacity: 0.7,
                display: { xs: "none", sm: "block" },
              }}
            >
              Вікно закриється автоматично або натисніть будь-де.
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
