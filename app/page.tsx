import { FormEvent, useEffect, useMemo, useState } from "react";

type Method = "card" | "paypal" | "apple";
type PaymentState = "idle" | "processing" | "approved";
type BrandKey = "visa" | "mastercard" | "amex" | "elo" | "hipercard" | "discover" | "jcb" | "unionpay" | "generic";

type CardBrand = {
  key: BrandKey;
  name: string;
  short: string;
  firstDigit: string;
  cardLength: number;
  cvvLength: number;
  gradient: string;
};

const brands: CardBrand[] = [
  { key: "visa", name: "Visa", short: "VISA", firstDigit: "1", cardLength: 16, cvvLength: 3, gradient: "linear-gradient(145deg,#14279b 0%,#3458ee 52%,#172fbd 100%)" },
  { key: "mastercard", name: "Mastercard", short: "mastercard", firstDigit: "2", cardLength: 16, cvvLength: 3, gradient: "linear-gradient(145deg,#111318 0%,#292c34 55%,#13151b 100%)" },
  { key: "amex", name: "American Express", short: "AMEX", firstDigit: "3", cardLength: 15, cvvLength: 4, gradient: "linear-gradient(145deg,#0877a8 0%,#12a9c6 54%,#056689 100%)" },
  { key: "elo", name: "Elo", short: "elo", firstDigit: "4", cardLength: 16, cvvLength: 3, gradient: "linear-gradient(145deg,#17181d 0%,#343841 58%,#15161b 100%)" },
  { key: "hipercard", name: "Hipercard", short: "HIPER", firstDigit: "5", cardLength: 16, cvvLength: 3, gradient: "linear-gradient(145deg,#a90d1a 0%,#e42638 52%,#920614 100%)" },
  { key: "discover", name: "Discover", short: "DISCOVER", firstDigit: "6", cardLength: 16, cvvLength: 3, gradient: "linear-gradient(145deg,#272a31 0%,#535967 55%,#24272e 100%)" },
  { key: "jcb", name: "JCB", short: "JCB", firstDigit: "7", cardLength: 16, cvvLength: 3, gradient: "linear-gradient(145deg,#114c91 0%,#2382c7 53%,#123d7a 100%)" },
  { key: "unionpay", name: "UnionPay", short: "UP", firstDigit: "8", cardLength: 16, cvvLength: 3, gradient: "linear-gradient(145deg,#006b74 0%,#00a29b 53%,#005b65 100%)" },
];

const genericBrand: CardBrand = { key: "generic", name: "Bandeira", short: "", firstDigit: "", cardLength: 16, cvvLength: 3, gradient: "linear-gradient(145deg,#1828ae 0%,#4f6dff 54%,#2647e7 100%)" };

const Icon = ({ name }: { name: string }) => {
  const paths: Record<string, React.ReactNode> = {
    shield: <><path d="M12 3 5 6v5c0 4.55 2.98 8.17 7 9.5 4.02-1.33 7-4.95 7-9.5V6l-7-3Z"/><path d="m9.5 12 1.7 1.7 3.8-4"/></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18M7 15h4"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    bag: <><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    arrow: <path d="m9 18 6-6-6-6"/>,
    back: <path d="m15 18-6-6 6-6"/>,
    spark: <><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z"/><path d="m18.5 15 .7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1Z"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
};

const AppleLogo = ({ className = "" }: { className?: string }) => (
  <svg
    className={`apple-logo ${className}`}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
    />
  </svg>
);

const BrandMark = ({ brand, compact = false }: { brand: CardBrand; compact?: boolean }) => {
  if (brand.key === "mastercard") {
    return <span className={`brand-logo mastercard-logo ${compact ? "compact" : ""}`} aria-label="Mastercard"><i/><i/><small>mastercard</small></span>;
  }
  if (brand.key === "elo") {
    return <span className={`brand-logo elo-logo ${compact ? "compact" : ""}`} aria-label="Elo"><i/>elo</span>;
  }
  if (brand.key === "discover") {
    return <span className={`brand-logo discover-logo ${compact ? "compact" : ""}`} aria-label="Discover">DISC<span>O</span>VER</span>;
  }
  return <span className={`brand-logo text-logo brand-${brand.key} ${compact ? "compact" : ""}`}>{brand.short}</span>;
};

const brandFromNumber = (value: string) => {
  const first = value.replace(/\D/g, "").charAt(0);
  return brands.find((brand) => brand.firstDigit === first) ?? genericBrand;
};

const formatCard = (value: string) => {
  const digits = value.replace(/\D/g, "");
  const brand = brandFromNumber(digits);
  const limited = digits.slice(0, brand.cardLength);
  if (brand.key === "amex") {
    return [limited.slice(0, 4), limited.slice(4, 10), limited.slice(10, 15)].filter(Boolean).join(" ");
  }
  return limited.replace(/(.{4})/g, "$1 ").trim();
};

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
};

