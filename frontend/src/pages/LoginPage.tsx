import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { ApiError } from "../errors/api-error.ts";
import { useAuth } from "../features/auth/useAuth.ts";
import { login, register } from "../services/endpoints/auth.ts";
import { validationMessages } from "../services/auth/normalize-auth.ts";
import { saveSession } from "../services/auth/session.ts";
import { addCartItem, type AddCartItemInput } from "../services/endpoints/cart.ts";
import { safeRedirect } from "../utils/safe-redirect.ts";

type Mode = "sign-in" | "create-account";

export function LoginPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = safeRedirect(readFrom(location.state));
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [arrivedSignedIn] = useState(user !== null);

  if (arrivedSignedIn) {
    return <Navigate to={redirectTo ?? "/"} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(mode, email, password, confirmPassword);
    setFieldErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setPending(true);
    try {
      const credentials = { email: email.trim(), password };
      if (mode === "create-account") {
        const session = await register({ ...credentials, confirmPassword });
        if (!session) {
          setMode("sign-in");
          setPassword("");
          setConfirmPassword("");
          setNotice("Account created. Sign in with the same email and password.");
          return;
        }
        saveSession(session.accessToken, session.user);
      } else {
        const session = await login(credentials);
        saveSession(session.accessToken, session.user);
      }
      await continueAfterSignIn(location.state, navigate);
    } catch (error) {
      if (error instanceof ApiError) {
        const messages = validationMessages(error.details);
        setFieldErrors(messages);
        if (!messages.email && !messages.password && !messages.confirmPassword) {
          setFormError(messages.form ?? error.message);
        }
      } else {
        setFormError("Sign-in could not be completed.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-md flex-col px-4 py-12">
      <Link to="/" className="text-xl font-semibold text-primary">
        MegaMart
      </Link>
      <h1 className="mt-6 text-2xl font-semibold text-ink">
        {mode === "sign-in" ? "Sign in" : "Create account"}
      </h1>
      <p className="mt-2 text-sm text-muted">Use the email and password for your MegaMart account.</p>
      {notice ? (
        <p className="mt-4 rounded-xl bg-surface px-3 py-2 text-sm text-ink" role="status">
          {notice}
        </p>
      ) : null}
      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          error={fieldErrors.email}
          onChange={setEmail}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          value={password}
          error={fieldErrors.password}
          onChange={setPassword}
        />
        {mode === "create-account" ? (
          <Field
            id="confirm-password"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            error={fieldErrors.confirmPassword}
            onChange={setConfirmPassword}
          />
        ) : null}
        {formError ? (
          <p className="text-sm text-danger" role="alert">
            {formError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}
        </button>
      </form>
      <button
        type="button"
        className="mt-4 text-left text-sm font-medium text-primary hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={() => {
          setMode((current) => (current === "sign-in" ? "create-account" : "sign-in"));
          setFormError(null);
          setNotice(null);
          setFieldErrors({});
        }}
      >
        {mode === "sign-in" ? "Need an account? Create one" : "Already have an account? Sign in"}
      </button>
    </section>
  );
}

function Field({
  id,
  label,
  type,
  autoComplete,
  value,
  error,
  onChange,
}: {
  id: string;
  label: string;
  type: string;
  autoComplete: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-line bg-canvas px-3 text-sm text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      />
      {error ? (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function validate(mode: Mode, email: string, password: string, confirmPassword: string): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Enter a valid email.";
  }
  if (password.length < 8) {
    errors.password = "Use at least 8 characters.";
  }
  if (mode === "create-account" && password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }
  return errors;
}

function readFrom(state: unknown): unknown {
  if (typeof state !== "object" || state === null || !("from" in state)) {
    return null;
  }
  return state.from;
}

function readPendingItem(state: unknown): AddCartItemInput | null {
  if (typeof state !== "object" || state === null || !("pendingItem" in state)) {
    return null;
  }
  const item = state.pendingItem;
  if (typeof item !== "object" || item === null || !("variantId" in item) || !("qty" in item)) {
    return null;
  }
  if (typeof item.variantId !== "string" || typeof item.qty !== "number" || item.qty < 1) {
    return null;
  }
  return { variantId: item.variantId, qty: item.qty };
}

async function continueAfterSignIn(
  state: unknown,
  navigate: ReturnType<typeof useNavigate>,
): Promise<void> {
  const pending = readPendingItem(state);
  const destination = safeRedirect(readFrom(state)) ?? "/";
  if (!pending) {
    navigate(destination, { replace: true });
    return;
  }

  try {
    await addCartItem(pending);
    navigate("/cart", { replace: true });
  } catch {
    navigate(destination, { replace: true });
  }
}
