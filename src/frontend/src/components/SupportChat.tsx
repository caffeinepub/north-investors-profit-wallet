import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageRole = "bot" | "user";
type ChatStep = "greeting" | "followup" | "resolution" | "done";

interface Message {
  id: number;
  role: MessageRole;
  text: string;
}

type SupportTopic =
  | "withdrawal"
  | "deposit"
  | "account"
  | "returns"
  | "payment"
  | "other";

const QUICK_REPLIES: { label: string; topic: SupportTopic }[] = [
  { label: "Withdrawal Issues", topic: "withdrawal" },
  { label: "Deposit Questions", topic: "deposit" },
  { label: "Account Access", topic: "account" },
  { label: "Investment Returns", topic: "returns" },
  { label: "Payment Methods", topic: "payment" },
  { label: "Other / General Inquiry", topic: "other" },
];

const FOLLOW_UP_RESPONSES: Record<SupportTopic, string> = {
  withdrawal:
    "I understand you're having trouble with a withdrawal. Can you tell me the amount and when you initiated it?",
  deposit:
    "Happy to help with deposits. What method were you using — Bitcoin, USDT, or card?",
  account:
    "Let me help you with your account. Are you having trouble logging in, or is there something else?",
  returns:
    "I can help with your returns. Are you asking about your current balance, a specific transaction, or expected returns?",
  payment:
    "We support Bitcoin, USDT (TRC-20/ERC-20), and card payments. What would you like to know?",
  other:
    "Of course! Please describe your issue and our team will assist you as quickly as possible.",
};

const RESOLUTION_MSG =
  "Thank you for the details. Our support team has been notified and will follow up within 24 hours. For urgent matters, please include your account email in your next message. Is there anything else I can help with?";

const GREETING_MSG =
  "Hello! Welcome to North Investors Profit Wallet Support. I'm here to assist you. What brings you here today?";