export default function Home() {
  const [method, setMethod] = useState<Method>("card");
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [focused, setFocused] = useState("number");
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [couponOpen, setCouponOpen] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(false);

  const brand = useMemo(() => brandFromNumber(number), [number]);
  const digits = number.replace(/\D/g, "");
  const maskedNumber = number || "•••• •••• •••• ••••";
  const cvvDisplay = cvv ? "•".repeat(cvv.length) : "•••";
  const subtotal = quantity * 189;
  const total = discount ? subtotal * .9 : subtotal;
  const money = (value: number) => `€ ${value.toFixed(2).replace(".", ",")}`;

  useEffect(() => {
    if (paymentState !== "processing") return;
    const timer = window.setTimeout(() => setPaymentState("approved"), 2700);
    return () => window.clearTimeout(timer);
  }, [paymentState]);

  const pay = (event: FormEvent) => {
    event.preventDefault();
    if (method === "card" && (digits.length !== brand.cardLength || !name.trim() || expiry.replace(/\D/g, "").length < 4 || cvv.length !== brand.cvvLength)) {
      setError(`Complete os dados do cartão. ${brand.name === "Bandeira" ? "Digite primeiro o número para identificar a bandeira." : `${brand.name} usa ${brand.cardLength} números e CVV de ${brand.cvvLength} dígitos.`}`);
      return;
    }
    setError("");
    setFocused("number");
    setPaymentState("processing");
  };

  const reset = () => {
    setPaymentState("idle");
    setMethod("card");
    setNumber("");
    setExpiry("");
    setCvv("");
  };

  return (
    <main className="checkout-page">
      <header className="topbar">
        <a className="brand" href="#" aria-label="X7RG início"><span className="brand-mark">X</span><span>X7RG</span></a>
        <div className="secure-note"><Icon name="lock" /> Checkout protegido</div>
        <button className="bag-button" aria-label="Abrir carrinho"><Icon name="bag" /><span>1</span></button>
      </header>

      <section className="checkout-shell">
        <div className="intro-row">
          <div>
            <button className="back-link"><Icon name="back" /> Voltar à loja</button>
            <p className="eyebrow">PROTÓTIPO INTERATIVO</p>
            <h1>Seu pedido, a um passo.</h1>
            <p className="subtitle">Digite os dados e acompanhe cada detalhe da experiência.</p>
          </div>
          <div className="steps" aria-label="Etapas da compra">
            <span className="step done"><b><Icon name="check" /></b> Carrinho</span><i />
            <span className="step active"><b>2</b> Pagamento</span><i />
            <span className="step"><b>3</b> Confirmação</span>
          </div>
        </div>

        <div className="checkout-grid">
          <form className="payment-panel" onSubmit={pay}>
            <div className="section-heading">
              <span>01</span>
              <div><h2>Forma de pagamento</h2><p>Escolha sua opção preferida</p></div>
            </div>

            <div className="method-tabs" role="tablist" aria-label="Formas de pagamento">
              <button type="button" className={method === "card" ? "selected" : ""} onClick={() => setMethod("card")}><Icon name="card" /><span>Cartão</span><b /></button>
              <button type="button" className={method === "paypal" ? "selected" : ""} onClick={() => setMethod("paypal")}><strong className="paypal-p">P</strong><span>PayPal</span><b /></button>
              <button type="button" className={method === "apple" ? "selected" : ""} onClick={() => setMethod("apple")}><AppleLogo className="apple-logo-tab" /><span>Apple Pay</span><b /></button>
            </div>

            {method === "card" ? (
              <div className="card-content">
                <div className="card-payment">
                  <div className={`card-scene ${focused === "cvv" ? "is-flipped" : ""}`} aria-label={focused === "cvv" ? "Verso do cartão" : "Frente do cartão"}>
                    <div className="card-rotator">
                      <div className={`live-card card-face card-front focus-${focused}`} style={{ background: brand.gradient }}>
                        <div className="card-top"><span className="chip"><i/><i/><i/></span><span className="contactless">)))</span></div>
                        <div className="card-number">{maskedNumber}</div>
                        <div className="card-meta"><div><small>TITULAR</small><span>{name || "SEU NOME"}</span></div><div><small>VALIDADE</small><span>{expiry || "MM / AA"}</span></div><BrandMark brand={brand} /></div>
                        <span className="card-glow one"/><span className="card-glow two"/>
                      </div>
                      <div className="live-card card-face card-back" style={{ background: brand.gradient }}>
                        <div className="magnetic-stripe"/>
                        <div className="signature-row"><span>ASSINATURA AUTORIZADA</span><strong>{cvvDisplay}</strong></div>
                        <div className="card-back-footer"><p>O código de segurança fica no verso do cartão.</p><BrandMark brand={brand} compact /></div>
                        <span className="card-glow one"/><span className="card-glow two"/>
                      </div>
                    </div>
                    <span className="flip-hint">{focused === "cvv" ? "Verso · código de segurança" : brand.key === "generic" ? "Digite o primeiro número" : `${brand.name} identificada`}</span>
                  </div>

                  <div className="fields">
                    <label className="field full"><span>Número do cartão</span><div><Icon name="card" /><input aria-label="Número do cartão" inputMode="numeric" autoComplete="cc-number" placeholder="•••• •••• •••• ••••" value={number} onFocus={() => setFocused("number")} onChange={(e) => { const nextNumber = formatCard(e.target.value); const nextBrand = brandFromNumber(nextNumber); setNumber(nextNumber); setCvv((value) => value.slice(0, nextBrand.cvvLength)); }} /><em>{brand.key === "generic" ? "AUTO" : brand.short}</em></div></label>
                    <label className="field full"><span>Nome impresso no cartão</span><div><input aria-label="Nome impresso no cartão" autoComplete="cc-name" placeholder="Seu nome" value={name} onFocus={() => setFocused("name")} onChange={(e) => setName(e.target.value.slice(0, 28))} /></div></label>
                    <label className="field"><span>Validade</span><div><input aria-label="Validade" inputMode="numeric" autoComplete="cc-exp" placeholder="MM / AA" value={expiry} onFocus={() => setFocused("expiry")} onChange={(e) => setExpiry(formatExpiry(e.target.value))} /></div></label>
                    <label className="field"><span>CVV</span><div><input aria-label="CVV" inputMode="numeric" autoComplete="cc-csc" type="password" placeholder={"•".repeat(brand.cvvLength)} value={cvv} onFocus={() => setFocused("cvv")} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, brand.cvvLength))} /><span className="help">?</span></div></label>
                  </div>
                </div>

              </div>
            ) : (
              <div className={`express-pay ${method}`}>
                <div className="express-icon">{method === "paypal" ? "P" : <AppleLogo className="apple-logo-panel" />}</div>
                <h3>Pagar com {method === "paypal" ? "PayPal" : "Apple Pay"}</h3>
                <p>Você será conectado com segurança para confirmar o pagamento.</p>
              </div>
            )}

            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="assurance"><Icon name="shield" /><span><strong>Experiência demonstrativa</strong>Nenhum dado é enviado e nenhum pagamento é processado.</span></div>
          </form>

          <aside className="summary-panel">
            <div className="section-heading compact"><span>02</span><div><h2>Resumo do pedido</h2><p>{quantity} {quantity === 1 ? "item" : "itens"} no carrinho</p></div></div>
            <div className="product-card">
              <div className="product-visual" aria-hidden="true"><span className="product-orbit"/><strong>X7</strong><small>AIR</small></div>
              <div className="product-info"><span className="product-tag">EDIÇÃO LIMITADA</span><h3>X7RG ENTERPRISE</h3><p>Graphite · Tamanho único</p><div><button type="button" aria-label="Diminuir quantidade" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button><span>{quantity}</span><button type="button" aria-label="Aumentar quantidade" onClick={() => setQuantity((value) => Math.min(5, value + 1))}>+</button></div></div>
              <strong className="product-price">{money(subtotal)}</strong>
            </div>
            <button type="button" className={`coupon ${couponOpen ? "open" : ""}`} onClick={() => setCouponOpen((value) => !value)}><span><Icon name="spark" /> {discount ? "Cupom X7RG007 aplicado" : "Adicionar cupom"}</span><Icon name="arrow" /></button>
            {couponOpen && <div className="coupon-box"><input aria-label="Código do cupom" placeholder="Digite X7RG007" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase().slice(0, 12))}/><button type="button" onClick={() => setDiscount(coupon.trim().toUpperCase() === "X7RG007")}>{discount ? "Aplicado" : "Aplicar"}</button></div>}
            <div className="totals">
              <p><span>Subtotal</span><strong>{money(subtotal)}</strong></p>
              <p><span>Envio expresso</span><strong className="free">GRÁTIS</strong></p>
              {discount && <p><span>Desconto X7RG007</span><strong className="discount">− {money(subtotal * .1)}</strong></p>}
              <p className="total"><span>Total <small>IVA incluído</small></span><strong>{money(total)}</strong></p>
            </div>
            <button className={`pay-button ${method}`} type="button" onClick={(e) => pay(e as unknown as FormEvent)}>
              <span>{method === "apple" && <AppleLogo className="apple-logo-button" />}{method === "card" ? "Pagar agora" : `Pagar com ${method === "paypal" ? "PayPal" : "Apple Pay"}`}</span><strong>{money(total)}</strong><Icon name="arrow" />
            </button>
            <p className="demo-note">Protótipo educativo — nenhum pagamento real será processado.</p>
          </aside>
        </div>
      </section>

      {paymentState !== "idle" && (
        <div className={`payment-overlay ${paymentState}`} role="dialog" aria-modal="true" aria-label="Status do pagamento">
          <div className="overlay-noise" />
          {paymentState === "processing" ? (
            <div className="status-card processing-status">
              <div className="processing-card" style={{ background: brand.gradient }}>
                <div className="mini-chip"/><span>X7RG</span><p>{maskedNumber}</p><BrandMark brand={brand} compact />
              </div>
              <div className="pulse-ring one"/><div className="pulse-ring two"/>
              <div className="loader"><i/><i/><i/></div>
              <p className="status-kicker">AUTORIZAÇÃO SEGURA</p>
              <h2>Processando seu pagamento</h2>
              <p className="status-copy">A maquininha está confirmando a transação demonstrativa.</p>
            </div>
          ) : (
            <div className="terminal-stage">
              <div className="payment-terminal">
                <div className="terminal-top"><span>X7RG ENTERPRISE</span><i/><i/><i/></div>
                <div className="terminal-screen">
                  <div className="success-mark"><Icon name="check" /></div>
                  <p>APROVADO</p><strong>{money(total)}</strong>
                </div>
                <div className="printer-slot"><i/></div>
                <div className="receipt-paper">
                  <div className="receipt-logo">X7RG</div>
                  <p className="receipt-title">COMPROVANTE</p>
                  <p>DEMONSTRAÇÃO · SEM VALOR FISCAL</p>
                  <span className="receipt-dash"/>
                  <div><span>PEDIDO</span><strong>#X7-2048</strong></div>
                  <div><span>BANDEIRA</span><strong>{brand.name}</strong></div>
                  <div><span>CARTÃO</span><strong>•••• {digits.slice(-4)}</strong></div>
                  <div><span>VALOR</span><strong>{money(total)}</strong></div>
                  <span className="receipt-dash"/>
                  <b>PAGAMENTO APROVADO</b>
                  <small>Obrigado por testar esta experiência.</small>
                </div>
              </div>
              <div className="terminal-message">
                <p className="status-kicker">PAGAMENTO APROVADO</p>
                <h2>Pedido confirmado!</h2>
                <p className="status-copy">O comprovante acabou de sair da maquininha.</p>
                <button className="success-button" onClick={reset}>Voltar para suas compras <Icon name="arrow" /></button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