let msgIdCounter = 0;
function nextId() {
  return ++msgIdCounter;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function BotBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 max-w-[90%]">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
        style={{ background: "#D4AF37", color: "#0B1220" }}
      >
        N
      </div>
      <div
        className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed"
        style={{
          background: "#16263E",
          color: "#F2F5FA",
          border: "1px solid #22324A",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed"
        style={{ background: "#1A5CB8", color: "#F2F5FA" }}
      >
        {text}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function SupportChat({
  triggerOpen,
  onTriggered,
}: { triggerOpen?: boolean; onTriggered?: () => void } = {}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<ChatStep>("greeting");
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Open chat when triggered externally (e.g. from Settings Contact Support)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional trigger pattern
  useEffect(() => {
    if (triggerOpen) {
      setOpen(true);
      onTriggered?.();
    }
  }, [triggerOpen]);

  // Send initial greeting when chat opens for first time
  useEffect(() => {
    if (open && messages.length === 0) {
      setIsTyping(true);
      const t = setTimeout(() => {
        setMessages([{ id: nextId(), role: "bot", text: GREETING_MSG }]);
        setIsTyping(false);
        setStep("greeting");
      }, 600);
      return () => clearTimeout(t);
    }
  }, [open, messages.length]);

  // Auto-scroll to bottom on new messages
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message or typing changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  function appendMessage(role: MessageRole, text: string) {
    setMessages((prev) => [...prev, { id: nextId(), role, text }]);
  }

  function botReply(text: string, delay = 800) {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      appendMessage("bot", text);
    }, delay);
  }

  function handleQuickReply(topic: SupportTopic) {
    const label = QUICK_REPLIES.find((q) => q.topic === topic)?.label ?? "";
    appendMessage("user", label);
    botReply(FOLLOW_UP_RESPONSES[topic]);
    setStep("followup");
  }

  function handleSend() {
    const text = inputValue.trim();
    if (!text) return;
    appendMessage("user", text);
    setInputValue("");

    if (step === "greeting" || step === "followup") {
      botReply(RESOLUTION_MSG);
      setStep("resolution");
    } else if (step === "resolution") {
      botReply(
        "Thank you! If you have further questions, feel free to start a new session. Our team is always here to help.",
      );
      setStep("done");
    } else {
      botReply(
        "Thank you for reaching out. Our support team will get back to you shortly.",
      );
    }
  }

  function handleReset() {
    setMessages([]);
    setStep("greeting");
    setInputValue("");
    // Re-trigger greeting
    setIsTyping(true);
    setTimeout(() => {
      setMessages([{ id: nextId(), role: "bot", text: GREETING_MSG }]);
      setIsTyping(false);
      setStep("greeting");
    }, 400);
  }

  function handleClose() {
    setOpen(false);
  }

  const showQuickReplies =
    step === "greeting" && !isTyping && messages.length > 0;
  const showResolutionButtons =
    step === "resolution" &&
    !isTyping &&
    messages.some((m) => m.role === "bot" && m.text === RESOLUTION_MSG);

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #D4AF37 0%, #B8972A 100%)",
          boxShadow: "0 4px 24px rgba(212,175,55,0.4)",
        }}
        type="button"
        aria-label="Open support chat"
        data-ocid="support.open_modal_button"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" style={{ color: "#0B1220" }} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="w-6 h-6" style={{ color: "#0B1220" }} />
            </motion.div>
          )}
        </AnimatePresence>
        {!open && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
            style={{ background: "#EF4444", color: "white" }}
          >
            1
          </span>
        )}
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[520px] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: "#0F1B2D",
              border: "1px solid #22324A",
              boxShadow:
                "0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.12)",
            }}
            data-ocid="support.dialog"
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #121F33 0%, #16263E 100%)",
                borderBottom: "1px solid #22324A",
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: "#D4AF37", color: "#0B1220" }}
              >
                N
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm font-semibold"
                  style={{ color: "#F2F5FA" }}
                >
                  NIPW Support
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs" style={{ color: "#A9B4C6" }}>
                    Online — typically replies instantly
                  </span>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                type="button"
                aria-label="Close chat"
                data-ocid="support.close_button"
              >
                <X className="w-4 h-4" style={{ color: "#A9B4C6" }} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
              style={{ maxHeight: "340px" }}
            >
              {messages.map((msg) =>
                msg.role === "bot" ? (
                  <BotBubble key={msg.id} text={msg.text} />
                ) : (
                  <UserBubble key={msg.id} text={msg.text} />
                ),
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-start gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: "#D4AF37", color: "#0B1220" }}
                  >
                    N
                  </div>
                  <div
                    className="rounded-2xl rounded-tl-sm px-4 py-2.5"
                    style={{
                      background: "#16263E",
                      border: "1px solid #22324A",
                    }}
                  >
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: "#D4AF37" }}
                          animate={{ y: [0, -4, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.15,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick reply buttons */}
              {showQuickReplies && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {QUICK_REPLIES.map((qr) => (
                    <button
                      key={qr.topic}
                      onClick={() => handleQuickReply(qr.topic)}
                      className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:brightness-110 active:scale-95"
                      style={{
                        background: "rgba(212,175,55,0.12)",
                        border: "1px solid rgba(212,175,55,0.35)",
                        color: "#D4AF37",
                      }}
                      type="button"
                      data-ocid={`support.${qr.topic}.button`}
                    >
                      {qr.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Resolution action buttons */}
              {showResolutionButtons && (
                <div className="flex flex-col gap-2 mt-1">
                  <button
                    onClick={handleReset}
                    className="w-full text-xs px-3 py-2 rounded-lg font-medium transition-all hover:brightness-110"
                    style={{
                      background: "rgba(212,175,55,0.12)",
                      border: "1px solid rgba(212,175,55,0.35)",
                      color: "#D4AF37",
                    }}
                    type="button"
                    data-ocid="support.another_question.button"
                  >
                    Yes, I have another question
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-full text-xs px-3 py-2 rounded-lg font-medium transition-all hover:brightness-110"
                    style={{
                      background: "rgba(34,50,74,0.6)",
                      border: "1px solid #22324A",
                      color: "#A9B4C6",
                    }}
                    type="button"
                    data-ocid="support.no_thanks.button"
                  >
                    No, thank you
                  </button>
                </div>
              )}
            </div>

            {/* Input */}
            <div
              className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
              style={{ borderTop: "1px solid #22324A", background: "#0B1220" }}
            >
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message…"
                className="flex-1 text-sm h-9 rounded-xl"
                style={{
                  background: "#16263E",
                  border: "1px solid #22324A",
                  color: "#F2F5FA",
                }}
                data-ocid="support.input"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="w-9 h-9 rounded-xl flex-shrink-0 transition-all hover:brightness-110 active:scale-95"
                style={{
                  background: inputValue.trim() ? "#D4AF37" : "#16263E",
                  border: "1px solid #22324A",
                }}
                type="button"
                data-ocid="support.submit_button"
              >
                <Send
                  className="w-4 h-4"
                  style={{ color: inputValue.trim() ? "#0B1220" : "#A9B4C6" }}
                />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
